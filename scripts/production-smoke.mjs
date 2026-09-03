#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

export const DEFAULT_PUBLIC_URL = 'https://osint-worldview-cyan.vercel.app';

const normalizeBaseUrl = (value) => String(value || DEFAULT_PUBLIC_URL).replace(/\/+$/, '');

const buildHeaders = (baseUrl) => ({
  Accept: 'application/json',
  Origin: baseUrl,
  Referer: `${baseUrl}/`,
  'User-Agent': 'WorldView-Production-Smoke/1.0',
});

export function isVercelAuthProtectionBody(body) {
  if (typeof body !== 'string' || body.length === 0) return false;
  return body.includes('"vercel_auth_enabled":true');
}

export function shouldRetryWithFallback(error, baseUrl, fallbackBaseUrl) {
  return Boolean(error?.code === 'VERCEL_AUTH_PROTECTED' && fallbackBaseUrl && fallbackBaseUrl !== baseUrl);
}

async function request(baseUrl, path, attempts = 12) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: buildHeaders(baseUrl),
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
      });
      if (response.ok) return response;
      const body = await response.text();
      if (response.status === 401 && isVercelAuthProtectionBody(body)) {
        const error = new Error(`${path} returned HTTP 401 due to Vercel authentication protection`);
        error.code = 'VERCEL_AUTH_PROTECTED';
        throw error;
      }
      lastError = new Error(`${path} returned HTTP ${response.status}: ${body.slice(0, 300)}`);
    } catch (error) {
      lastError = error;
      if (lastError?.code === 'VERCEL_AUTH_PROTECTED') throw lastError;
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  throw lastError || new Error(`${path} did not respond`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runSmoke(baseUrl) {
  const root = await request(baseUrl, '/');
  assert(root.headers.get('x-content-type-options') === 'nosniff', 'root is missing X-Content-Type-Options');
  assert(root.headers.get('content-security-policy'), 'root is missing Content-Security-Policy');

  const version = await (await request(baseUrl, '/api/version')).json();
  assert(typeof version.version === 'string' && version.version.length > 0, 'version endpoint returned no version');

  const health = await (await request(baseUrl, '/api/health?compact=1')).json();
  assert(['HEALTHY', 'WARNING'].includes(health.status), `production health is ${health.status || 'unknown'}`);

  for (const tier of ['fast', 'slow']) {
    const bootstrap = await (await request(baseUrl, `/api/bootstrap?tier=${tier}`)).json();
    assert(bootstrap.data && Object.keys(bootstrap.data).length > 0, `${tier} bootstrap returned no data`);
  }

  await request(baseUrl, '/api/military-flights');
  await request(baseUrl, '/api/telegram-feed?limit=1');

  return { version: version.version, health: health.status };
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.env.WORLDVIEW_PRODUCTION_URL);
  const fallbackBaseUrl = normalizeBaseUrl(process.env.WORLDVIEW_PRODUCTION_FALLBACK_URL);

  let usedBaseUrl = baseUrl;
  let result;
  try {
    result = await runSmoke(baseUrl);
  } catch (error) {
    if (!shouldRetryWithFallback(error, baseUrl, fallbackBaseUrl)) throw error;
    usedBaseUrl = fallbackBaseUrl;
    console.warn(`Primary smoke URL is auth-protected; retrying with fallback URL ${fallbackBaseUrl}`);
    result = await runSmoke(fallbackBaseUrl);
  }

  console.log(JSON.stringify({
    status: 'ready',
    baseUrl: usedBaseUrl,
    version: result.version,
    health: result.health,
    checkedAt: new Date().toISOString(),
  }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
