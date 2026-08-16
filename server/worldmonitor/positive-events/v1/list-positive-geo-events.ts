import type {
  ServerContext,
  ListPositiveGeoEventsRequest,
  ListPositiveGeoEventsResponse,
  PositiveGeoEvent,
} from '../../../../src/generated/server/worldmonitor/positive_events/v1/service_server';
import { getCachedJson } from '../../../_shared/redis';

const CACHE_KEY = 'positive-events:geo:v1';
const MAX_AGE_MS = 60 * 60 * 1000;

function unavailableError(): Error & { statusCode: number } {
  const error = new Error('Positive events cache unavailable') as Error & { statusCode: number };
  error.statusCode = 503;
  return error;
}

export async function listPositiveGeoEvents(
  _ctx: ServerContext,
  _req: ListPositiveGeoEventsRequest,
): Promise<ListPositiveGeoEventsResponse> {
  const raw = await getCachedJson(CACHE_KEY, true) as {
    events?: PositiveGeoEvent[];
    fetchedAt?: number;
  } | null;
  const fetchedAt = raw?.fetchedAt;
  const ageMs = typeof fetchedAt === 'number' ? Date.now() - fetchedAt : Number.NaN;
  if (
    !raw ||
    !Array.isArray(raw.events) ||
    typeof fetchedAt !== 'number' ||
    !Number.isFinite(fetchedAt) ||
    ageMs < -5 * 60 * 1000 ||
    ageMs >= MAX_AGE_MS
  ) {
    throw unavailableError();
  }

  return { events: raw.events };
}
