export const config = { runtime: 'edge' };

import { getCorsHeaders, isDisallowedOrigin } from './_cors.js';

const USERNAME_RE = /^[A-Za-z0-9._-]{1,64}$/;
const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

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
      timeout_seconds: Number.isFinite(Number(body?.timeoutSeconds)) ? Number(body.timeoutSeconds) : 45,
      top_sites: Number.isFinite(Number(body?.topSites)) ? Number(body.topSites) : 200,
      max_results: Number.isFinite(Number(body?.maxResults)) ? Number(body.maxResults) : 25,
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
      timeout_seconds: Number.isFinite(Number(body?.timeoutSeconds)) ? Number(body.timeoutSeconds) : 60,
      max_results: Number.isFinite(Number(body?.maxResults)) ? Number(body.maxResults) : 25,
      registered_only: body?.registeredOnly !== false,
    };
    const result = await callJarvis(endpoint, token, payload, 'POST', 90_000);
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
