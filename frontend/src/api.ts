import axios from 'axios';
import type {
  Signal, Rule, Source, Case, Note,
  Analytics, AIAnalysis, AISummary, GeoSignal, HeatmapEntry,
  EarthquakeFeature, CyberThreat, WeatherData, DisasterEvent,
} from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: normalize error messages
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

/* ---- Signals ---- */
export async function fetchSignals(params?: {
  status?: string;
  source?: string;
  min_severity?: number;
  limit?: number;
  offset?: number;
}): Promise<Signal[]> {
  const { data } = await api.get('/signals/', { params });
  return data;
}

export async function ingestSignal(payload: {
  title: string;
  url: string;
  snippet?: string;
  source: string;
}): Promise<Signal> {
  const { data } = await api.post('/signals/', payload);
  return data;
}

export async function updateSignal(
  id: number,
  patch: { status?: string; case_id?: number },
): Promise<Signal> {
  const { data } = await api.patch(`/signals/${id}`, patch);
  return data;
}

/* ---- Rules ---- */
export async function fetchRules(): Promise<Rule[]> {
  const { data } = await api.get('/rules/');
  return data;
}

export async function createRule(payload: Omit<Rule, 'id'>): Promise<Rule> {
  const { data } = await api.post('/rules/', payload);
  return data;
}

export async function deleteRule(id: number): Promise<void> {
  await api.delete(`/rules/${id}`);
}

/* ---- Sources ---- */
export async function fetchSources(): Promise<Source[]> {
  const { data } = await api.get('/sources/');
  return data;
}

export async function createSource(
  payload: Omit<Source, 'id'>,
): Promise<Source> {
  const { data } = await api.post('/sources/', payload);
  return data;
}

export async function triggerPoll(sourceId: number): Promise<{ task_id: string }> {
  const { data } = await api.post(`/sources/${sourceId}/poll`);
  return data;
}

export async function triggerPollAll(): Promise<{ task_id: string }> {
  const { data } = await api.post('/sources/poll-all');
  return data;
}

/* ---- Cases ---- */
export async function fetchCases(params?: {
  status?: string;
}): Promise<Case[]> {
  const { data } = await api.get('/cases/', { params });
  return data;
}

export async function createCase(title: string): Promise<Case> {
  const { data } = await api.post('/cases/', { title });
  return data;
}

export async function fetchNotes(caseId: number): Promise<Note[]> {
  const { data } = await api.get(`/cases/${caseId}/notes`);
  return data;
}

export async function addNote(
  caseId: number,
  content: string,
): Promise<Note> {
  const { data } = await api.post(`/cases/${caseId}/notes`, { content });
  return data;
}

/* ---- Health ---- */
export async function healthCheck(): Promise<{ status: string }> {
  const { data } = await api.get('/health/live');
  return data;
}

/* ---- Analytics ---- */
export async function fetchAnalytics(days = 30): Promise<Analytics> {
  const { data } = await api.get('/analytics/', { params: { days } });
  return data;
}

/* ---- AI ---- */
export async function getAIStatus(): Promise<{ ai_enabled: boolean; model: string | null }> {
  const { data } = await api.get('/ai/status');
  return data;
}

export async function summarizeSignals(signalIds: number[]): Promise<AISummary[]> {
  const { data } = await api.post('/ai/summarize', { signal_ids: signalIds });
  return data;
}

export async function analyzeSignals(limit = 20): Promise<AIAnalysis> {
  const { data } = await api.post('/ai/analyze', null, { params: { limit } });
  return data;
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
  const { data } = await api.get('/search/', { params });
  return data;
}

/* ---- Geo ---- */
export async function fetchGeoSignals(params?: {
  min_severity?: number;
  status?: string;
  limit?: number;
}): Promise<GeoSignal[]> {
  const { data } = await api.get('/geo/signals', { params });
  return data;
}

export async function fetchHeatmap(): Promise<HeatmapEntry[]> {
  const { data } = await api.get('/geo/heatmap');
  return data;
}

/* ---- Export ---- */
export function getExportUrl(format: 'csv' | 'json', params?: {
  status?: string;
  source?: string;
  min_severity?: number;
}): string {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.source) searchParams.set('source', params.source);
  if (params?.min_severity !== undefined) searchParams.set('min_severity', String(params.min_severity));
  return `/api/export/signals/${format}?${searchParams.toString()}`;
}

/* ---- Data Layers ---- */
export async function fetchEarthquakes(params?: {
  min_magnitude?: number;
  period?: 'hour' | 'day' | 'week' | 'month';
}): Promise<EarthquakeFeature[]> {
  const { data } = await api.get('/layers/earthquakes', { params });
  return data.features ?? [];
}

export async function fetchCyberThreats(params?: {
  limit?: number;
}): Promise<CyberThreat[]> {
  const { data } = await api.get('/layers/cyber-threats', { params });
  return data.threats ?? [];
}

export async function fetchWeather(): Promise<WeatherData[]> {
  const { data } = await api.get('/layers/weather');
  return data.weather ?? [];
}

export async function fetchDisasters(): Promise<DisasterEvent[]> {
  const { data } = await api.get('/layers/disasters');
  return data.disasters ?? [];
}

export default api;
