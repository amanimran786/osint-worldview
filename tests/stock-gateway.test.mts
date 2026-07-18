import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { createDomainGateway } from '../server/gateway.ts';

const originalKeys = process.env.WORLDMONITOR_VALID_KEYS;

afterEach(() => {
  if (originalKeys == null) delete process.env.WORLDMONITOR_VALID_KEYS;
  else process.env.WORLDMONITOR_VALID_KEYS = originalKeys;
});

describe('stock gateway access', () => {
  it('allows stock analysis RPCs from trusted browser origins without a product-tier key', async () => {
    const handler = createDomainGateway([
      {
        method: 'GET',
        path: '/api/market/v1/analyze-stock',
        handler: async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      },
      {
        method: 'GET',
        path: '/api/market/v1/list-market-quotes',
        handler: async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      },
    ]);

    process.env.WORLDMONITOR_VALID_KEYS = 'real-key-123';

    const stockAllowed = await handler(new Request('https://osint-worldview-cyan.vercel.app/api/market/v1/analyze-stock?symbol=AAPL', {
      headers: { Origin: 'https://osint-worldview-cyan.vercel.app' },
    }));
    assert.equal(stockAllowed.status, 200);

    const publicAllowed = await handler(new Request('https://osint-worldview-cyan.vercel.app/api/market/v1/list-market-quotes?symbols=AAPL', {
      headers: { Origin: 'https://osint-worldview-cyan.vercel.app' },
    }));
    assert.equal(publicAllowed.status, 200);
  });
});
