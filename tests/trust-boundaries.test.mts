import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { afterEach, describe, it } from 'node:test';

import { getWingbitsStatus } from '../server/worldmonitor/military/v1/get-wingbits-status.ts';

const originalFetch = globalThis.fetch;
const originalWingbitsKey = process.env.WINGBITS_API_KEY;

function readSource(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWingbitsKey == null) delete process.env.WINGBITS_API_KEY;
  else process.env.WINGBITS_API_KEY = originalWingbitsKey;
});

describe('trust-boundary guardrails', () => {
  it('fails closed when gateway CORS policy generation throws', () => {
    const source = readSource('server/gateway.ts');
    assert.doesNotMatch(source, /corsHeaders\s*=\s*\{\s*['"]Access-Control-Allow-Origin['"]:\s*['"]\*['"]/);
    assert.match(source, /error:\s*['"]Origin policy unavailable['"]/);
    assert.match(source, /status:\s*503/);
    assert.match(source, /['"]\/api\/aviation\/v1\/list-airport-delays['"]:\s*['"]medium['"]/);
    assert.match(source, /['"]\/api\/military\/v1\/get-wingbits-status['"]:\s*['"]fast['"]/);
  });

  it('does not retain or serve process-local positive-event fallback data', () => {
    const source = readSource('server/worldmonitor/positive-events/v1/list-positive-geo-events.ts');
    assert.doesNotMatch(source, /let\s+fallback\b/);
    assert.doesNotMatch(source, /return\s*\{\s*events:\s*fallback\.events\s*\}/);
    assert.match(source, /error\.statusCode\s*=\s*503/);
  });

  it('does not convert missing airport telemetry into normal operations', () => {
    const source = readSource('server/worldmonitor/aviation/v1/list-airport-delays.ts');
    assert.doesNotMatch(source, /reason:\s*['"]Normal operations['"]/);
    assert.doesNotMatch(source, /id:\s*`status-\$\{airport\.iata\}`/);
  });
});

describe('Wingbits status', () => {
  it('reports unavailable without a key and does not call the provider', async () => {
    delete process.env.WINGBITS_API_KEY;
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return new Response('[]');
    };

    assert.deepEqual(await getWingbitsStatus({} as never, {}), { configured: false });
    assert.equal(called, false);
  });

  it('reports configured only after a successful provider response', async () => {
    process.env.WINGBITS_API_KEY = 'test-wingbits-key';
    globalThis.fetch = async (input, init) => {
      assert.equal(input, 'https://customer-api.wingbits.com/v1/flights');
      assert.equal(init?.method, 'POST');
      assert.equal(new Headers(init?.headers).get('x-api-key'), 'test-wingbits-key');
      return new Response('[]', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    assert.deepEqual(await getWingbitsStatus({} as never, {}), { configured: true });
  });

  it('reports unavailable for rejected or malformed provider responses', async () => {
    process.env.WINGBITS_API_KEY = 'test-wingbits-key';
    globalThis.fetch = async () => new Response('{"error":"unauthorized"}', { status: 401 });
    assert.deepEqual(await getWingbitsStatus({} as never, {}), { configured: false });

    globalThis.fetch = async () => new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    assert.deepEqual(await getWingbitsStatus({} as never, {}), { configured: false });
  });
});
