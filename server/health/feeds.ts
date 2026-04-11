/**
 * Feed health check endpoint.
 * Returns status of critical data feeds for monitoring/debugging.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FeedStatus {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  required?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const checks: FeedStatus[] = [
    {
      name: 'OpenSky ADS-B (Military Aircraft)',
      status: 'ok',
      message: 'Public API - always available',
      required: true,
    },
    {
      name: 'GDELT (Global Events)',
      status: process.env.GDELT_API_KEY ? 'ok' : 'warning',
      message: process.env.GDELT_API_KEY ? 'API key configured' : 'No API key - using public rate-limited endpoint',
      required: false,
    },
    {
      name: 'ACLED (Conflict & Protest)',
      status: process.env.ACLED_ACCESS_TOKEN ? 'ok' : 'error',
      message: process.env.ACLED_ACCESS_TOKEN ? 'Access token configured' : 'Missing ACLED_ACCESS_TOKEN - feed unavailable',
      required: false,
    },
    {
      name: 'NASA FIRMS (Fire Detection)',
      status: process.env.NASA_FIRMS_API_KEY || process.env.FIRMS_API_KEY ? 'ok' : 'error',
      message: process.env.NASA_FIRMS_API_KEY || process.env.FIRMS_API_KEY ? 'API key configured' : 'Missing NASA_FIRMS_API_KEY - feed unavailable',
      required: false,
    },
    {
      name: 'AISStream (Vessel Tracking)',
      status: process.env.AISSTREAM_API_KEY ? 'ok' : 'warning',
      message: process.env.AISSTREAM_API_KEY ? 'API key configured' : 'No API key - limited vessel tracking',
      required: false,
    },
    {
      name: 'Finnhub (Market Data)',
      status: process.env.FINNHUB_API_KEY ? 'ok' : 'warning',
      message: process.env.FINNHUB_API_KEY ? 'API key configured' : 'No API key - market data limited',
      required: false,
    },
    {
      name: 'RSS Feeds (News)',
      status: process.env.WS_RELAY_URL ? 'ok' : 'warning',
      message: process.env.WS_RELAY_URL ? 'Relay configured' : 'No relay - using direct RSS (may have CORS issues)',
      required: false,
    },
  ];

  const health = {
    timestamp: new Date().toISOString(),
    feeds: checks,
    summary: {
      total: checks.length,
      ok: checks.filter(c => c.status === 'ok').length,
      warning: checks.filter(c => c.status === 'warning').length,
      error: checks.filter(c => c.status === 'error').length,
    },
  };

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(health);
}
