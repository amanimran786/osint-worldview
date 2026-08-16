#!/usr/bin/env node

const baseUrl = String(process.env.WORLDVIEW_PRODUCTION_URL || 'https://osint-worldview-cyan.vercel.app').replace(/\/+$/, '');
const headers = {
  Accept: 'application/json',
  Origin: baseUrl,
  Referer: `${baseUrl}/`,
  'User-Agent': 'WorldView-Production-Smoke/1.0',
};

async function request(path, attempts = 12) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
      });
      if (response.ok) return response;
      lastError = new Error(`${path} returned HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
  throw lastError || new Error(`${path} did not respond`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = await request('/');
assert(root.headers.get('x-content-type-options') === 'nosniff', 'root is missing X-Content-Type-Options');
assert(root.headers.get('content-security-policy'), 'root is missing Content-Security-Policy');

const version = await (await request('/api/version')).json();
assert(typeof version.version === 'string' && version.version.length > 0, 'version endpoint returned no version');

const health = await (await request('/api/health?compact=1')).json();
assert(['HEALTHY', 'WARNING'].includes(health.status), `production health is ${health.status || 'unknown'}`);

for (const tier of ['fast', 'slow']) {
  const bootstrap = await (await request(`/api/bootstrap?tier=${tier}`)).json();
  assert(bootstrap.data && Object.keys(bootstrap.data).length > 0, `${tier} bootstrap returned no data`);
}

await request('/api/military-flights');
await request('/api/telegram-feed?limit=1');

console.log(JSON.stringify({
  status: 'ready',
  baseUrl,
  version: version.version,
  health: health.status,
  checkedAt: new Date().toISOString(),
}));
