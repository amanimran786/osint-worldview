import { RefreshCw, Wifi } from 'lucide-react';
import { useStore } from '../store';
import { SearchBar } from './SearchBar';
import { useState, useEffect } from 'react';
import { useVariant } from '../contexts/VariantContext';

export function TopBar({ title }: { title: string }) {
  const loading = useStore((s) => s.loading);
  const pollAll = useStore((s) => s.pollAll);
  const { variantMeta } = useVariant();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-12 items-center justify-between gap-4 border-b border-amber/10 bg-surface px-4">
      {/* Title */}
      <div className="flex items-center gap-3 shrink-0">
        <h1 className="text-[12px] font-display tracking-[0.15em] text-amber uppercase text-glow-amber">
          {title}
        </h1>
        <div className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-tactical-green/60" />
          <span className="text-[9px] font-mono text-tactical-green/50 tracking-wider">
            LIVE · {variantMeta.shortName}
          </span>
        </div>
      </div>

      <SearchBar />

      {/* Right side */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden lg:inline text-[9px] font-mono text-amber/35 tracking-wider">
          CMD/CTRL+K
        </span>

        {/* UTC Clock */}
        <span className="text-[10px] font-mono text-amber/40 tabular-nums tracking-wider">
          {time.toISOString().slice(11, 19)} UTC
        </span>

        <button
          onClick={pollAll}
          disabled={loading}
          className="flex items-center gap-1.5 border border-amber/20 bg-amber/5 px-3 py-1 text-[10px] font-mono text-amber uppercase tracking-wider hover:bg-amber/10 disabled:opacity-30 transition-all"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          INGEST
        </button>
      </div>
    </header>
  );
}
