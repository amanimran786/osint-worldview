import { strict as assert } from 'node:assert';
import test from 'node:test';
import handler from './jarvis-osint.js';

const TEST_API_KEY = 'wm_test_key_1234567890abcdef';

function makeRequest(method = 'POST', body = null, apiKey = TEST_API_KEY) {
  const headers = {
    'content-type': 'application/json',
    origin: 'https://osint-worldview-cyan.vercel.app',
  };
  if (apiKey) headers['x-worldview-key'] = apiKey;
  return new Request('https://osint-worldview-cyan.vercel.app/api/jarvis-osint', {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
}

test.beforeEach(() => {
  process.env.JARVIS_OSINT_API_ENABLED = 'true';
  process.env.WORLDMONITOR_VALID_KEYS = TEST_API_KEY;
  delete process.env.VERCEL_ENV;
});

test.afterEach(() => {
  delete process.env.JARVIS_OSINT_API_ENABLED;
  delete process.env.WORLDMONITOR_VALID_KEYS;
  delete process.env.JARVIS_API_URL;
  delete process.env.JARVIS_API_TOKEN;
});

test('is disabled unless explicitly enabled', async () => {
  delete process.env.JARVIS_OSINT_API_ENABLED;
  const response = await handler(makeRequest('GET'));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'jarvis_osint_disabled');
});

test('requires an explicit API key even for the production browser origin', async () => {
  const response = await handler(makeRequest('GET', null, ''));
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, 'unauthorized');
});

test('rejects invalid username payloads', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  const response = await handler(makeRequest('POST', { action: 'username', username: 'bad user!' }));
  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.ok, false);
  assert.equal(payload.error, 'invalid_username');
});

test('proxies username scan to Jarvis OSINT endpoint', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  process.env.JARVIS_API_TOKEN = 'test-token';

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    assert.equal(url, 'http://127.0.0.1:8765/osint/username');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.headers.get('authorization'), 'Bearer test-token');
    return new Response(JSON.stringify({ ok: true, provider: 'maigret', found_count: 1 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const response = await handler(makeRequest('POST', { action: 'username', username: 'aman' }));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.provider, 'maigret');
    assert.equal(payload.found_count, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('proxies GET status to Jarvis osint status endpoint', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    assert.equal(url, 'http://127.0.0.1:8765/osint/status');
    return new Response(
      JSON.stringify({
        ok: true,
        status: {
          maigret: { available: true },
          dnstwist: { available: true },
          subfinder: { available: true },
          whois: { available: true },
        },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  try {
    const response = await handler(makeRequest('GET'));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.status.maigret.available, true);
    assert.equal(payload.status.subfinder.available, true);
    assert.equal(payload.status.whois.available, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects subdomain action with invalid domain', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  const response = await handler(makeRequest('POST', { action: 'subdomain', domain: 'not a domain' }));
  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.ok, false);
  assert.equal(payload.error, 'invalid_domain');
});

test('proxies subdomain action to Jarvis /osint/subdomains', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  process.env.JARVIS_API_TOKEN = 'test-token';

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    assert.equal(url, 'http://127.0.0.1:8765/osint/subdomains');
    const body = JSON.parse(init.body);
    assert.equal(body.domain, 'example.com');
    assert.equal(body.passive_only, true);
    return new Response(
      JSON.stringify({ ok: true, provider: 'subfinder', domain: 'example.com', subdomains: [], count: 0 }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  try {
    const response = await handler(makeRequest('POST', { action: 'subdomain', domain: 'example.com' }));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.provider, 'subfinder');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects whois action with invalid domain', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  const response = await handler(makeRequest('POST', { action: 'whois', domain: '' }));
  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.ok, false);
  assert.equal(payload.error, 'invalid_domain');
});

test('proxies whois action to Jarvis /osint/whois', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  process.env.JARVIS_API_TOKEN = 'test-token';

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    assert.equal(url, 'http://127.0.0.1:8765/osint/whois');
    const body = JSON.parse(init.body);
    assert.equal(body.domain, 'google.com');
    return new Response(
      JSON.stringify({ ok: true, provider: 'whois', domain: 'google.com', registrar: 'MarkMonitor Inc.' }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  try {
    const response = await handler(makeRequest('POST', { action: 'whois', domain: 'google.com' }));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.registrar, 'MarkMonitor Inc.');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects worldview action with missing target', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  const response = await handler(makeRequest('POST', { action: 'worldview', target: '' }));
  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.ok, false);
  assert.equal(payload.error, 'missing_target');
});

test('proxies worldview action to Jarvis /osint/worldview', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  process.env.JARVIS_API_TOKEN = 'test-token';

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    assert.equal(url, 'http://127.0.0.1:8765/osint/worldview');
    const body = JSON.parse(init.body);
    assert.equal(body.target, 'google.com');
    return new Response(
      JSON.stringify({
        ok: true,
        target: 'google.com',
        target_type: 'domain',
        intelligence: { whois: { ok: true } },
        tools_run: ['whois'],
        tools_failed: [],
        elapsed_seconds: 0.4,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  try {
    const response = await handler(makeRequest('POST', { action: 'worldview', target: 'google.com' }));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.target_type, 'domain');
    assert.deepEqual(payload.tools_run, ['whois']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('returns 400 for unsupported action', async () => {
  process.env.JARVIS_API_URL = 'http://127.0.0.1:8765';
  const response = await handler(makeRequest('POST', { action: 'unknown_thing' }));
  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.error, 'unsupported_action');
});
