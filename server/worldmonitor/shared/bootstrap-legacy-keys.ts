/**
 * Bootstrap legacy cache keys.
 *
 * These keys are consumed by bootstrap hydration but populated by legacy data
 * pipelines outside the sebuf RPC handlers. Keeping them centralized in the
 * worldmonitor tree allows registry-level validation to remain deterministic.
 */
export const BOOTSTRAP_LEGACY_CACHE_KEYS = {
  techReadiness: 'economic:worldbank-techreadiness:v1',
  progressData: 'economic:worldbank-progress:v1',
  renewableEnergy: 'economic:worldbank-renewable:v1',
  positiveGeoEvents: 'positive_events:geo-bootstrap:v1',
  weatherAlerts: 'weather:alerts:v1',
  spending: 'economic:spending:v1',
  theaterPosture: 'theater_posture:sebuf:stale:v1',
} as const;
