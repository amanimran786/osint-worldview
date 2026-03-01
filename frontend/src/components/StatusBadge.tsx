import { clsx } from 'clsx';

const statusColors: Record<string, string> = {
  New: 'bg-blue-500/20 text-blue-400',
  'In Review': 'bg-yellow-500/20 text-yellow-400',
  Escalated: 'bg-red-500/20 text-red-400',
  Closed: 'bg-gray-500/20 text-gray-400',
  Dismissed: 'bg-gray-500/20 text-gray-500',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        statusColors[status] ?? 'bg-gray-500/20 text-gray-400',
      )}
    >
      {status}
    </span>
  );
}
