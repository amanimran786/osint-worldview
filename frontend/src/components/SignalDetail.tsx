import type { Signal } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { useStore } from '../store';
import { ExternalLink, X, MapPin, Brain, Loader2 } from 'lucide-react';
import { useState } from 'react';
import * as api from '../api';

interface Props {
  signal: Signal;
  onClose: () => void;
}

const statusOptions = ['New', 'In Review', 'Escalated', 'Dismissed', 'Closed'];

export function SignalDetail({ signal, onClose }: Props) {
  const patchSignal = useStore((s) => s.patchSignal);
  const [aiSummary, setAiSummary] = useState<string | null>(signal.ai_summary);
  const [summarizing, setSummarizing] = useState(false);

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const results = await api.summarizeSignals([signal.id]);
      const first = results[0];
      if (first) {
        setAiSummary(first.summary);
      }
    } catch {
      // silent fail
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-amber/10 bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber/10 px-4 py-3">
        <h2 className="text-[10px] font-display tracking-[0.15em] text-amber/70 uppercase">Signal Detail</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-amber/60">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-[12px] font-mono text-gray-200">{signal.title}</h3>
          <a
            href={signal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-amber/60 hover:text-amber"
          >
            Open source <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {signal.snippet && (
          <p className="text-[11px] font-mono text-gray-500 leading-relaxed">{signal.snippet}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
          <div>
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Severity</span>
            <div className="mt-1">
              <SeverityBadge score={signal.severity} />
            </div>
          </div>
          <div>
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Status</span>
            <div className="mt-1">
              <StatusBadge status={signal.status} />
            </div>
          </div>
          <div>
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Source</span>
            <div className="mt-1 text-gray-400">{signal.source}</div>
          </div>
          <div>
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Category</span>
            <div className="mt-1 text-gray-400">{signal.category ?? '—'}</div>
          </div>
        </div>

        {/* Location info */}
        {signal.location_name && (
          <div className="hud-border bg-surface-card p-3">
            <div className="flex items-center gap-1.5 text-[9px] text-gray-600 mb-1 uppercase tracking-wider">
              <MapPin className="h-3 w-3" />
              Geolocation
            </div>
            <p className="text-[11px] font-mono text-gray-300">
              {signal.location_name}
              {signal.country_code ? ` (${signal.country_code})` : ''}
            </p>
            {signal.latitude && signal.longitude && (
              <p className="text-[10px] font-mono text-gray-600 mt-0.5 tabular-nums">
                {signal.latitude.toFixed(4)}, {signal.longitude.toFixed(4)}
              </p>
            )}
          </div>
        )}

        {/* AI Summary */}
        <div className="hud-border bg-surface-card p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-[9px] text-gray-600 uppercase tracking-wider">
              <Brain className="h-3 w-3" />
              AI Summary
            </div>
            {!aiSummary && !summarizing && (
              <button
                onClick={handleSummarize}
                className="border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[9px] font-mono text-purple-400 hover:bg-purple-500/20 uppercase tracking-wider"
              >
                Generate
              </button>
            )}
          </div>
          {summarizing && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 py-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              ANALYZING...
            </div>
          )}
          {aiSummary && (
            <p className="text-[11px] font-mono text-gray-300 leading-relaxed">{aiSummary}</p>
          )}
          {!aiSummary && !summarizing && (
            <p className="text-[10px] font-mono text-gray-600">Click "Generate" to analyze.</p>
          )}
        </div>

        {/* Status changer */}
        <div>
          <label className="block text-[9px] font-mono text-gray-600 mb-1.5 uppercase tracking-wider">
            Change Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((st) => (
              <button
                key={st}
                disabled={signal.status === st}
                onClick={() => patchSignal(signal.id, { status: st })}
                className="border border-amber/15 px-2 py-1 text-[10px] font-mono text-gray-400 hover:bg-amber/5 hover:text-amber disabled:opacity-20 uppercase tracking-wider transition-all"
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
