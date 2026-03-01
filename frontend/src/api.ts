import axios from 'axios';
import type { Signal, Rule, Source, Case, Note } from './types';

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

export default api;
