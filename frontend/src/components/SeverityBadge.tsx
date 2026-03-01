import { clsx } from 'clsx';
import { severityLevel } from '../types';

const colorMap = {
  low: 'bg-severity-low/15 text-severity-low border-severity-low/30',
  med: 'bg-severity-med/15 text-severity-med border-severity-med/30',
  high: 'bg-severity-high/15 text-severity-high border-severity-high/30',
  crit: 'bg-severity-crit/15 text-severity-crit border-severity-crit/30',
};

export function SeverityBadge({ score }: { score: number }) {
  const level = severityLevel(score);
  return (
    <span
      className={clsx(
        'inline-flex items-center border px-1.5 py-0.5 text-[10px] font-mono font-semibold tabular-nums',
        colorMap[level],
      )}
    >
      {score}
    </span>
  );
}
