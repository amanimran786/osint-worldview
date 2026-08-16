import { createRelayHandler } from './_relay.js';

export const config = { runtime: 'edge' };

export default createRelayHandler({
  relayPath: '/opensky',
  timeout: 20000,
  requireApiKey: true,
  requireRateLimit: true,
  rateLimitOptions: {
    prefix: 'opensky',
    limit: 60,
    window: '60 s',
    failClosed: process.env.VERCEL_ENV === 'production',
  },
  cacheHeaders: () => ({
    'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60, stale-if-error=300',
  }),
  extraHeaders: (response) => {
    const xCache = response.headers.get('x-cache');
    return xCache ? { 'X-Cache': xCache } : {};
  },
});
