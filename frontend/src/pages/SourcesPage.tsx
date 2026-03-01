import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';
import * as api from '../api';

export function SourcesPage() {
  const sources = useStore((s) => s.sources);
  const loadSources = useStore((s) => s.loadSources);
  const [pollingId, setPollingId] = useState<number | null>(null);

  useEffect(() => {
    loadSources();
  }, []);

  const handlePoll = async (id: number) => {
    setPollingId(id);
    try {
      await api.triggerPoll(id);
      // Brief delay then clear indicator
      setTimeout(() => setPollingId(null), 2000);
    } catch {
      setPollingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="SOURCES" />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((src) => (
            <div
              key={src.id}
              className="hud-border bg-surface-card p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-mono text-gray-200">{src.name}</h3>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      src.enabled ? 'bg-tactical-green' : 'bg-gray-700'
                    }`}
                  />
                  <span className={`text-[9px] font-mono uppercase tracking-wider ${src.enabled ? 'text-tactical-green/60' : 'text-gray-700'}`}>
                    {src.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </span>
              </div>
              <p className="text-[10px] font-mono text-gray-600 truncate mb-2">{src.url}</p>
              <div className="flex items-center justify-between">
                <span className="border border-gray-800 px-1.5 py-0.5 text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                  {src.type}
                </span>
                <button
                  onClick={() => handlePoll(src.id)}
                  disabled={pollingId === src.id}
                  className="border border-amber/20 bg-amber/5 px-2 py-0.5 text-[9px] font-mono text-amber/60 hover:text-amber hover:bg-amber/10 disabled:opacity-30 uppercase tracking-wider transition-all"
                >
                  {pollingId === src.id ? 'QUEUED ✓' : 'POLL'}
                </button>
              </div>
            </div>
          ))}
          {sources.length === 0 && (
            <p className="text-[11px] font-mono text-gray-600 col-span-full text-center py-8 tracking-wider">
              NO SOURCES · RUN SEED SCRIPT TO ADD DEFAULTS
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
