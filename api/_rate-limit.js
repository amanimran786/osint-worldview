import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimiters = new Map();

function getRatelimit({ prefix = 'global', limit = 600, window = '60 s' } = {}) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cacheKey = `${prefix}:${limit}:${window}`;
  const cached = ratelimiters.get(cacheKey);
  if (cached) return cached;

  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `rl:${prefix}`,
    analytics: false,
  });
  ratelimiters.set(cacheKey, ratelimit);
  return ratelimit;
}

function getClientIp(request) {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function unavailableResponse(corsHeaders) {
  return new Response(JSON.stringify({ error: 'Rate limit service unavailable' }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders,
    },
  });
}

export async function checkRateLimit(request, corsHeaders = {}, options = {}) {
  const { failClosed = false, prefix = 'global' } = options;
  const rl = getRatelimit(options);
  if (!rl) return failClosed ? unavailableResponse(corsHeaders) : null;

  const ip = getClientIp(request);
  try {
    const { success, limit, reset } = await rl.limit(`${prefix}:${ip}`);

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
