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
      <div className="flex h-40 items-center justify-center text-sm text-gray-500">
        No signals found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3 w-16">Score</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3 w-28">Source</th>
            <th className="px-4 py-3 w-24">Status</th>
            <th className="px-4 py-3 w-28">Age</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((sig) => (
            <tr
              key={sig.id}
              onClick={() => onSelect(sig.id)}
              className={clsx(
                'cursor-pointer border-b border-gray-800/50 hover:bg-surface-hover',
                selectedId === sig.id && 'bg-brand-600/10',
              )}
            >
              <td className="px-4 py-3">
                <SeverityBadge score={sig.severity} />
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-200 line-clamp-1">
                  {sig.title}
                </div>
                {sig.snippet && (
                  <div className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    {sig.snippet}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-400">{sig.source}</td>
              <td className="px-4 py-3">
                <StatusBadge status={sig.status} />
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
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
