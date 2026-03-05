/**
 * OSINT Scanner Service — Automated intelligence collection & AI analysis
 *
 * Fetches from all live data sources, runs AI analysis via OpenAI,
 * and produces structured intelligence reports.
 *
 * Modes:
 *   • Auto-scan every 5 minutes (configurable)
 *   • Manual trigger via UI button
 */

import {
  fetchEarthquakesDirect,
  fetchCyberThreatsDirect,
  fetchDisastersDirect,
} from './dataLayers';
import {
  fetchAirTraffic,
  fetchNasaEvents,
  fetchSpaceWeather,
  fetchFireHotspots,
  fetchGdeltNews,
  fetchNearEarthObjects,
  getCountryThreatScores,
  getRansomwareEvents,
} from './advancedLayers';
import { analyzeSignals as aiAnalyze, hasOpenAIKey } from './openai';

/* ─── Types ─── */
export interface ScanResult {
  id: string;
  timestamp: string;
  duration_ms: number;
  sources_scanned: number;
  total_items: number;
  highlights: ScanHighlight[];
  ai_analysis: {
    analysis: string;
    threat_level: string;
    key_entities: string[];
    recommended_actions: string[];
  } | null;
  raw_counts: Record<string, number>;
  errors: string[];
}

export interface ScanHighlight {
  source: string;
  title: string;
  severity: number;
  category: string;
  snippet?: string;
}

/* ─── Scanner config ─── */
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const SCAN_HISTORY_KEY = 'wv_scan_history';
const MAX_HISTORY = 50;

/* ─── Collect highlights from all data sources ─── */
async function collectIntelligence(): Promise<{
  highlights: ScanHighlight[];
  counts: Record<string, number>;
  errors: string[];
}> {
  const highlights: ScanHighlight[] = [];
  const counts: Record<string, number> = {};
  const errors: string[] = [];

  const tasks = [
    {
      name: 'earthquakes',
      fn: () => fetchEarthquakesDirect({ min_magnitude: 4.0, period: 'day' }),
      transform: (data: Awaited<ReturnType<typeof fetchEarthquakesDirect>>) =>
        data.map(eq => ({
          source: 'USGS',
          title: eq.title,
          severity: Math.min(100, eq.magnitude * 12),
          category: 'seismic',
          snippet: `M${eq.magnitude} at ${eq.depth_km}km depth`,
        })),
    },
    {
      name: 'cyber_threats',
      fn: () => fetchCyberThreatsDirect({ limit: 20 }),
      transform: (data: Awaited<ReturnType<typeof fetchCyberThreatsDirect>>) =>
        data.slice(0, 10).map(ct => ({
          source: 'ThreatFox',
          title: `Malware: ${ct.malware} — ${ct.ip}:${ct.port}`,
          severity: 65,
          category: 'cyber',
          snippet: `Country: ${ct.country}, Status: ${ct.status}`,
        })),
    },
    {
      name: 'disasters',
      fn: () => fetchDisastersDirect(),
      transform: (data: Awaited<ReturnType<typeof fetchDisastersDirect>>) =>
        data.slice(0, 10).map(d => ({
          source: 'ReliefWeb',
          title: d.title,
          severity: 55,
          category: 'disaster',
          snippet: d.description?.slice(0, 150),
        })),
    },
    {
      name: 'flights',
      fn: () => fetchAirTraffic({ bounds: { lamin: -60, lamax: 70, lomin: -180, lomax: 180 } }),
      transform: (data: Awaited<ReturnType<typeof fetchAirTraffic>>) => {
        counts.flights = data.length;
        return []; // too many to list as highlights, just count
      },
    },
    {
      name: 'nasa_events',
      fn: () => fetchNasaEvents({ days: 3, limit: 20 }),
      transform: (data: Awaited<ReturnType<typeof fetchNasaEvents>>) =>
        data.slice(0, 5).map(e => ({
          source: 'NASA EONET',
          title: `${e.title} (${e.category})`,
          severity: e.category.includes('Volcano') ? 75 : e.category.includes('Fire') ? 60 : 40,
          category: 'environmental',
        })),
    },
    {
      name: 'space_weather',
      fn: () => fetchSpaceWeather(3),
      transform: (data: Awaited<ReturnType<typeof fetchSpaceWeather>>) =>
        data.slice(0, 5).map(sw => ({
          source: 'NOAA SWPC',
          title: `${sw.type}: ${sw.title}`,
          severity: 35,
          category: 'space_weather',
          snippet: sw.classType ? `Class: ${sw.classType}` : undefined,
        })),
    },
    {
      name: 'fire_hotspots',
      fn: () => fetchFireHotspots({ days: 1 }),
      transform: (data: Awaited<ReturnType<typeof fetchFireHotspots>>) => {
        counts.fires = data.length;
        return data.filter(f => Number(f.confidence) > 70).slice(0, 5).map(f => ({
          source: 'NASA FIRMS',
          title: `Fire: ${f.latitude.toFixed(2)}°, ${f.longitude.toFixed(2)}° (${f.confidence}% confidence)`,
          severity: Math.min(90, f.brightness / 4),
          category: 'fire',
        }));
      },
    },
    {
      name: 'gdelt_news',
      fn: () => fetchGdeltNews({ query: 'conflict OR attack OR crisis OR threat', maxRecords: 15 }),
      transform: (data: Awaited<ReturnType<typeof fetchGdeltNews>>) =>
        data.slice(0, 8).map(a => ({
          source: 'GDELT',
          title: a.title,
          severity: 45,
          category: 'osint',
          snippet: a.domain,
        })),
    },
    {
      name: 'near_earth_objects',
      fn: () => fetchNearEarthObjects(),
      transform: (data: Awaited<ReturnType<typeof fetchNearEarthObjects>>) => {
        const hazardous = data.filter(n => n.is_potentially_hazardous);
        counts.neos = data.length;
        counts.hazardous_neos = hazardous.length;
        return hazardous.slice(0, 3).map(n => ({
          source: 'NASA NEO',
          title: `Hazardous: ${n.name} (${n.estimated_diameter_max_m.toFixed(0)}m)`,
          severity: 50,
          category: 'space',
          snippet: `Miss distance: ${Number(n.miss_distance_km).toLocaleString()}km`,
        }));
      },
    },
    {
      name: 'country_threats',
      fn: async () => getCountryThreatScores(),
      transform: (data: ReturnType<typeof getCountryThreatScores>) => {
        const critical = data.filter(c => c.score >= 80);
        counts.high_threat_countries = critical.length;
        return critical.slice(0, 5).map(c => ({
          source: 'Threat Index',
          title: `${c.country}: Threat Score ${c.score}`,
          severity: c.score,
          category: 'geopolitical',
        }));
      },
    },
    {
      name: 'ransomware',
      fn: async () => getRansomwareEvents(),
      transform: (data: ReturnType<typeof getRansomwareEvents>) => {
        counts.ransomware = data.length;
        return data.slice(0, 5).map(r => ({
          source: 'Ransomware Tracker',
          title: `${r.group}: ${r.victim}`,
          severity: 70,
          category: 'cyber',
          snippet: `Sector: ${r.sector}, Country: ${r.country}`,
        }));
      },
    },
  ];

  const results = await Promise.allSettled(
    tasks.map(async (task) => {
      try {
        const data = await task.fn();
        const items = task.transform(data as any);
        counts[task.name] = counts[task.name] ?? (Array.isArray(data) ? data.length : 0);
        return items;
      } catch (err) {
        errors.push(`${task.name}: ${err instanceof Error ? err.message : 'failed'}`);
        return [];
      }
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      highlights.push(...result.value);
    }
  }

  // Sort highlights by severity descending
  highlights.sort((a, b) => b.severity - a.severity);

  return { highlights, counts, errors };
}

/* ─── Run a full scan ─── */
export async function runScan(): Promise<ScanResult> {
  const start = performance.now();
  const { highlights, counts, errors } = await collectIntelligence();
  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

  // Run AI analysis if key is available
  let aiAnalysis: ScanResult['ai_analysis'] = null;
  if (hasOpenAIKey() && highlights.length > 0) {
    try {
      const topSignals = highlights.slice(0, 20).map(h => ({
        title: h.title,
        snippet: h.snippet ?? null,
        source: h.source,
        severity: Math.round(h.severity / 10),
        category: h.category,
      }));
      aiAnalysis = await aiAnalyze(topSignals);
    } catch (err) {
      errors.push(`AI Analysis: ${err instanceof Error ? err.message : 'failed'}`);
    }
  }

  const result: ScanResult = {
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    duration_ms: Math.round(performance.now() - start),
    sources_scanned: Object.keys(counts).length,
    total_items: totalItems,
    highlights: highlights.slice(0, 30),
    ai_analysis: aiAnalysis,
    raw_counts: counts,
    errors,
  };

  // Persist to localStorage
  saveScanResult(result);

  return result;
}

/* ─── Scan history persistence ─── */
function saveScanResult(result: ScanResult): void {
  try {
    const history = getScanHistory();
    history.unshift(result);
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history));
  } catch { /* storage full — ignore */ }
}

