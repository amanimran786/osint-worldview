/**
 * API layer — fully client-side for Vercel static deployment.
 *
 * • DB-dependent endpoints (signals, cases, rules, sources, analytics, search, geo)
 *   → served from in-browser localStorage demo store
 * • Live data layers (earthquakes, weather, cyber, disasters)
 *   → fetched directly from public APIs in the browser (no serverless needed)
 */
import type {
  Signal, Rule, Source, Case, Note,
  Analytics, AIAnalysis, AISummary, GeoSignal, HeatmapEntry,
  EarthquakeFeature, CyberThreat, WeatherData, DisasterEvent,
} from './types';
import * as demo from './services/demoStore';
import { hasOpenAIKey } from './services/openai';
import { analyzeSignals as aiAnalyzeSignals, summarizeSignal as aiSummarize } from './services/openai';
import {
  fetchEarthquakesDirect,
  fetchWeatherDirect,
  fetchCyberThreatsDirect,
  fetchDisastersDirect,
} from './services/dataLayers';

/* ================================================================
   DB-DEPENDENT ENDPOINTS — localStorage demo store
   ================================================================ */

/* ---- Signals ---- */
export async function fetchSignals(params?: {
  status?: string;
  source?: string;
  min_severity?: number;
  limit?: number;
  offset?: number;
}): Promise<Signal[]> {
  return demo.getSignals(params);
}

export async function ingestSignal(payload: {
  title: string;
  url: string;
  snippet?: string;
  source: string;
}): Promise<Signal> {
  return demo.createSignal(payload);
}

export async function updateSignal(
  id: number,
  patch: { status?: string; case_id?: number },
): Promise<Signal> {
  const result = demo.updateSignal(id, patch);
  if (!result) throw new Error('Signal not found');
  return result;
}

/* ---- Rules ---- */
export async function fetchRules(): Promise<Rule[]> {
  return demo.getRules();
}

export async function createRule(payload: Omit<Rule, 'id'>): Promise<Rule> {
  return demo.createRule(payload);
}

export async function deleteRule(id: number): Promise<void> {
  demo.deleteRule(id);
}

/* ---- Sources ---- */
export async function fetchSources(): Promise<Source[]> {
  return demo.getSources();
}

export async function createSource(payload: Omit<Source, 'id'>): Promise<Source> {
  return demo.createSource(payload);
}

export async function triggerPoll(_sourceId: number): Promise<{ task_id: string }> {
  return { task_id: `demo-${Date.now()}` };
}

export async function triggerPollAll(): Promise<{ task_id: string }> {
  return { task_id: `demo-poll-all-${Date.now()}` };
}

/* ---- Cases ---- */
export async function fetchCases(params?: { status?: string }): Promise<Case[]> {
  return demo.getCases(params);
}

export async function createCase(title: string): Promise<Case> {
  return demo.createCase(title);
}

export async function fetchNotes(caseId: number): Promise<Note[]> {
  return demo.getNotes(caseId);
}

export async function addNote(caseId: number, content: string): Promise<Note> {
  return demo.addNote(caseId, content);
}

/* ---- Health ---- */
export async function healthCheck(): Promise<{ status: string }> {
  return { status: 'ok (vercel)' };
}

/* ---- Analytics ---- */
export async function fetchAnalytics(days = 30): Promise<Analytics> {
  return demo.getAnalytics(days);
}

/* ---- AI ---- */
export async function getAIStatus(): Promise<{ ai_enabled: boolean; model: string | null }> {
  return { ai_enabled: hasOpenAIKey(), model: hasOpenAIKey() ? 'gpt-4o-mini' : null };
}

export async function summarizeSignals(signalIds: number[]): Promise<AISummary[]> {
  if (!hasOpenAIKey()) return [];
  const allSignals = demo.getSignals();
  const summaries: AISummary[] = [];
  for (const id of signalIds) {
    const sig = allSignals.find(s => s.id === id);
    if (!sig) continue;
    try {
      const summary = await aiSummarize({ title: sig.title, snippet: sig.snippet, url: sig.url, source: sig.source });
      summaries.push({ signal_id: id, summary });
    } catch { /* skip on error */ }
  }
  return summaries;
}

