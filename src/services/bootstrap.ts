const hydrationCache = new Map<string, unknown>();

export function getHydratedData(key: string): unknown | undefined {
  const val = hydrationCache.get(key);
  if (val !== undefined) hydrationCache.delete(key);
  return val;
}

function populateCache(data: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(data)) {
    if (v !== null && v !== undefined) {
      hydrationCache.set(k, v);
    }
  }
}

async function fetchTier(tier: string, signal: AbortSignal): Promise<void> {
  try {
    const resp = await fetch(`/api/bootstrap?tier=${tier}`, { signal });
    if (!resp.ok) return;
    const { data } = (await resp.json()) as { data: Record<string, unknown> };
    populateCache(data);
  } catch {
    // silent — panels fall through to individual calls
  }
}

export async function fetchBootstrapData(): Promise<void> {
  // Keep bootstrap non-blocking for initial paint: hard cap each tier.
  await Promise.all([
    fetchTier('slow', AbortSignal.timeout(1800)),
    fetchTier('fast', AbortSignal.timeout(1200)),
  ]);
}
