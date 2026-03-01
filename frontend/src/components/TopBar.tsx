import { RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { SearchBar } from './SearchBar';

export function TopBar({ title }: { title: string }) {
  const loading = useStore((s) => s.loading);
  const pollAll = useStore((s) => s.pollAll);

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-gray-700/50 bg-surface-card px-6">
      <h1 className="text-lg font-semibold text-white shrink-0">{title}</h1>
      <SearchBar />
      <button
        onClick={pollAll}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50 shrink-0"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        Poll feeds
      </button>
    </header>
  );
}
