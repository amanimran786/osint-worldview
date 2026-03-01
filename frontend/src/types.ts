/* ---- Domain types matching backend schemas ---- */

export interface Signal {
  id: number;
  title: string;
  snippet: string | null;
  url: string;
  source: string;
  published_at: string | null;
  fetched_at: string;
  severity: number;
  category: string | null;
  status: string;
  case_id: number | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  country_code: string | null;
  ai_summary: string | null;
}

export interface Rule {
  id: number;
  name: string;
  category: string;
  severity: number;
  keywords: string;
  allowlist: string | null;
  denylist: string | null;
  enabled: boolean;
}

export interface Source {
  id: number;
  name: string;
  type: string;
  url: string;
  enabled: boolean;
}

export interface Case {
  id: number;
  title: string;
  status: string;
  created_at: string;
}

export interface Note {
  id: number;
  content: string;
  signal_id: number | null;
  case_id: number | null;
  author_id: number | null;
  created_at: string;
}

/* ---- Analytics ---- */
export interface TimeseriesBucket {
  date: string;
  count: number;
}

export interface SeverityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface SourceBreakdown {
  source: string;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface Analytics {
  total_signals: number;
  new_signals: number;
  critical_signals: number;
  open_cases: number;
  signals_over_time: TimeseriesBucket[];
  severity_distribution: SeverityDistribution;
  top_sources: SourceBreakdown[];
  top_categories: CategoryBreakdown[];
}

/* ---- AI ---- */
export interface AIAnalysis {
  analysis: string;
  threat_level: string;
  key_entities: string[];
  recommended_actions: string[];
}

export interface AISummary {
  signal_id: number;
  summary: string;
}

/* ---- Geo ---- */
export interface GeoSignal {
  id: number;
  title: string;
  severity: number;
  status: string;
  source: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  country_code: string | null;
}

export interface HeatmapEntry {
  country_code: string;
  count: number;
  avg_severity: number;
}

/* ---- WebSocket ---- */
export interface WSMessage {
  type: 'new_signal' | 'signal_update' | 'poll_complete' | 'pong';
  data?: Record<string, unknown>;
}

export type SeverityLevel = 'low' | 'med' | 'high' | 'crit';

export function severityLevel(score: number): SeverityLevel {
  if (score >= 60) return 'crit';
  if (score >= 35) return 'high';
  if (score >= 15) return 'med';
  return 'low';
}

export function severityLabel(score: number): string {
  if (score >= 60) return 'Critical';
  if (score >= 35) return 'High';
  if (score >= 15) return 'Medium';
  return 'Low';
}

export function severityColor(score: number): string {
  if (score >= 60) return '#dc2626';
  if (score >= 35) return '#ef4444';
  if (score >= 15) return '#f59e0b';
  return '#22c55e';
}
