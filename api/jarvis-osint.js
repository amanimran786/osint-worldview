export const config = { runtime: 'edge' };

import { getCorsHeaders, isDisallowedOrigin } from './_cors.js';
import { validateRequiredApiKey } from './_api-key.js';
import { checkRateLimit } from './_rate-limit.js';

const USERNAME_RE = /^[A-Za-z0-9._-]{1,64}$/;
const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const TARGET_RE = /^[^\s\x00-\x1f]{1,253}$/;

function boundedNumber(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function resolveJarvisChatUrl(rawBaseUrl) {
  const raw = String(rawBaseUrl || '').trim();
  if (!raw) return '';
  try {
    if (/\/chat\/?$/i.test(raw)) {
      return raw.replace(/\/+$/, '');
    }
    return new URL('/chat', raw).toString();
  } catch {
    return '';
  }
}

function resolveJarvisEndpoint(chatUrl, endpointPath) {
  const path = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  try {
    const parsed = new URL(chatUrl);
    if (/\/chat\/?$/i.test(parsed.pathname)) {
      parsed.pathname = parsed.pathname.replace(/\/chat\/?$/i, path);
      return parsed.toString();
    }
    return new URL(path, parsed).toString();
  } catch {
    return '';
  }
}

function normalizeDomain(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  let host = raw;
  if (raw.includes('://')) {
    try {
      host = new URL(raw).hostname.toLowerCase();
    } catch {
      return '';
    }
  } else {
    host = raw.split('/', 1)[0].split(':', 1)[0];
  }
  if (host.startsWith('www.')) host = host.slice(4);
  return DOMAIN_RE.test(host) ? host : '';
}

async function callJarvis(url, token, payload = null, method = 'POST', timeoutMs = 60_000) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const resp = await fetch(url, {
    method,
    headers,
    body: payload == null ? undefined : JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });

  let data = null;
  try {
    data = await resp.json();
  } catch {
    data = null;
  }

  if (!resp.ok) {
    return {
      ok: false,
      status: resp.status,
      error: 'jarvis_upstream_error',
      detail: data || null,
    };
  }
  return data || { ok: false, error: 'invalid_json' };
}

export default async function handler(req) {
  if (isDisallowedOrigin(req)) {
    return new Response(JSON.stringify({ ok: false, error: 'origin_not_allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cors = getCorsHeaders(req, 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (process.env.JARVIS_OSINT_API_ENABLED !== 'true') {
    return new Response(JSON.stringify({ ok: false, error: 'jarvis_osint_disabled' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
    });
  }

  const apiKeyResult = validateRequiredApiKey(req);
  if (!apiKeyResult.valid) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: apiKeyResult.error === 'API key access is not configured' ? 503 : 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
    });
  }

  const rateLimitResponse = await checkRateLimit(req, cors, {
    prefix: 'jarvis-osint',
    limit: 10,
    window: '60 s',
    failClosed: process.env.VERCEL_ENV === 'production',
  });
  if (rateLimitResponse) return rateLimitResponse;

  const chatUrl = resolveJarvisChatUrl(process.env.JARVIS_API_URL);
  if (!chatUrl) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'jarvis_not_configured',
        message: 'Set JARVIS_API_URL to your Jarvis local API base URL.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...cors } },
    );
  }
  const token = String(process.env.JARVIS_API_TOKEN || '').trim();

  if (req.method === 'GET') {
    const statusUrl = resolveJarvisEndpoint(chatUrl, '/osint/status');
    const result = await callJarvis(statusUrl, token, null, 'GET', 20_000);
    return new Response(JSON.stringify(result), {
      status: result?.ok === false ? 502 : 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  let body = null;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const action = String(body?.action || '').trim().toLowerCase();
  if (action === 'username') {
    const username = String(body?.username || '').trim();
    if (!USERNAME_RE.test(username)) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_username' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
    const endpoint = resolveJarvisEndpoint(chatUrl, '/osint/username');
    const payload = {
      username,
      timeout_seconds: boundedNumber(body?.timeoutSeconds, 45, 5, 60),
      top_sites: boundedNumber(body?.topSites, 200, 1, 250),
      max_results: boundedNumber(body?.maxResults, 25, 1, 50),
    };
    const result = await callJarvis(endpoint, token, payload, 'POST', 90_000);
    return new Response(JSON.stringify(result), {
      status: result?.ok === false ? 502 : 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  if (action === 'domain_typos') {
    const domain = normalizeDomain(body?.domain || '');
    if (!domain) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_domain' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
    const endpoint = resolveJarvisEndpoint(chatUrl, '/osint/domain-typos');
    const payload = {
      domain,
      timeout_seconds: boundedNumber(body?.timeoutSeconds, 60, 5, 90),
      max_results: boundedNumber(body?.maxResults, 25, 1, 50),
      registered_only: body?.registeredOnly !== false,
    };
    const result = await callJarvis(endpoint, token, payload, 'POST', 90_000);
    return new Response(JSON.stringify(result), {
      status: result?.ok === false ? 502 : 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  if (action === 'subdomain') {
    const domain = normalizeDomain(body?.domain || '');
    if (!domain) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_domain' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
    const endpoint = resolveJarvisEndpoint(chatUrl, '/osint/subdomains');
    const payload = {
      domain,
      timeout_seconds: boundedNumber(body?.timeoutSeconds, 60, 5, 90),
      max_results: boundedNumber(body?.maxResults, 100, 1, 200),
      passive_only: body?.passiveOnly !== false,
    };
    const result = await callJarvis(endpoint, token, payload, 'POST', 120_000);
    return new Response(JSON.stringify(result), {
      status: result?.ok === false ? 502 : 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  if (action === 'whois') {
    const domain = normalizeDomain(body?.domain || '');
    if (!domain) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_domain' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
    const endpoint = resolveJarvisEndpoint(chatUrl, '/osint/whois');
    const payload = {
      domain,
      timeout_seconds: boundedNumber(body?.timeoutSeconds, 15, 5, 30),
    };
    const result = await callJarvis(endpoint, token, payload, 'POST', 30_000);
    return new Response(JSON.stringify(result), {
      status: result?.ok === false ? 502 : 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  if (action === 'worldview') {
    const target = String(body?.target || '').trim();
    if (!TARGET_RE.test(target)) {
      return new Response(JSON.stringify({ ok: false, error: target ? 'invalid_target' : 'missing_target' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
    const endpoint = resolveJarvisEndpoint(chatUrl, '/osint/worldview');
    const payload = {
      target,
      timeout_seconds: boundedNumber(body?.timeoutSeconds, 90, 10, 120),
      max_results_per_tool: boundedNumber(body?.maxResultsPerTool, 25, 1, 50),
      include_typos: body?.includeTypos === true,
    };
    const result = await callJarvis(endpoint, token, payload, 'POST', 150_000);
    return new Response(JSON.stringify(result), {
      status: result?.ok === false ? 502 : 200,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  return new Response(JSON.stringify({ ok: false, error: 'unsupported_action' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
