import { create } from 'zustand';
import type { Signal, Rule, Source, Case } from './types';
import * as api from './api';

interface AppState {
  /* data */
  signals: Signal[];
  rules: Rule[];
  sources: Source[];
  cases: Case[];

  /* ui */
  loading: boolean;
  error: string | null;
  selectedSignalId: number | null;
  filterStatus: string;
  pollInProgress: boolean;
  toastMessage: string | null;

  /* actions */
  loadSignals: (params?: Parameters<typeof api.fetchSignals>[0]) => Promise<void>;
  loadRules: () => Promise<void>;
  loadSources: () => Promise<void>;
  loadCases: () => Promise<void>;
  setFilterStatus: (status: string) => void;
  selectSignal: (id: number | null) => void;
  patchSignal: (id: number, patch: { status?: string; case_id?: number }) => Promise<void>;
  pollAll: () => Promise<void>;
  clearError: () => void;
  clearToast: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  signals: [],
  rules: [],
  sources: [],
  cases: [],
  loading: false,
  error: null,
  selectedSignalId: null,
  filterStatus: '',
  pollInProgress: false,
  toastMessage: null,

  loadSignals: async (params) => {
    set({ loading: true, error: null });
    try {
      const signals = await api.fetchSignals(params);
      set({ signals, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load signals';
      set({ error: msg, loading: false });
    }
  },

  loadRules: async () => {
    try {
      const rules = await api.fetchRules();
      set({ rules });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load rules';
      set({ error: msg });
    }
  },

  loadSources: async () => {
    try {
      const sources = await api.fetchSources();
      set({ sources });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load sources';
      set({ error: msg });
    }
  },

  loadCases: async () => {
    try {
      const cases = await api.fetchCases();
      set({ cases });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load cases';
      set({ error: msg });
    }
  },

  setFilterStatus: (status) => {
    set({ filterStatus: status });
    const params = status ? { status } : undefined;
    get().loadSignals(params);
  },

  selectSignal: (id) => set({ selectedSignalId: id }),

  patchSignal: async (id, patch) => {
    try {
      const updated = await api.updateSignal(id, patch);
      set((s) => ({
        signals: s.signals.map((sig) => (sig.id === id ? updated : sig)),
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update signal';
      set({ error: msg });
    }
  },

  pollAll: async () => {
    if (get().pollInProgress) return; // prevent double-clicks
    set({ pollInProgress: true, loading: true });
    try {
      await api.triggerPollAll();
      set({ toastMessage: 'Feed poll queued — refreshing signals…' });
      // Poll for new data with exponential back-off instead of blind setTimeout
      for (const delay of [2000, 3000, 5000]) {
        await new Promise((r) => setTimeout(r, delay));
        await get().loadSignals();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Poll failed';
      set({ error: msg });
    } finally {
      set({ pollInProgress: false, loading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearToast: () => set({ toastMessage: null }),
}));
