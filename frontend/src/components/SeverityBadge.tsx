import { clsx } from 'clsx';
import { severityLevel } from '../types';

const colorMap = {
  low: 'bg-severity-low/20 text-severity-low border-severity-low/40',
  med: 'bg-severity-med/20 text-severity-med border-severity-med/40',
  high: 'bg-severity-high/20 text-severity-high border-severity-high/40',
  crit: 'bg-severity-crit/20 text-severity-crit border-severity-crit/40',
};

export function SeverityBadge({ score }: { score: number }) {
  const level = severityLevel(score);
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        colorMap[level],
      )}
    >
      {score}
    </span>
  );
}
