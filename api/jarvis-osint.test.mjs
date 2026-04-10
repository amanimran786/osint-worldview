import { strict as assert } from 'node:assert';
import test from 'node:test';
import handler from './jarvis-osint.js';

function makeRequest(method = 'POST', body = null) {
  return new Request('https://worldmonitor.app/api/jarvis-osint', {
    method,
    headers: { 'content-type': 'application/json', origin: 'https://worldmonitor.app' },
    body: body == null ? undefined : JSON.stringify(body),
  });
}

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
      JSON.stringify({ ok: true, status: { maigret: { available: true }, dnstwist: { available: true } } }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };

  try {
    const response = await handler(makeRequest('GET'));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.status.maigret.available, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
