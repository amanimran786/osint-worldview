import { strict as assert } from 'node:assert';
import test from 'node:test';
import { getCorsHeaders, isDisallowedOrigin } from './_cors.js';
import { validateApiKey, validateRequiredApiKey } from './_api-key.js';

function makeRequest(origin) {
  const headers = new Headers();
  if (origin !== null) {
    headers.set('origin', origin);
  }
  return new Request('https://osint-worldview-cyan.vercel.app/api/test', { headers });
}

test('allows the exact WorldView production origin', () => {
  const origin = 'https://osint-worldview-cyan.vercel.app';
  const req = makeRequest(origin);
  assert.equal(isDisallowedOrigin(req), false);
  assert.equal(getCorsHeaders(req)['Access-Control-Allow-Origin'], origin);
});

test('rejects preview and disconnected custom-domain origins', () => {
  for (const origin of [
    'https://osint-worldview-git-main-aman-imrans-projects.vercel.app',
    'https://worldview.app',
  ]) {
    const req = makeRequest(origin);
    assert.equal(isDisallowedOrigin(req), true, `origin should be rejected: ${origin}`);
  }
});

test('allows desktop Tauri origins', () => {
  const origins = [
    'https://tauri.localhost',
    'https://abc123.tauri.localhost',
    'tauri://localhost',
    'asset://localhost',
    'http://127.0.0.1:46123',
  ];

  for (const origin of origins) {
    const req = makeRequest(origin);
    assert.equal(isDisallowedOrigin(req), false, `origin should be allowed: ${origin}`);
    const cors = getCorsHeaders(req);
    assert.equal(cors['Access-Control-Allow-Origin'], origin);
  }
});

test('rejects unrelated external origins', () => {
  const req = makeRequest('https://evil.example.com');
  assert.equal(isDisallowedOrigin(req), true);
  const cors = getCorsHeaders(req);
  assert.equal(cors['Access-Control-Allow-Origin'], 'https://osint-worldview-cyan.vercel.app');
});

test('requests without origin remain allowed', () => {
  const req = makeRequest(null);
  assert.equal(isDisallowedOrigin(req), false);
});

test('allows keyless API access only from the exact production browser origin', () => {
  const production = makeRequest('https://osint-worldview-cyan.vercel.app');
  const preview = makeRequest('https://osint-worldview-git-main-aman-imrans-projects.vercel.app');

  assert.deepEqual(validateApiKey(production), { valid: true, required: false });
  assert.deepEqual(validateApiKey(preview), {
    valid: false,
    required: true,
    error: 'API key required',
  });
});

test('required-key routes do not trust a production Origin header', () => {
  const previous = process.env.WORLDMONITOR_VALID_KEYS;
  process.env.WORLDMONITOR_VALID_KEYS = 'wm_test_key_1234567890abcdef';
  try {
    const spoofed = makeRequest('https://osint-worldview-cyan.vercel.app');
    assert.deepEqual(validateRequiredApiKey(spoofed), {
      valid: false,
      required: true,
      error: 'API key required',
    });

    spoofed.headers.set('x-worldview-key', 'wm_test_key_1234567890abcdef');
    assert.deepEqual(validateRequiredApiKey(spoofed), { valid: true, required: true });
  } finally {
    if (previous == null) delete process.env.WORLDMONITOR_VALID_KEYS;
    else process.env.WORLDMONITOR_VALID_KEYS = previous;
  }
});
