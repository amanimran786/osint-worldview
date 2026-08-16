import { strict as assert } from 'node:assert';
import test from 'node:test';
import bootstrapHandler from './bootstrap.js';
import healthHandler from './health.js';
import versionHandler from './version.js';
import { checkRateLimit } from './_rate-limit.js';

const PRODUCTION_ORIGIN = 'https://osint-worldview-cyan.vercel.app';

function request(path, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('origin', PRODUCTION_ORIGIN);
  return new Request(`${PRODUCTION_ORIGIN}${path}`, { ...init, headers });
}

test.afterEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.WORLDMONITOR_VALID_KEYS;
  delete process.env.WS_RELAY_URL;
});

test('bootstrap fails without caching when Redis is unavailable', async () => {
  const response = await bootstrapHandler(request('/api/bootstrap?tier=fast'));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const payload = await response.json();
  assert.equal(payload.error, 'bootstrap_cache_unavailable');
  assert.deepEqual(payload.data, {});
  assert.ok(payload.missing.length > 0);
});

test('bootstrap fails without caching when Redis is reachable but unseeded', async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    const commands = JSON.parse(init.body);
    return new Response(JSON.stringify(commands.map(() => ({ result: null }))), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const response = await bootstrapHandler(request('/api/bootstrap?keys=earthquakes'));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.json()).error, 'bootstrap_not_seeded');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('compact health reports Redis failure without exposing raw dependency errors', async () => {
  const response = await healthHandler(request('/api/health?compact=1'));
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.equal(payload.status, 'REDIS_DOWN');
  assert.equal('error' in payload, false);
});

test('detailed health requires an explicit API key', async () => {
  process.env.WORLDMONITOR_VALID_KEYS = 'wm_test_key_1234567890abcdef';
  const response = await healthHandler(request('/api/health'));
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { status: 'UNAUTHORIZED' });
});

test('version endpoint falls back to the build version when no GitHub release exists', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status: 404 });

  try {
    const response = await versionHandler();
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.version, '2.6.1');
    assert.equal(payload.releaseAvailable, false);
    assert.equal(payload.source, 'build');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('privileged rate limits fail closed when Redis protection is unavailable', async () => {
  const response = await checkRateLimit(request('/api/test'), {}, {
    prefix: 'test',
    limit: 1,
    window: '60 s',
    failClosed: true,
  });
  assert.equal(response?.status, 503);
  assert.equal(response?.headers.get('cache-control'), 'no-store');
});
