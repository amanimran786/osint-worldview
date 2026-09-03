import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isVercelAuthProtectionBody, shouldRetryWithFallback } from '../scripts/production-smoke.mjs';

describe('production smoke fallback logic', () => {
  it('detects Vercel auth-protection 401 bodies', () => {
    assert.equal(
      isVercelAuthProtectionBody('{"protection":{"vercel_auth_enabled":true,"password_enabled":false}}'),
      true
    );
    assert.equal(isVercelAuthProtectionBody('{"error":"unauthorized"}'), false);
  });

  it('retries with fallback only for protected URL errors', () => {
    const protectedError = new Error('auth protected');
    protectedError.code = 'VERCEL_AUTH_PROTECTED';
    assert.equal(
      shouldRetryWithFallback(
        protectedError,
        'https://deployment.vercel.app',
        'https://osint-worldview-cyan.vercel.app'
      ),
      true
    );
    assert.equal(
      shouldRetryWithFallback(
        protectedError,
        'https://osint-worldview-cyan.vercel.app',
        'https://osint-worldview-cyan.vercel.app'
      ),
      false
    );
  });
});
