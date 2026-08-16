import { strict as assert } from 'node:assert';
import test from 'node:test';
import handler from './cache-purge.js';

function request(secret, body) {
  const headers = { 'content-type': 'application/json' };
  if (secret) headers.authorization = `Bearer ${secret}`;
  return new Request('https://osint-worldview-cyan.vercel.app/api/cache-purge', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

test.afterEach(() => {
  delete process.env.CACHE_PURGE_SECRET;
  delete process.env.RELAY_SHARED_SECRET;
  delete process.env.VERCEL_ENV;
});

test('does not accept the relay secret for cache purge authority', async () => {
  process.env.RELAY_SHARED_SECRET = 'relay-secret';
  const response = await handler(request('relay-secret', { keys: ['news:test'], dryRun: true }));
  assert.equal(response.status, 401);
});

test('protects durable keys supplied through the explicit-key path', async () => {
  process.env.CACHE_PURGE_SECRET = 'purge-secret';
  const response = await handler(request('purge-secret', {
    keys: ['military:bases:active', 'conflict:ucdp-events:v1'],
    dryRun: true,
  }));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.matched, 0);
  assert.deepEqual(payload.keys, []);
});
