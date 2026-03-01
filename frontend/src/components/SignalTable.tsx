import type { Signal } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface Props {
  signals: Signal[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function SignalTable({ signals, selectedId, onSelect }: Props) {
  if (signals.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-[11px] font-mono text-gray-600 tracking-wider">
        NO SIGNALS FOUND
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] font-mono">
        <thead>
          <tr className="border-b border-amber/10 text-left text-[9px] uppercase tracking-[0.15em] text-amber/30">
            <th className="px-3 py-2.5 w-16">Score</th>
            <th className="px-3 py-2.5">Title</th>
            <th className="px-3 py-2.5 w-28">Source</th>
            <th className="px-3 py-2.5 w-24">Status</th>
            <th className="px-3 py-2.5 w-28">Age</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((sig) => (
            <tr
              key={sig.id}
              onClick={() => onSelect(sig.id)}
              className={clsx(
                'cursor-pointer border-b border-gray-900/50 hover:bg-amber/5 transition-colors',
                selectedId === sig.id && 'bg-amber/10 border-l-2 border-l-amber',
              )}
            >
              <td className="px-3 py-2.5">
                <SeverityBadge score={sig.severity} />
              </td>
              <td className="px-3 py-2.5">
                <div className="text-gray-300 line-clamp-1">
                  {sig.title}
                </div>
                {sig.snippet && (
                  <div className="mt-0.5 text-[10px] text-gray-600 line-clamp-1">
                    {sig.snippet}
                  </div>
                )}
              </td>
              <td className="px-3 py-2.5 text-gray-500">{sig.source}</td>
              <td className="px-3 py-2.5">
                <StatusBadge status={sig.status} />
              </td>
              <td className="px-3 py-2.5 text-gray-600">
                {sig.fetched_at
                  ? formatDistanceToNow(new Date(sig.fetched_at), {
                      addSuffix: true,
                    })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