export async function analyzeSignals(_limit = 20): Promise<AIAnalysis> {
  const signals = demo.getSignals().slice(0, _limit);

  // Provider chain:
  // 1) Browser OpenAI key
  // 2) Backend AI route (/api/ai/analyze)
  // 3) Local rule-based fallback
  try {
    if (hasOpenAIKey()) {
      return await aiAnalyzeSignals(signals.map(s => ({
        title: s.title,
        snippet: s.snippet,
        source: s.source,
        severity: s.severity,
        category: s.category,
      })));
    }
  } catch {
    // Continue to backend and local fallbacks.
  }

  try {
    const backend = await fetch(`/api/ai/analyze?limit=${_limit}`, { method: 'POST' });
    if (backend.ok) {
      const data = await backend.json();
      return {
        analysis: data.analysis ?? 'Backend AI analysis complete.',
        threat_level: data.threat_level ?? 'medium',
        key_entities: Array.isArray(data.key_entities) ? data.key_entities : [],
        recommended_actions: Array.isArray(data.recommended_actions) ? data.recommended_actions : [],
      };
    }
  } catch {
    // Continue to local fallback.
  }

  const critical = signals.filter((s) => s.severity >= 60);
  const high = signals.filter((s) => s.severity >= 35 && s.severity < 60);
  const sources = Array.from(new Set(signals.map((s) => s.source))).slice(0, 6);
  const categories = Array.from(new Set(signals.map((s) => s.category).filter(Boolean))).slice(0, 6) as string[];
  const threat_level = critical.length >= 3 ? 'critical' : critical.length > 0 ? 'high' : high.length > 3 ? 'high' : 'medium';

  return {
    analysis:
      `Automated local assessment processed ${signals.length} recent signals. ` +
      `${critical.length} critical and ${high.length} high-priority events were identified. ` +
      `Top sources include ${sources.join(', ') || 'N/A'} with key categories ${categories.join(', ') || 'N/A'}.`,
    threat_level,
    key_entities: categories.length ? categories : ['Signal Monitoring'],
    recommended_actions: [
      'Review critical and high-priority signals first.',
      'Correlate events across top source clusters.',
      hasOpenAIKey() ? 'Validate AI conclusions with analyst review.' : 'Configure AI provider keys for richer narrative analysis.',
    ],
  };
}

/* ---- Search ---- */
export async function searchSignals(params: {
  q: string;
  status?: string;
  source?: string;
  min_severity?: number;
  max_severity?: number;
  category?: string;
  country_code?: string;
  has_location?: boolean;
  limit?: number;
}): Promise<Signal[]> {
  return demo.searchSignals({ q: params.q, limit: params.limit });
}

/* ---- Geo ---- */
export async function fetchGeoSignals(params?: {
  min_severity?: number;
  status?: string;
  limit?: number;
}): Promise<GeoSignal[]> {
  return demo.getGeoSignals(params);
}

export async function fetchHeatmap(): Promise<HeatmapEntry[]> {
  return demo.getHeatmap();
}

/* ---- Export ---- */
export function getExportUrl(format: 'csv' | 'json', _params?: {
  status?: string;
  source?: string;
  min_severity?: number;
}): string {
  const signals = demo.getSignals();
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(signals, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }
  const header = 'id,title,source,severity,status,category,latitude,longitude,location_name,published_at\n';
  const rows = signals.map(s =>
    `${s.id},"${s.title}",${s.source},${s.severity},${s.status},${s.category ?? ''},${s.latitude ?? ''},${s.longitude ?? ''},"${s.location_name ?? ''}",${s.published_at ?? ''}`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  return URL.createObjectURL(blob);
}

/* ================================================================
   LIVE DATA LAYERS — direct browser fetch (no backend/serverless)
   ================================================================ */

export async function fetchEarthquakes(params?: {
  min_magnitude?: number;
  period?: 'hour' | 'day' | 'week' | 'month';
}): Promise<EarthquakeFeature[]> {
  return fetchEarthquakesDirect(params);
}

export async function fetchCyberThreats(params?: {
  limit?: number;
}): Promise<CyberThreat[]> {
  return fetchCyberThreatsDirect(params);
}

export async function fetchWeather(): Promise<WeatherData[]> {
  return fetchWeatherDirect();
}

export async function fetchDisasters(): Promise<DisasterEvent[]> {
  return fetchDisastersDirect();
}

/* ================================================================
   ADVANCED DATA LAYERS — re-export for convenience
   ================================================================ */
export {
  fetchAirTraffic,
  fetchFlightTrack,
  fetchNasaEvents,
  fetchSpaceWeather,
  fetchFireHotspots,
  fetchAPOD,
  fetchEpicImages,
  fetchNearEarthObjects,
  getPublicWebcams,
  getPublicWebcamsAsync,
  fetchWindyWebcams,
  fetchGdeltNews,
  fetchGdeltTimeline,
  getCountryThreatScores,
  getRansomwareEvents,
  fetchAllAdvancedData,
} from './services/advancedLayers';

export type {
  FlightVector,
  FlightWaypoint,
  NasaEvent,
  SpaceWeatherEvent,
  FireHotspot,
  NasaAPOD,
  EpicImage,
  NearEarthObject,
  PublicWebcam,
  AllAdvancedData,
  GdeltArticle,
  CountryThreatScore,
  RansomwareEvent,
} from './services/advancedLayers';
