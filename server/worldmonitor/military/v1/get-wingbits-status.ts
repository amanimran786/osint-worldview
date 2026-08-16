import type {
  ServerContext,
  GetWingbitsStatusRequest,
  GetWingbitsStatusResponse,
} from '../../../../src/generated/server/worldmonitor/military/v1/service_server';
import { CHROME_UA } from '../../../_shared/constants';

const WINGBITS_FLIGHTS_URL = 'https://customer-api.wingbits.com/v1/flights';
const HEALTH_QUERY = [{
  alias: 'worldview-health',
  by: 'box',
  la: 0,
  lo: 0,
  w: 1,
  h: 1,
  unit: 'nm',
}];

export async function getWingbitsStatus(
  _ctx: ServerContext,
  _req: GetWingbitsStatusRequest,
): Promise<GetWingbitsStatusResponse> {
  const apiKey = process.env.WINGBITS_API_KEY?.trim();
  if (!apiKey) return { configured: false };

  try {
    const response = await fetch(WINGBITS_FLIGHTS_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': CHROME_UA,
      },
      body: JSON.stringify(HEALTH_QUERY),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return { configured: false };

    const payload = await response.json();
    return { configured: Array.isArray(payload) };
  } catch {
    return { configured: false };
  }
}
