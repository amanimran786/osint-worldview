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
      <TopBar title="Sources" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((src) => (
            <div
              key={src.id}
              className="rounded-xl border border-gray-700/50 bg-surface-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-200">{src.name}</h3>
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    src.enabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 truncate mb-1">{src.url}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
                  {src.type}
                </span>
                <button
                  onClick={() => handlePoll(src.id)}
                  disabled={pollingId === src.id}
                  className="rounded bg-brand-600/20 px-2 py-1 text-xs text-brand-400 hover:bg-brand-600/30 disabled:opacity-50"
                >
                  {pollingId === src.id ? 'Queued ✓' : 'Poll now'}
                </button>
              </div>
            </div>
          ))}
          {sources.length === 0 && (
            <p className="text-sm text-gray-500 col-span-full text-center py-8">
              No sources yet. Run the seed script to add defaults.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
