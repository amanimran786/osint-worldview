import type { VisualMode } from '../types';
import { Monitor, Scan, Flame, Moon, Snowflake, Eye } from 'lucide-react';

const modes: { key: VisualMode; label: string; icon: typeof Monitor; color: string }[] = [
  { key: 'normal', label: 'Normal', icon: Monitor, color: 'text-gray-400' },
  { key: 'crt', label: 'CRT', icon: Scan, color: 'text-amber' },
  { key: 'nvg', label: 'NVG', icon: Eye, color: 'text-tactical-green' },
  { key: 'flir', label: 'FLIR', icon: Flame, color: 'text-orange-400' },
  { key: 'noir', label: 'Noir', icon: Moon, color: 'text-gray-300' },
  { key: 'snow', label: 'Snow', icon: Snowflake, color: 'text-blue-300' },
];

interface VisualModeSelectorProps {
  current: VisualMode;
  onChange: (mode: VisualMode) => void;
}

export function VisualModeSelector({ current, onChange }: VisualModeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {modes.map(({ key, label, icon: Icon, color }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          title={label}
          className={`
            flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wider
            border transition-all duration-150
            ${current === key
              ? `${color} border-amber/40 bg-amber/10 text-glow-amber`
              : 'text-gray-600 border-transparent hover:text-gray-400 hover:border-amber/20'
            }
          `}
        >
          <Icon className="h-3 w-3" />
          {label}
        </button>
      ))}
    </div>
  );
}
