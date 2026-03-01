import { clsx } from 'clsx';

const statusColors: Record<string, string> = {
  New: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'In Review': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Escalated: 'bg-red-500/15 text-red-400 border-red-500/30',
  Closed: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  Dismissed: 'bg-gray-500/15 text-gray-500 border-gray-500/30',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider',
        statusColors[status] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/30',
      )}
    >
      {status}
    </span>
  );
}
