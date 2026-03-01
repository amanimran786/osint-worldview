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
