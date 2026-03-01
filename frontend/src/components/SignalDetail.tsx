import type { Signal } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { useStore } from '../store';
import { ExternalLink, X } from 'lucide-react';

interface Props {
  signal: Signal;
  onClose: () => void;
}

const statusOptions = ['New', 'In Review', 'Escalated', 'Dismissed', 'Closed'];

export function SignalDetail({ signal, onClose }: Props) {
  const patchSignal = useStore((s) => s.patchSignal);

  return (
    <div className="flex h-full flex-col border-l border-gray-700/50 bg-surface-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700/50 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Signal Detail</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-base font-medium text-gray-100">{signal.title}</h3>
          <a
            href={signal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-brand-500 hover:underline"
          >
            Open source <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {signal.snippet && (
          <p className="text-sm text-gray-400 leading-relaxed">{signal.snippet}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-gray-500">Severity</span>
            <div className="mt-1">
              <SeverityBadge score={signal.severity} />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Status</span>
            <div className="mt-1">
              <StatusBadge status={signal.status} />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Source</span>
            <div className="mt-1 text-gray-300">{signal.source}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Category</span>
            <div className="mt-1 text-gray-300">{signal.category ?? '—'}</div>
          </div>
        </div>

        {/* Status changer */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Change status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((st) => (
              <button
                key={st}
                disabled={signal.status === st}
                onClick={() => patchSignal(signal.id, { status: st })}
                className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-300 hover:bg-surface-hover disabled:opacity-30"
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
