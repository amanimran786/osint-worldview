import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(600, '60 s'),
    prefix: 'rl',
    analytics: false,
  });
  return ratelimit;
}

function getClientIp(request: Request): string {
  // Only use headers supplied by the hosting edge. Client-controlled forwarding
  // headers must not create independent rate-limit buckets.
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function unavailableResponse(corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: 'Rate limit service unavailable' }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders,
    },
  });
}

export async function checkRateLimit(
  request: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const rl = getRatelimit();
  if (!rl) return null;

  const ip = getClientIp(request);

  try {
    const { success, limit, reset } = await rl.limit(ip);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          ...corsHeaders,
        },
      });
    }

    return null;
  } catch {
    return null;
  }
}

// --- Per-endpoint rate limiting ---

interface EndpointRatePolicy {
  limit: number;
  window: Duration;
}

const ENDPOINT_RATE_POLICIES: Record<string, EndpointRatePolicy> = {
  '/api/news/v1/summarize-article-cache': { limit: 3000, window: '60 s' },
  '/api/intelligence/v1/classify-event': { limit: 600, window: '60 s' },
};

const endpointLimiters = new Map<string, Ratelimit>();

function getEndpointRatelimit(pathname: string): Ratelimit | null {
  const policy = ENDPOINT_RATE_POLICIES[pathname];
  if (!policy) return null;

  const cached = endpointLimiters.get(pathname);
  if (cached) return cached;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const rl = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: 'rl:ep',
    analytics: false,
  });
  endpointLimiters.set(pathname, rl);
  return rl;
}

export function hasEndpointRatePolicy(pathname: string): boolean {
  return pathname in ENDPOINT_RATE_POLICIES;
}

export async function checkEndpointRateLimit(
  request: Request,
  pathname: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const rl = getEndpointRatelimit(pathname);
  const failClosed = process.env.VERCEL_ENV === 'production';
  if (!rl) return failClosed ? unavailableResponse(corsHeaders) : null;

  const ip = getClientIp(request);

  try {
    const { success, limit, reset } = await rl.limit(`${pathname}:${ip}`);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          ...corsHeaders,
        },
      });
    }

    return null;
  } catch {
    return failClosed ? unavailableResponse(corsHeaders) : null;
  }
}