export function getScanHistory(): ScanResult[] {
  try {
    return JSON.parse(localStorage.getItem(SCAN_HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function clearScanHistory(): void {
  localStorage.removeItem(SCAN_HISTORY_KEY);
}

/* ─── Auto-scanner class ─── */
export class AutoScanner {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private _isRunning = false;
  private _intervalMs: number;
  private _onScanComplete?: (result: ScanResult) => void;
  private _onScanStart?: () => void;
  private _onError?: (error: Error) => void;

  constructor(intervalMs = DEFAULT_INTERVAL_MS) {
    this._intervalMs = intervalMs;
  }

  get isRunning(): boolean { return this._isRunning; }
  get intervalMs(): number { return this._intervalMs; }

  onScanComplete(cb: (result: ScanResult) => void): this { this._onScanComplete = cb; return this; }
  onScanStart(cb: () => void): this { this._onScanStart = cb; return this; }
  onError(cb: (error: Error) => void): this { this._onError = cb; return this; }

  start(): void {
    if (this.intervalId) return;
    this._isRunning = true;
    this.intervalId = setInterval(() => this.tick(), this._intervalMs);
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this._isRunning = false;
  }

  setInterval(ms: number): void {
    this._intervalMs = ms;
    if (this._isRunning) {
      this.stop();
      this.start();
    }
  }

  async tick(): Promise<ScanResult | null> {
    try {
      this._onScanStart?.();
      const result = await runScan();
      this._onScanComplete?.(result);
      return result;
    } catch (err) {
      this._onError?.(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }
}

/** Check if OpenAI key is available (via localStorage, set in Settings) */
export function isAIEnabled(): boolean {
  return hasOpenAIKey();
}
