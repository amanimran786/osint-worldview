import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Filter, MapPin } from 'lucide-react';
import type { Signal } from '../types';
import { SeverityBadge } from './SeverityBadge';
import * as api from '../api';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Signal[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    min_severity?: number;
    has_location?: boolean;
  }>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      setLoading(true);
      try {
        const data = await api.searchSignals({
          q: q.trim(),
          limit: 15,
          ...filters,
        });
        setResults(data);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  const handleInput = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search signals, sources, locations…"
            className="w-full rounded-lg border border-gray-600 bg-surface pl-9 pr-8 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-brand-500 focus:outline-none"
          />
          {query && (
            <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`rounded-lg border p-1.5 ${showFilters ? 'border-brand-500 text-brand-400' : 'border-gray-600 text-gray-500'} hover:text-gray-300`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Filter dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-gray-600 bg-surface-card p-3 z-50 shadow-xl">
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 text-gray-400">
              Min severity:
              <input
                type="number"
                min={0}
                max={100}
                value={filters.min_severity ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, min_severity: e.target.value ? Number(e.target.value) : undefined }))
                }
                className="w-16 rounded border border-gray-600 bg-surface px-2 py-1 text-gray-200"
              />
            </label>
            <label className="flex items-center gap-1.5 text-gray-400">
              <input
                type="checkbox"
                checked={filters.has_location ?? false}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, has_location: e.target.checked || undefined }))
                }
                className="rounded"
              />
              Has location
            </label>
          </div>
        </div>
      )}

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-600 bg-surface-card shadow-xl z-50">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          )}
          {!loading && results.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">No results found</p>
          )}
          {!loading &&
            results.map((sig) => (
              <a
                key={sig.id}
                href={sig.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover border-b border-gray-700/30 last:border-0"
              >
                <SeverityBadge score={sig.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{sig.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{sig.source}</span>
                    {sig.location_name && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {sig.location_name}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
