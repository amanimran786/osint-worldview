/**
 * OSINT Bible Page — Optimized with DSA & UI Best Practices
 *
 * DSA:  Inverted search index (HashMap) for O(k) lookup vs O(N×M) linear scan
 *       Pre-computed tag frequency map for weighted tag cloud
 *       O(1) category lookup via HashMap
 *       Debounced search input (300ms) to prevent render thrashing
 *
 * UI:   React.memo on ToolCard & CategorySection to prevent re-renders
 *       Progressive disclosure (show-more per category)
 *       ARIA roles/labels for accessibility
 *       Keyboard navigation (Escape clears search, ⌘K focuses search)
 *       content-visibility: auto for off-screen paint optimization
 *       Smooth expand/collapse with max-height transitions
 *       Weighted tag cloud with frequency-based sizing
 *       Semantic component decomposition
 */

import { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';
import {
  Search, ExternalLink, ChevronDown, ChevronRight, BookOpen,
  Filter, Tag, Star, Globe, Shield, Zap, Eye, X, ArrowUp,
  Copy, Check, Hash, Layout, List, Grid3X3, Info, AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  OSINT_CATEGORIES, TOTAL_TOOLS, ALL_TAGS,
  TAG_FREQUENCY, TAG_MAX_FREQ, FREE_TOOL_COUNT,
  searchTools,
  type OSINTCategory, type OSINTTool,
} from '../data/osintBible';

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */
const DEBOUNCE_MS        = 300;
const INITIAL_TOOLS_SHOW = 12;   // progressive disclosure per category
const SCROLL_TOP_OFFSET  = 400;

/* ═══════════════════════════════════════════════════════════════════
   Hooks
   ═══════════════════════════════════════════════════════════════════ */

/** Debounced value hook — prevents render thrashing on fast typing */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

/** Highlight search matches in text — escapes regex specials */
function highlight(text: string, query: string): JSX.Element {
  if (!query || query.length < 2) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-amber/30 text-amber px-0.5 rounded-sm">{p}</mark>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ToolCard — React.memo prevents re-renders when props are unchanged
   ═══════════════════════════════════════════════════════════════════ */
const ToolCard = memo(function ToolCard({
  tool, query, compact,
}: {
  tool: OSINTTool;
  query: string;
  compact: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(tool.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [tool.url]);

  /* ── Compact view ── */
  if (compact) {
    return (
      <div
        role="listitem"
        className="group flex items-center gap-2 px-3 py-1.5 border border-transparent hover:border-amber/20 hover:bg-amber/5 transition-all"
      >
        <span className="text-[10px] font-mono text-amber/80 truncate flex-1">
          {highlight(tool.name, query)}
        </span>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${tool.name}`}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-amber/40 hover:text-amber transition"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  /* ── Full card view ── */
  return (
    <article
      role="listitem"
      className="group border border-amber/10 bg-surface-card hover:border-amber/30 hover:bg-surface-hover transition-all duration-200 p-3 space-y-2"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={clsx(
              'h-2 w-2 rounded-full flex-shrink-0',
              tool.free !== false ? 'bg-tactical-green' : 'bg-amber',
            )}
            aria-label={tool.free !== false ? 'Free tool' : 'Paid tool'}
          />
          <h4 className="text-[11px] font-mono font-semibold text-amber tracking-wide truncate">
            {highlight(tool.name, query)}
          </h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={copyUrl}
            className="p-1 text-amber/30 hover:text-amber transition"
            aria-label={copied ? 'URL copied' : `Copy URL for ${tool.name}`}
          >
            {copied ? <Check className="h-3 w-3 text-tactical-green" /> : <Copy className="h-3 w-3" />}
          </button>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-amber/30 hover:text-amber transition"
            aria-label={`Open ${tool.name} in new tab`}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Description */}
      <p className="text-[9px] font-mono text-gray-500 leading-relaxed">
        {highlight(tool.description, query)}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-1 flex-wrap" role="list" aria-label="Tags">
        {tool.free !== false && (
          <span className="px-1.5 py-0.5 text-[7px] font-mono font-bold tracking-wider uppercase bg-tactical-green/10 text-tactical-green border border-tactical-green/20 rounded-sm">
            FREE
          </span>
        )}
        {tool.free === false && (
          <span className="px-1.5 py-0.5 text-[7px] font-mono font-bold tracking-wider uppercase bg-amber/10 text-amber border border-amber/20 rounded-sm">
            PAID
          </span>
        )}
        {tool.tags?.map(tag => (
          <span
            key={tag}
            role="listitem"
            className="px-1.5 py-0.5 text-[7px] font-mono tracking-wider uppercase text-gray-600 border border-gray-800 rounded-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* URL preview */}
      <div className="text-[8px] font-mono text-gray-700 truncate" aria-label="URL">
        {tool.url}
      </div>
    </article>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   CategorySection — React.memo + progressive disclosure
   Uses content-visibility: auto for off-screen paint optimization
   ═══════════════════════════════════════════════════════════════════ */
const CategorySection = memo(function CategorySection({
  category, filteredTools, query, expanded, onToggle, viewMode,
}: {
  category: OSINTCategory;
  filteredTools: OSINTTool[];
  query: string;
  expanded: boolean;
  onToggle: () => void;
  viewMode: 'grid' | 'list' | 'compact';
}) {
  const [showAll, setShowAll] = useState(false);
  const toolCount = filteredTools.length;
  const needsTruncation = toolCount > INITIAL_TOOLS_SHOW;
  const visibleTools = showAll || !needsTruncation
    ? filteredTools
    : filteredTools.slice(0, INITIAL_TOOLS_SHOW);

  // Reset show-all when category collapses or filters change
  useEffect(() => {
    if (!expanded) setShowAll(false);
  }, [expanded]);

  useEffect(() => {
    setShowAll(false);
  }, [query, toolCount]);

  return (
    <section
      id={`cat-${category.id}`}
      aria-label={`${category.title} — ${toolCount} tools`}
      className="border border-amber/10 bg-surface-card/50 overflow-hidden"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 80px' }}
    >
      {/* Category Header */}
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`cat-content-${category.id}`}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber/5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber/40"
      >
        <span className="text-lg" aria-hidden="true">{category.icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-amber">
              {highlight(category.title, query)}
            </span>
            <span className="text-[8px] font-mono text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded-sm">
              {toolCount} tool{toolCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-[9px] font-mono text-gray-600 mt-0.5">
            {highlight(category.description, query)}
          </p>
        </div>
        <span
          className="text-[9px] font-mono px-2 py-0.5 rounded-sm border"
          style={{
            color: category.color,
            borderColor: `${category.color}33`,
            backgroundColor: `${category.color}10`,
          }}
        >
          §{category.number}
        </span>
        {expanded
          ? <ChevronDown className="h-4 w-4 text-amber/40 transition-transform" />
          : <ChevronRight className="h-4 w-4 text-amber/40 transition-transform" />}
      </button>

      {/* Expanded content with smooth transition */}
      <div
        id={`cat-content-${category.id}`}
        role="region"
        aria-labelledby={`cat-${category.id}`}
        className={clsx(
          'transition-all duration-300 ease-in-out overflow-hidden',
          expanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="border-t border-amber/10">
          {/* Methodology tips */}
          {category.methodology && category.methodology.length > 0 && (
            <div className="mx-4 mt-3 mb-2 p-3 border border-amber/15 bg-amber/5 space-y-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Info className="h-3 w-3 text-amber/60" aria-hidden="true" />
                <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-amber/60 uppercase">
                  Methodology
                </span>
              </div>
              {category.methodology.map((step, i) => (
                <div key={i} className="text-[9px] font-mono text-amber/50 leading-relaxed">
                  {step || <br />}
                </div>
              ))}
            </div>
          )}

          {/* Tool Grid/List — role="list" for semantics */}
          <div
            role="list"
            aria-label={`${category.title} tools`}
            className={clsx(
              'p-4',
              viewMode === 'grid' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2',
              viewMode === 'list' && 'space-y-2',
              viewMode === 'compact' && 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
            )}
          >
            {visibleTools.map(tool => (
              <ToolCard
                key={tool.name + tool.url}
                tool={tool}
                query={query}
                compact={viewMode === 'compact'}
              />
            ))}
          </div>

          {/* Progressive disclosure — "Show More" button */}
          {needsTruncation && (
            <div className="px-4 pb-3">
              <button
                onClick={() => setShowAll(prev => !prev)}
                className="w-full py-1.5 border border-amber/15 bg-surface hover:bg-amber/5 transition text-[9px] font-mono text-amber/60 hover:text-amber tracking-wider uppercase flex items-center justify-center gap-1.5"
                aria-label={showAll ? 'Show fewer tools' : `Show all ${toolCount} tools`}
              >
                {showAll ? (
                  <>
                    <ChevronDown className="h-3 w-3 rotate-180" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show All {toolCount} Tools ({toolCount - INITIAL_TOOLS_SHOW} more)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   QuickNavPill — React.memo for scroll nav
   ═══════════════════════════════════════════════════════════════════ */
const QuickNavPill = memo(function QuickNavPill({
  category, onClick, isActive,
}: {
  category: OSINTCategory;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Jump to ${category.title}`}
      className={clsx(
        'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-mono tracking-wider uppercase transition-all whitespace-nowrap',
        isActive
          ? 'border-amber/40 bg-amber/15 text-amber'
          : 'border-gray-800 bg-surface-card text-gray-600 hover:text-amber/70 hover:border-amber/20',
      )}
    >
      <span className="text-xs" aria-hidden="true">{category.icon}</span>
      <span className="hidden sm:inline">{category.title}</span>
      <span className="sm:hidden">§{category.number}</span>
    </button>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   WeightedTagCloud — frequency-based sizing from pre-computed map
   ═══════════════════════════════════════════════════════════════════ */
const WeightedTagCloud = memo(function WeightedTagCloud({
  selectedTag, onSelectTag,
}: {
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}) {
  return (
    <div
      role="listbox"
      aria-label="Filter by tag"
      className="flex flex-wrap gap-1 p-2 border border-amber/10 bg-surface-card"
    >
      <button
        role="option"
        aria-selected={!selectedTag}
        onClick={() => onSelectTag(null)}
        className={clsx(
          'px-1.5 py-0.5 text-[7px] font-mono tracking-wider uppercase border transition',
          !selectedTag
            ? 'border-amber/30 bg-amber/10 text-amber'
            : 'border-gray-800 text-gray-600 hover:text-amber/50',
        )}
      >
        ALL
      </button>
      {ALL_TAGS.map(tag => {
        const freq = TAG_FREQUENCY.get(tag) ?? 1;
        // Normalize frequency to a 0–1 scale for visual weight
        const weight = Math.min(freq / TAG_MAX_FREQ, 1);
        const opacity = 0.4 + weight * 0.6; // range 0.4 – 1.0
        return (
          <button
            key={tag}
            role="option"
            aria-selected={selectedTag === tag}
            onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
            title={`${tag} (${freq} tool${freq !== 1 ? 's' : ''})`}
            className={clsx(
              'px-1.5 py-0.5 font-mono tracking-wider uppercase border transition',
              selectedTag === tag
                ? 'border-tactical-cyan/40 bg-tactical-cyan/10 text-tactical-cyan'
                : 'border-gray-800 text-gray-600 hover:text-amber/50',
            )}
            style={{
              fontSize: `${7 + weight * 3}px`, // 7px – 10px based on frequency
              opacity: selectedTag === tag ? 1 : opacity,
            }}
          >
            {tag}
            <span className="ml-0.5 text-gray-700" style={{ fontSize: '6px' }}>
              {freq}
            </span>
          </button>
        );
      })}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export function OSINTBiblePage() {
  /* ── State ── */
  const [rawQuery, setRawQuery] = useState('');
  const query = useDebouncedValue(rawQuery, DEBOUNCE_MS); // DSA: debounced to prevent O(N) on every keystroke
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [filterFree, setFilterFree] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* ── Scroll tracking with passive listener ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > SCROLL_TOP_OFFSET);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Auto-expand when searching ── */
  useEffect(() => {
    if (query.length >= 2) {
      setExpandedIds(new Set(OSINT_CATEGORIES.map(c => c.id)));
    }
  }, [query]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Escape: clear search and refocus
      if (e.key === 'Escape' && rawQuery) {
        e.preventDefault();
        setRawQuery('');
        searchRef.current?.focus();
      }
      // Ctrl/Cmd + K: focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rawQuery]);

  /* ── Stable callbacks ── */
  const toggleCategory = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(OSINT_CATEGORIES.map(c => c.id)));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const scrollToCategory = useCallback((id: string) => {
    setExpandedIds(prev => new Set([...prev, id]));
    requestAnimationFrame(() => {
      document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleTagSelect = useCallback((tag: string | null) => {
    setSelectedTag(tag);
  }, []);

  /* ══════════════════════════════════════════════════════════════════
     Core filtering — uses inverted index for O(k) search
     ══════════════════════════════════════════════════════════════════ */
  const filteredCategories = useMemo(() => {
    // Step 1: Get search matches from inverted index (DSA: O(k) vs O(N×M))
    const indexMatches = query.length >= 2 ? searchTools(query) : null;

    return OSINT_CATEGORIES.map(cat => {
      let tools = cat.tools;

      // Step 2: Apply indexed search filter
      if (indexMatches) {
        const matchedIndices = indexMatches.get(cat.id);
        if (!matchedIndices) {
          // Check if category title/description matches (fallback for category-level search)
          const q = query.toLowerCase();
          const catMatch = cat.title.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q);
          if (!catMatch) tools = [];
          // If catMatch, keep all tools in this category
        } else {
          // Only include tools that appear in the index
          tools = tools.filter((_, idx) => matchedIndices.has(idx));
        }
      }

      // Step 3: Apply free filter
      if (filterFree) tools = tools.filter(t => t.free !== false);

      // Step 4: Apply tag filter
      if (selectedTag) tools = tools.filter(t => (t.tags ?? []).includes(selectedTag));

      return { ...cat, tools };
    }).filter(cat => cat.tools.length > 0 || (query.length < 2 && !filterFree && !selectedTag));
  }, [query, filterFree, selectedTag]);

  const totalFiltered = useMemo(
    () => filteredCategories.reduce((sum, c) => sum + c.tools.length, 0),
    [filteredCategories],
  );

  const hasActiveFilters = filterFree || selectedTag || query.length >= 2;

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto scroll-smooth"
      role="main"
      aria-label="OSINT Bible — Tool Directory"
    >
      {/* ═══════════════ HERO HEADER ═══════════════ */}
      <header className="relative border-b border-amber/10 bg-gradient-to-b from-surface-card to-surface overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(rgba(240,160,48,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(240,160,48,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-amber" aria-hidden="true" />
                <h1 className="text-lg font-display tracking-[0.2em] text-amber text-glow-amber uppercase">
                  OSINT Bible
                </h1>
                <span className="px-2 py-0.5 text-[8px] font-mono tracking-[0.3em] text-amber/50 border border-amber/20 bg-amber/5 uppercase">
                  2026 Edition
                </span>
              </div>
              <p className="text-[10px] font-mono text-gray-500 max-w-xl leading-relaxed">
                Comprehensive compilation of {TOTAL_TOOLS}+ tools, procedures, and methodologies for
                open source intelligence research. Organized into {OSINT_CATEGORIES.length} categories
                covering search, social networks, GEOINT, domain analysis, dark web, automation, AI,
                blockchain, transport, and more.
              </p>
              <p className="text-[8px] font-mono text-gray-700 mt-1.5">
                Source:{' '}
                <a
                  href="https://github.com/frangelbarrera/OSINT-BIBLE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber/40 hover:text-amber underline"
                >
                  github.com/frangelbarrera/OSINT-BIBLE
                </a>
              </p>
            </div>

            {/* Stats panel */}
            <div className="hidden lg:flex items-center gap-4" role="group" aria-label="Statistics">
              {[
                { label: 'TOOLS', value: TOTAL_TOOLS, icon: Zap, color: 'text-tactical-green' },
                { label: 'FREE', value: FREE_TOOL_COUNT, icon: Star, color: 'text-tactical-green' },
                { label: 'CATEGORIES', value: OSINT_CATEGORIES.length, icon: Layout, color: 'text-amber' },
                { label: 'TAGS', value: ALL_TAGS.length, icon: Tag, color: 'text-tactical-cyan' },
              ].map(s => (
                <div key={s.label} className="text-center px-4 py-2 border border-amber/10 bg-surface/50">
                  <s.icon className={clsx('h-3.5 w-3.5 mx-auto mb-1', s.color)} aria-hidden="true" />
                  <div className={clsx('text-sm font-display', s.color)}>{s.value}</div>
                  <div className="text-[7px] font-mono text-gray-600 tracking-[0.2em] uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Cycle strip */}
          <div className="mt-4 flex items-center gap-2 flex-wrap" role="list" aria-label="Intelligence Cycle">
            <Shield className="h-3 w-3 text-amber/40" aria-hidden="true" />
            <span className="text-[8px] font-mono text-amber/40 tracking-[0.15em] uppercase">
              Intelligence Cycle:
            </span>
            {['Direction', 'Collection', 'Processing', 'Analysis', 'Dissemination'].map((step, i) => (
              <span key={step} role="listitem" className="flex items-center gap-1">
                <span className="text-[8px] font-mono text-amber/60 tracking-wider">{step}</span>
                {i < 4 && <span className="text-amber/20" aria-hidden="true">→</span>}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════════════ CONTROLS BAR (sticky) ═══════════════ */}
      <div
        className="sticky top-0 z-30 border-b border-amber/10 bg-surface/95 backdrop-blur-sm"
        role="toolbar"
        aria-label="Search and filter controls"
      >
        <div className="px-4 py-2 space-y-2">
          {/* Search + Controls Row */}
          <div className="flex items-center gap-2">
            {/* Search — debounced input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 border border-amber/15 bg-surface-card focus-within:border-amber/40 transition-colors">
              <Search className="h-3.5 w-3.5 text-amber/40" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                role="searchbox"
                value={rawQuery}
                onChange={e => setRawQuery(e.target.value)}
                placeholder="Search tools, categories, tags, URLs... (⌘K)"
                aria-label="Search OSINT tools"
                className="flex-1 bg-transparent text-[10px] font-mono text-amber placeholder:text-gray-700 outline-none"
              />
              {rawQuery && (
                <button
                  onClick={() => setRawQuery('')}
                  className="text-gray-600 hover:text-amber transition"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center border border-amber/15 bg-surface-card" role="radiogroup" aria-label="View mode">
              {([
                { mode: 'grid' as const, icon: Grid3X3, label: 'Grid view' },
                { mode: 'list' as const, icon: List, label: 'List view' },
                { mode: 'compact' as const, icon: Layout, label: 'Compact view' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  role="radio"
                  aria-checked={viewMode === mode}
                  aria-label={label}
                  className={clsx(
                    'p-1.5 transition-colors',
                    viewMode === mode ? 'text-amber bg-amber/15' : 'text-gray-600 hover:text-amber/60',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {/* Free filter */}
            <button
              onClick={() => setFilterFree(!filterFree)}
              aria-pressed={filterFree}
              aria-label="Show only free tools"
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-mono tracking-wider uppercase transition-all',
                filterFree
                  ? 'border-tactical-green/40 bg-tactical-green/10 text-tactical-green'
                  : 'border-gray-800 text-gray-600 hover:text-amber/60 hover:border-amber/20',
              )}
            >
              <Star className="h-3 w-3" aria-hidden="true" />
              FREE
            </button>

            {/* Tag filter toggle */}
            <button
              onClick={() => setShowTags(!showTags)}
              aria-pressed={showTags}
              aria-label={selectedTag ? `Filtering by tag: ${selectedTag}` : 'Toggle tag filter'}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-mono tracking-wider uppercase transition-all',
                selectedTag
                  ? 'border-tactical-cyan/40 bg-tactical-cyan/10 text-tactical-cyan'
                  : 'border-gray-800 text-gray-600 hover:text-amber/60 hover:border-amber/20',
              )}
            >
              <Filter className="h-3 w-3" aria-hidden="true" />
              {selectedTag || 'TAGS'}
            </button>

            {/* Expand/Collapse */}
            <button
              onClick={expandAll}
              className="px-2 py-1.5 border border-gray-800 text-[9px] font-mono text-gray-600 hover:text-amber/60 hover:border-amber/20 transition"
              aria-label="Expand all categories"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1.5 border border-gray-800 text-[9px] font-mono text-gray-600 hover:text-amber/60 hover:border-amber/20 transition"
              aria-label="Collapse all categories"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Weighted Tag Cloud (collapsible) */}
          {showTags && (
            <WeightedTagCloud selectedTag={selectedTag} onSelectTag={handleTagSelect} />
          )}

          {/* Result count + active filters (live region for screen readers) */}
          <div className="flex items-center gap-2" role="status" aria-live="polite">
            <Hash className="h-3 w-3 text-gray-700" aria-hidden="true" />
            <span className="text-[9px] font-mono text-gray-600">
              {totalFiltered} tool{totalFiltered !== 1 ? 's' : ''} across {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
            </span>
            {hasActiveFilters && (
              <span className="text-[8px] font-mono text-amber/40">
                (filtered from {TOTAL_TOOLS} total)
              </span>
            )}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[7px] font-mono text-tactical-cyan border border-tactical-cyan/20 bg-tactical-cyan/5 hover:bg-tactical-cyan/10 transition"
                aria-label={`Remove tag filter: ${selectedTag}`}
              >
                <Tag className="h-2.5 w-2.5" aria-hidden="true" />
                {selectedTag}
                <X className="h-2 w-2" />
              </button>
            )}
            {/* Debounce indicator */}
            {rawQuery !== query && rawQuery.length >= 2 && (
              <span className="text-[7px] font-mono text-amber/30 animate-pulse">searching…</span>
            )}
          </div>
        </div>

        {/* Quick nav */}
        <nav
          className="flex items-center gap-1 px-4 py-1.5 overflow-x-auto border-t border-amber/5 bg-surface/80 scrollbar-hide"
          aria-label="Category quick navigation"
        >
          {filteredCategories.map(cat => (
            <QuickNavPill
              key={cat.id}
              category={cat}
              onClick={() => scrollToCategory(cat.id)}
              isActive={expandedIds.has(cat.id)}
            />
          ))}
        </nav>
      </div>

      {/* ═══════════════ OSINT WARNING ═══════════════ */}
      <div
        className="mx-4 mt-4 p-3 border border-amber/20 bg-amber/5 flex items-start gap-3"
        role="alert"
      >
        <AlertTriangle className="h-4 w-4 text-amber flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <div className="text-[9px] font-mono font-bold tracking-[0.15em] text-amber uppercase mb-1">
            Ethical Disclaimer
          </div>
          <p className="text-[8px] font-mono text-amber/60 leading-relaxed">
            All tools and techniques listed here are for legal, ethical OSINT research only.
            Always verify legality in your jurisdiction. Never bypass authentication or access controls.
            Use only publicly accessible information. Document your methodology for legal defensibility.
            Respect GDPR, CCPA, and local privacy laws.
          </p>
        </div>
      </div>

      {/* ═══════════════ CATEGORIES ═══════════════ */}
      <div className="p-4 space-y-2">
        {filteredCategories.map(cat => (
          <CategorySection
            key={cat.id}
            category={cat}
            filteredTools={cat.tools}
            query={query}
            expanded={expandedIds.has(cat.id)}
            onToggle={() => toggleCategory(cat.id)}
            viewMode={viewMode}
          />
        ))}

        {/* Empty state */}
        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
            <Globe className="h-10 w-10 text-gray-800 mb-3" aria-hidden="true" />
            <p className="text-[11px] font-mono text-gray-600 tracking-wider">
              No tools match your search criteria
            </p>
            <p className="text-[9px] font-mono text-gray-700 mt-1">
              Try broadening your search or removing filters
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => { setRawQuery(''); setFilterFree(false); setSelectedTag(null); }}
                className="mt-3 px-3 py-1.5 border border-amber/20 text-[9px] font-mono text-amber/60 hover:text-amber hover:border-amber/40 transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════ METHODOLOGY REFERENCE ═══════════════ */}
      <section className="mx-4 mb-6 border border-amber/15 bg-surface-card" aria-label="Methodology reference">
        <div className="px-4 py-3 border-b border-amber/10 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber/60" aria-hidden="true" />
          <h3 className="text-[11px] font-mono font-bold tracking-[0.15em] text-amber uppercase">
            Quick Reference — Professional OSINT Methodology
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {/* Bellingcat */}
          <div className="space-y-2">
            <div className="text-[9px] font-mono font-bold text-amber/70 tracking-[0.15em] uppercase">
              Bellingcat Methodology
            </div>
            {[
              { step: '1', title: 'Identification', desc: 'What are we investigating?' },
              { step: '2', title: 'Preservation', desc: 'Archive EVERYTHING (archive.is, wayback)' },
              { step: '3', title: 'Verification', desc: 'Triangulate with 3+ sources' },
              { step: '4', title: 'Contextualization', desc: 'Complete chronology' },
              { step: '5', title: 'Documentation', desc: 'Screenshots + hash + timestamp' },
              { step: '6', title: 'Validation', desc: 'Peer review before publishing' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-amber/10 border border-amber/20 text-[8px] font-mono font-bold text-amber">
                  {s.step}
                </span>
                <div>
                  <span className="text-[9px] font-mono text-amber/80">{s.title}</span>
                  <span className="text-[8px] font-mono text-gray-600 ml-1.5">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Intelligence Cycle */}
          <div className="space-y-2">
            <div className="text-[9px] font-mono font-bold text-amber/70 tracking-[0.15em] uppercase">
              Professional OSINT Cycle
            </div>
            {[
              { step: '1', title: 'Planning & Requirements', desc: 'Define scope, objectives, constraints' },
              { step: '2', title: 'Collection', desc: 'Gather data from identified sources' },
              { step: '3', title: 'Processing & Exploitation', desc: 'Clean, normalize, structure raw data' },
              { step: '4', title: 'Analysis & Production', desc: 'Correlate, interpret, create intelligence' },
              { step: '5', title: 'Dissemination & Feedback', desc: 'Report findings, iterate' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-tactical-cyan/10 border border-tactical-cyan/20 text-[8px] font-mono font-bold text-tactical-cyan">
                  {s.step}
                </span>
                <div>
                  <span className="text-[9px] font-mono text-tactical-cyan/80">{s.title}</span>
                  <span className="text-[8px] font-mono text-gray-600 ml-1.5">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-amber/10 bg-surface-card/50 px-4 py-3 flex items-center justify-between">
        <span className="text-[8px] font-mono text-gray-700 tracking-wider">
          OSINT BIBLE 2026 · {TOTAL_TOOLS} TOOLS · {OSINT_CATEGORIES.length} CATEGORIES · WORLDVIEW INTEGRATED
        </span>
        <a
          href="https://github.com/frangelbarrera/OSINT-BIBLE"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] font-mono text-amber/40 hover:text-amber tracking-wider flex items-center gap-1"
        >
          <Globe className="h-3 w-3" aria-hidden="true" />
          VIEW ON GITHUB
        </a>
      </footer>

      {/* ═══════════════ SCROLL TO TOP (FAB) ═══════════════ */}
      {showScrollTop && (
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 p-2.5 bg-amber/20 border border-amber/40 text-amber hover:bg-amber/30 transition-all backdrop-blur-sm shadow-amber-glow"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
