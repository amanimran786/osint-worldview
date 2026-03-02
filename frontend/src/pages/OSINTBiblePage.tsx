import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Search, ExternalLink, ChevronDown, ChevronRight, BookOpen,
  Filter, Tag, Star, Globe, Shield, Zap, Eye, X, ArrowUp,
  Copy, Check, Hash, Layout, List, Grid3X3, Info, AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  OSINT_CATEGORIES, TOTAL_TOOLS, ALL_TAGS,
  type OSINTCategory, type OSINTTool,
} from '../data/osintBible';

/* ─────────────────────────── Helpers ─────────────────────────── */
function highlight(text: string, query: string): JSX.Element {
  if (!query || query.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-amber/30 text-amber px-0.5 rounded">{p}</mark>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

/* ─────────────────────────── ToolCard ─────────────────────────── */
function ToolCard({ tool, query, compact }: { tool: OSINTTool; query: string; compact: boolean }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(tool.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [tool.url]);

  if (compact) {
    return (
      <div className="group flex items-center gap-2 px-3 py-1.5 border border-transparent hover:border-amber/20 hover:bg-amber/5 transition-all">
        <span className="text-[10px] font-mono text-amber/80 truncate flex-1">
          {highlight(tool.name, query)}
        </span>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 text-amber/40 hover:text-amber transition"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="group border border-amber/10 bg-surface-card hover:border-amber/30 hover:bg-surface-hover transition-all duration-200 p-3 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={clsx(
            'h-2 w-2 rounded-full flex-shrink-0',
            tool.free !== false ? 'bg-tactical-green' : 'bg-amber'
          )} />
          <h4 className="text-[11px] font-mono font-semibold text-amber tracking-wide truncate">
            {highlight(tool.name, query)}
          </h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={copyUrl}
            className="p-1 text-amber/30 hover:text-amber transition"
            title="Copy URL"
          >
            {copied ? <Check className="h-3 w-3 text-tactical-green" /> : <Copy className="h-3 w-3" />}
          </button>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-amber/30 hover:text-amber transition"
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Description */}
      <p className="text-[9px] font-mono text-gray-500 leading-relaxed">
        {highlight(tool.description, query)}
      </p>

      {/* Tags + Free badge */}
      <div className="flex items-center gap-1 flex-wrap">
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
            className="px-1.5 py-0.5 text-[7px] font-mono tracking-wider uppercase text-gray-600 border border-gray-800 rounded-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* URL */}
      <div className="text-[8px] font-mono text-gray-700 truncate">
        {tool.url}
      </div>
    </div>
  );
}

/* ─────────────────────────── CategorySection ─────────────────────────── */
function CategorySection({
  category, query, expanded, onToggle, viewMode,
}: {
  category: OSINTCategory;
  query: string;
  expanded: boolean;
  onToggle: () => void;
  viewMode: 'grid' | 'list' | 'compact';
}) {
  const filteredTools = useMemo(() => {
    if (!query || query.length < 2) return category.tools;
    const q = query.toLowerCase();
    return category.tools.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.url.toLowerCase().includes(q) ||
        (t.tags ?? []).some(tag => tag.toLowerCase().includes(q))
    );
  }, [category.tools, query]);

  if (query && query.length >= 2 && filteredTools.length === 0) return null;

  return (
    <div className="border border-amber/10 bg-surface-card/50 overflow-hidden" id={`cat-${category.id}`}>
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber/5 transition-colors"
      >
        <span className="text-lg">{category.icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-amber">
              {highlight(category.title, query)}
            </span>
            <span className="text-[8px] font-mono text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded-sm">
              {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}
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
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-amber/40" />
        ) : (
          <ChevronRight className="h-4 w-4 text-amber/40" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-amber/10">
          {/* Methodology tips */}
          {category.methodology && category.methodology.length > 0 && (
            <div className="mx-4 mt-3 mb-2 p-3 border border-amber/15 bg-amber/5 space-y-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Info className="h-3 w-3 text-amber/60" />
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

          {/* Tool Grid/List */}
          <div
            className={clsx(
              'p-4',
              viewMode === 'grid' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2',
              viewMode === 'list' && 'space-y-2',
              viewMode === 'compact' && 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
            )}
          >
            {filteredTools.map(tool => (
              <ToolCard
                key={tool.name + tool.url}
                tool={tool}
                query={query}
                compact={viewMode === 'compact'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── QuickNavPill ─────────────────────────── */
function QuickNavPill({ category, onClick, isActive }: {
  category: OSINTCategory;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-mono tracking-wider uppercase transition-all whitespace-nowrap',
        isActive
          ? 'border-amber/40 bg-amber/15 text-amber'
          : 'border-gray-800 bg-surface-card text-gray-600 hover:text-amber/70 hover:border-amber/20',
      )}
    >
      <span className="text-xs">{category.icon}</span>
      <span className="hidden sm:inline">{category.title}</span>
      <span className="sm:hidden">§{category.number}</span>
    </button>
  );
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */
export function OSINTBiblePage() {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [filterFree, setFilterFree] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll tracking
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 400);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-expand when searching
  useEffect(() => {
    if (query.length >= 2) {
      setExpandedIds(new Set(OSINT_CATEGORIES.map(c => c.id)));
    }
  }, [query]);

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
    setTimeout(() => {
      document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return OSINT_CATEGORIES.map(cat => {
      let tools = cat.tools;
      if (filterFree) tools = tools.filter(t => t.free !== false);
      if (selectedTag) tools = tools.filter(t => (t.tags ?? []).includes(selectedTag));
      if (query.length >= 2) {
        const q = query.toLowerCase();
        tools = tools.filter(
          t =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.url.toLowerCase().includes(q) ||
            (t.tags ?? []).some(tag => tag.toLowerCase().includes(q)) ||
            cat.title.toLowerCase().includes(q) ||
            cat.description.toLowerCase().includes(q)
        );
      }
      return { ...cat, tools };
    }).filter(cat => cat.tools.length > 0 || (query.length < 2 && !filterFree && !selectedTag));
  }, [query, filterFree, selectedTag]);

  const totalFiltered = filteredCategories.reduce((sum, c) => sum + c.tools.length, 0);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
      {/* ═══════════════ HERO HEADER ═══════════════ */}
      <div className="relative border-b border-amber/10 bg-gradient-to-b from-surface-card to-surface overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5"
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
                <BookOpen className="h-6 w-6 text-amber" />
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
                Source: <a href="https://github.com/frangelbarrera/OSINT-BIBLE" target="_blank" rel="noopener noreferrer" className="text-amber/40 hover:text-amber underline">github.com/frangelbarrera/OSINT-BIBLE</a>
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-4">
              {[
                { label: 'TOOLS', value: TOTAL_TOOLS, icon: Zap, color: 'text-tactical-green' },
                { label: 'CATEGORIES', value: OSINT_CATEGORIES.length, icon: Layout, color: 'text-amber' },
                { label: 'TAGS', value: ALL_TAGS.length, icon: Tag, color: 'text-tactical-cyan' },
              ].map(s => (
                <div key={s.label} className="text-center px-4 py-2 border border-amber/10 bg-surface/50">
                  <s.icon className={clsx('h-3.5 w-3.5 mx-auto mb-1', s.color)} />
                  <div className={clsx('text-sm font-display', s.color)}>{s.value}</div>
                  <div className="text-[7px] font-mono text-gray-600 tracking-[0.2em] uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence Cycle strip */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Shield className="h-3 w-3 text-amber/40" />
            <span className="text-[8px] font-mono text-amber/40 tracking-[0.15em] uppercase">
              Intelligence Cycle:
            </span>
            {['Direction', 'Collection', 'Processing', 'Analysis', 'Dissemination'].map((step, i) => (
              <span key={step} className="flex items-center gap-1">
                <span className="text-[8px] font-mono text-amber/60 tracking-wider">{step}</span>
                {i < 4 && <span className="text-amber/20">→</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ CONTROLS BAR ═══════════════ */}
      <div className="sticky top-0 z-30 border-b border-amber/10 bg-surface/95 backdrop-blur-sm">
        <div className="px-4 py-2 space-y-2">
          {/* Search + Controls Row */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 border border-amber/15 bg-surface-card">
              <Search className="h-3.5 w-3.5 text-amber/40" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tools, categories, tags, URLs..."
                className="flex-1 bg-transparent text-[10px] font-mono text-amber placeholder:text-gray-700 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-600 hover:text-amber">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center border border-amber/15 bg-surface-card">
              {([
                { mode: 'grid' as const, icon: Grid3X3 },
                { mode: 'list' as const, icon: List },
                { mode: 'compact' as const, icon: Layout },
              ]).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={clsx(
                    'p-1.5 transition-colors',
                    viewMode === mode ? 'text-amber bg-amber/15' : 'text-gray-600 hover:text-amber/60'
                  )}
                  title={mode}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {/* Free filter */}
            <button
              onClick={() => setFilterFree(!filterFree)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-mono tracking-wider uppercase transition-all',
                filterFree
                  ? 'border-tactical-green/40 bg-tactical-green/10 text-tactical-green'
                  : 'border-gray-800 text-gray-600 hover:text-amber/60 hover:border-amber/20'
              )}
            >
              <Star className="h-3 w-3" />
              FREE
            </button>

            {/* Tag filter */}
            <button
              onClick={() => setShowTags(!showTags)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-mono tracking-wider uppercase transition-all',
                selectedTag
                  ? 'border-tactical-cyan/40 bg-tactical-cyan/10 text-tactical-cyan'
                  : 'border-gray-800 text-gray-600 hover:text-amber/60 hover:border-amber/20'
              )}
            >
              <Filter className="h-3 w-3" />
              {selectedTag || 'TAGS'}
            </button>

            {/* Expand/Collapse */}
            <button
              onClick={expandAll}
              className="px-2 py-1.5 border border-gray-800 text-[9px] font-mono text-gray-600 hover:text-amber/60 hover:border-amber/20 transition"
              title="Expand all"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1.5 border border-gray-800 text-[9px] font-mono text-gray-600 hover:text-amber/60 hover:border-amber/20 transition"
              title="Collapse all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Tag Cloud (collapsible) */}
          {showTags && (
            <div className="flex flex-wrap gap-1 p-2 border border-amber/10 bg-surface-card">
              <button
                onClick={() => setSelectedTag(null)}
                className={clsx(
                  'px-1.5 py-0.5 text-[7px] font-mono tracking-wider uppercase border transition',
                  !selectedTag
                    ? 'border-amber/30 bg-amber/10 text-amber'
                    : 'border-gray-800 text-gray-600 hover:text-amber/50'
                )}
              >
                ALL
              </button>
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={clsx(
                    'px-1.5 py-0.5 text-[7px] font-mono tracking-wider uppercase border transition',
                    selectedTag === tag
                      ? 'border-tactical-cyan/40 bg-tactical-cyan/10 text-tactical-cyan'
                      : 'border-gray-800 text-gray-600 hover:text-amber/50'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Result count + active filters */}
          <div className="flex items-center gap-2">
            <Hash className="h-3 w-3 text-gray-700" />
            <span className="text-[9px] font-mono text-gray-600">
              {totalFiltered} tools across {filteredCategories.length} categories
            </span>
            {(filterFree || selectedTag || query) && (
              <span className="text-[8px] font-mono text-amber/40">
                (filtered from {TOTAL_TOOLS} total)
              </span>
            )}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[7px] font-mono text-tactical-cyan border border-tactical-cyan/20 bg-tactical-cyan/5"
              >
                <Tag className="h-2.5 w-2.5" />
                {selectedTag}
                <X className="h-2 w-2" />
              </button>
            )}
          </div>
        </div>

        {/* Quick nav */}
        <div className="flex items-center gap-1 px-4 py-1.5 overflow-x-auto border-t border-amber/5 bg-surface/80 scrollbar-hide">
          {filteredCategories.map(cat => (
            <QuickNavPill
              key={cat.id}
              category={cat}
              onClick={() => scrollToCategory(cat.id)}
              isActive={expandedIds.has(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════ OSINT WARNING ═══════════════ */}
      <div className="mx-4 mt-4 p-3 border border-amber/20 bg-amber/5 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber flex-shrink-0 mt-0.5" />
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
            query={query}
            expanded={expandedIds.has(cat.id)}
            onToggle={() => toggleCategory(cat.id)}
            viewMode={viewMode}
          />
        ))}

        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Globe className="h-10 w-10 text-gray-800 mb-3" />
            <p className="text-[11px] font-mono text-gray-600 tracking-wider">
              No tools match your search criteria
            </p>
            <p className="text-[9px] font-mono text-gray-700 mt-1">
              Try broadening your search or removing filters
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════ METHODOLOGY REFERENCE ═══════════════ */}
      <div className="mx-4 mb-6 border border-amber/15 bg-surface-card">
        <div className="px-4 py-3 border-b border-amber/10 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber/60" />
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
      </div>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <div className="border-t border-amber/10 bg-surface-card/50 px-4 py-3 flex items-center justify-between">
        <span className="text-[8px] font-mono text-gray-700 tracking-wider">
          OSINT BIBLE 2026 · {TOTAL_TOOLS} TOOLS · {OSINT_CATEGORIES.length} CATEGORIES · WORLDVIEW INTEGRATED
        </span>
        <a
          href="https://github.com/frangelbarrera/OSINT-BIBLE"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] font-mono text-amber/40 hover:text-amber tracking-wider flex items-center gap-1"
        >
          <Globe className="h-3 w-3" />
          VIEW ON GITHUB
        </a>
      </div>

      {/* ═══════════════ SCROLL TO TOP ═══════════════ */}
      {showScrollTop && (
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-2.5 bg-amber/20 border border-amber/40 text-amber hover:bg-amber/30 transition-all backdrop-blur-sm shadow-amber-glow"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
