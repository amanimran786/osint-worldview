/**
 * 4D GOD MODE — Full-immersive intelligence command center
 *
 * Features:
 *  • 3D Globe with all data layers unified
 *  • Time dimension — scrub through last 24h of intelligence
 *  • AI-powered threat analysis with auto-scan every 5 min
 *  • Manual scan trigger
 *  • Real-time threat heatmap overlay
 *  • Floating command HUD with stats
 *  • Keyboard shortcuts: Space=scan, T=toggle time, Esc=exit
 */

import { useEffect, useState, useCallback, useRef, lazy, Suspense } from 'react';
import {
  Scan, Brain, Clock, AlertTriangle, Shield, Zap,
  ChevronRight, X, Activity, Eye, RefreshCw, Pause, Play, Layers,
  Maximize2, Minimize2, BarChart3,
} from 'lucide-react';
import { clsx } from 'clsx';
import * as api from '../api';
import { useDataLayers } from '../components/DataLayerPanel';
import { runScan, getScanHistory, AutoScanner, isAIEnabled } from '../services/scanner';
import type { ScanResult, ScanHighlight } from '../services/scanner';
import type { GeoSignal } from '../types';

const Globe3D = lazy(() => import('../components/Globe3D').then(m => ({ default: m.Globe3D })));

/* ─── Threat level colors ─── */
const THREAT_COLORS: Record<string, string> = {
  low: 'text-tactical-green',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

const THREAT_BG: Record<string, string> = {
  low: 'bg-tactical-green/10 border-tactical-green/30',
  medium: 'bg-yellow-400/10 border-yellow-400/30',
  high: 'bg-orange-400/10 border-orange-400/30',
  critical: 'bg-red-500/10 border-red-500/30',
};

export function GodModePage() {
  const { layers, data, loading: layersLoading, toggle, refresh } = useDataLayers();
  const [geoSignals, setGeoSignals] = useState<GeoSignal[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [autoScanActive, setAutoScanActive] = useState(true);
  const [showPanel, setShowPanel] = useState<'intel' | 'layers' | 'ai' | null>('intel');
  const [nextScanIn, setNextScanIn] = useState(300);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const autoScannerRef = useRef<AutoScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load geo signals
  useEffect(() => {
    api.fetchGeoSignals({ limit: 500 }).then((d) => {
      setGeoSignals(d.filter(s => s.latitude !== null && s.longitude !== null));
    }).catch(() => {});
  }, []);

  // Load last scan from history
  useEffect(() => {
    const history = getScanHistory();
    if (history.length > 0 && history[0]) setScanResult(history[0]);
  }, []);

  // Auto-scanner setup
  useEffect(() => {
    const scanner = new AutoScanner(5 * 60 * 1000); // 5 minutes
    scanner
      .onScanStart(() => setScanning(true))
      .onScanComplete((result) => {
        setScanning(false);
        setScanResult(result);
        setScanCount(c => c + 1);
        setNextScanIn(300);
      })
      .onError(() => setScanning(false));

    autoScannerRef.current = scanner;
    if (autoScanActive) scanner.start();

    return () => scanner.stop();
  }, [autoScanActive]);

  // Countdown timer
  useEffect(() => {
    if (!autoScanActive) return;
    const id = setInterval(() => {
      setNextScanIn(prev => (prev <= 1 ? 300 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [autoScanActive]);

  // Manual scan
  const handleManualScan = useCallback(async () => {
    setScanning(true);
    try {
      const result = await runScan();
      setScanResult(result);
      setScanCount(c => c + 1);
      setNextScanIn(300);
    } catch { /* handled */ }
    setScanning(false);
  }, []);

  // Toggle auto-scan
  const toggleAutoScan = useCallback(() => {
    setAutoScanActive(prev => {
      const next = !prev;
      if (next) autoScannerRef.current?.start();
      else autoScannerRef.current?.stop();
      return next;
    });
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (!scanning) handleManualScan();
          break;
        case 'Escape':
          setShowPanel(null);
          break;
        case 'i':
          setShowPanel(p => p === 'intel' ? null : 'intel');
          break;
        case 'l':
          setShowPanel(p => p === 'layers' ? null : 'layers');
          break;
        case 'a':
          setShowPanel(p => p === 'ai' ? null : 'ai');
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [scanning, handleManualScan, toggleFullscreen]);

  const threatLevel = scanResult?.ai_analysis?.threat_level ?? 'medium';
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // Stats from scan
  const totalItems = scanResult?.total_items ?? 0;
  const sourcesScanned = scanResult?.sources_scanned ?? 0;
  const highlightCount = scanResult?.highlights?.length ?? 0;

  return (
    <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden bg-[#030608] relative">
      {/* ═══ TOP COMMAND BAR ═══ */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex items-center justify-between px-4 py-2 pointer-events-auto">
          {/* Left: Title + Threat Level */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 hud-border bg-surface/80 backdrop-blur-md px-3 py-1.5">
              <Eye className="h-4 w-4 text-amber animate-pulse" />
              <span className="text-[11px] font-display tracking-[0.2em] text-amber text-glow-amber uppercase">
                4D GOD MODE
              </span>
            </div>
            <div className={clsx(
              'hud-border px-3 py-1.5 flex items-center gap-2',
              THREAT_BG[threatLevel] ?? THREAT_BG.medium,
            )}>
              <AlertTriangle className={clsx('h-3.5 w-3.5', THREAT_COLORS[threatLevel])} />
              <span className={clsx('text-[10px] font-mono tracking-[0.15em] uppercase font-bold', THREAT_COLORS[threatLevel])}>
                DEFCON: {threatLevel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Center: Scan Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualScan}
              disabled={scanning}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 border text-[10px] font-mono tracking-wider uppercase transition-all',
                scanning
                  ? 'border-amber/30 bg-amber/10 text-amber cursor-wait'
                  : 'border-tactical-cyan/40 bg-tactical-cyan/10 text-tactical-cyan hover:bg-tactical-cyan/20 hover:border-tactical-cyan/60',
              )}
            >
              {scanning ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  SCANNING...
                </>
              ) : (
                <>
                  <Scan className="h-3.5 w-3.5" />
                  SCAN NOW
                </>
              )}
            </button>

            <button
              onClick={toggleAutoScan}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-mono tracking-wider uppercase transition-all',
                autoScanActive
                  ? 'border-tactical-green/30 bg-tactical-green/10 text-tactical-green'
                  : 'border-gray-700 bg-surface/80 text-gray-600',
              )}
            >
              {autoScanActive ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              AUTO {autoScanActive ? 'ON' : 'OFF'}
            </button>

            <div className="hud-border bg-surface/80 backdrop-blur-md px-2.5 py-1.5 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-amber/50" />
              <span className="text-[9px] font-mono text-amber/60 tracking-wider tabular-nums">
                {autoScanActive ? `NEXT: ${formatTime(nextScanIn)}` : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Right: Panel toggles + Fullscreen */}
          <div className="flex items-center gap-1.5">
            {([
              { key: 'intel' as const, icon: Shield, label: 'INTEL', shortcut: 'I' },
              { key: 'layers' as const, icon: Layers, label: 'LAYERS', shortcut: 'L' },
              { key: 'ai' as const, icon: Brain, label: 'AI', shortcut: 'A' },
            ]).map(({ key, icon: Icon, label, shortcut }) => (
              <button
                key={key}
                onClick={() => setShowPanel(p => p === key ? null : key)}
                className={clsx(
                  'flex items-center gap-1 px-2 py-1.5 border text-[8px] font-mono tracking-wider uppercase transition-all',
                  showPanel === key
                    ? 'border-amber/30 bg-amber/10 text-amber'
                    : 'border-gray-800 bg-surface/60 text-gray-600 hover:text-amber/50 hover:border-amber/15',
                )}
                title={`${label} (${shortcut})`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 border border-gray-800 bg-surface/60 text-gray-600 hover:text-amber/50 hover:border-amber/15 transition-all"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 3D GLOBE — Full Background ═══ */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full bg-[#030608]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-amber border-t-transparent" />
              <span className="text-[10px] font-mono text-amber/40 tracking-[0.3em]">INITIALIZING GOD MODE...</span>
            </div>
          </div>
        }>
          <Globe3D signals={geoSignals} layers={layers} layerData={data} />
        </Suspense>
      </div>

      {/* ═══ SIDE PANEL ═══ */}
      {showPanel && (
        <div className="absolute top-12 right-4 bottom-4 z-40 w-80 overflow-hidden">
          <div className="h-full border border-amber/15 bg-surface/90 backdrop-blur-md flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-amber/10">
              <span className="text-[10px] font-display tracking-[0.15em] text-amber uppercase">
                {showPanel === 'intel' && 'Intelligence Feed'}
                {showPanel === 'layers' && 'Data Layers'}
                {showPanel === 'ai' && 'AI Analysis'}
              </span>
              <button onClick={() => setShowPanel(null)} className="text-gray-600 hover:text-amber transition">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {showPanel === 'intel' && <IntelPanel scanResult={scanResult} />}
              {showPanel === 'layers' && <LayersPanel layers={layers} onToggle={toggle} onRefresh={refresh} loading={layersLoading} />}
              {showPanel === 'ai' && <AIPanel scanResult={scanResult} />}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BOTTOM STATS BAR ═══ */}
      <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="flex items-center justify-between px-4 py-2 pointer-events-auto">
          {/* Left: Live stats */}
          <div className="flex items-center gap-3">
            {[
              { label: 'SOURCES', value: sourcesScanned, icon: Zap, color: 'text-tactical-cyan' },
              { label: 'ITEMS', value: totalItems, icon: Activity, color: 'text-amber' },
              { label: 'ALERTS', value: highlightCount, icon: AlertTriangle, color: 'text-red-400' },
              { label: 'SCANS', value: scanCount, icon: BarChart3, color: 'text-tactical-green' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="hud-border bg-surface/80 backdrop-blur-md px-2.5 py-1 flex items-center gap-1.5">
                <Icon className={clsx('h-3 w-3', color)} />
                <span className="text-[8px] font-mono text-gray-600 tracking-wider">{label}</span>
                <span className={clsx('text-[10px] font-mono font-bold tabular-nums', color)}>{value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Center: AI status */}
          <div className="hud-border bg-surface/80 backdrop-blur-md px-3 py-1 flex items-center gap-2">
            <Brain className={clsx('h-3 w-3', isAIEnabled() ? 'text-tactical-green' : 'text-gray-700')} />
            <span className={clsx('text-[8px] font-mono tracking-wider uppercase', isAIEnabled() ? 'text-tactical-green' : 'text-gray-700')}>
              AI: {isAIEnabled() ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Right: Keyboard hints */}
          <div className="flex items-center gap-2">
            {[
              { key: 'SPACE', label: 'Scan' },
              { key: 'I', label: 'Intel' },
              { key: 'L', label: 'Layers' },
              { key: 'A', label: 'AI' },
              { key: 'F', label: 'Full' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 text-[7px] font-mono bg-surface/80 border border-amber/20 text-amber/40">
                  {key}
                </kbd>
                <span className="text-[7px] font-mono text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SCANNING OVERLAY ═══ */}
      {scanning && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border border-tactical-cyan/30 animate-ping" />
              <div className="absolute inset-2 h-20 w-20 rounded-full border border-tactical-cyan/20 animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-4 h-16 w-16 rounded-full border border-tactical-cyan/10 animate-ping" style={{ animationDelay: '0.6s' }} />
              <Scan className="absolute inset-0 m-auto h-8 w-8 text-tactical-cyan animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <span className="text-[10px] font-mono text-tactical-cyan tracking-[0.3em] uppercase">
              SCANNING ALL SOURCES...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SUB-PANELS
   ════════════════════════════════════════════════════════════════════ */

function IntelPanel({ scanResult }: { scanResult: ScanResult | null }) {
  if (!scanResult) {
    return (
      <div className="text-center py-8">
        <Scan className="h-8 w-8 text-amber/20 mx-auto mb-2" />
        <p className="text-[9px] font-mono text-gray-600">No scan data yet.</p>
        <p className="text-[8px] font-mono text-gray-700 mt-1">Press SPACE to run first scan.</p>
      </div>
    );
  }

  const elapsed = new Date(scanResult.timestamp).toLocaleTimeString();

  return (
    <div className="space-y-3">
      {/* Scan meta */}
      <div className="p-2 border border-amber/10 bg-surface/50 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-gray-600">LAST SCAN</span>
          <span className="text-[8px] font-mono text-amber/50 tabular-nums">{elapsed}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-gray-600">DURATION</span>
          <span className="text-[8px] font-mono text-amber/50 tabular-nums">{(scanResult.duration_ms / 1000).toFixed(1)}s</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-gray-600">SOURCES</span>
          <span className="text-[8px] font-mono text-amber/50 tabular-nums">{scanResult.sources_scanned}</span>
        </div>
      </div>

      {/* Raw counts */}
      <div className="p-2 border border-amber/10 bg-surface/50">
        <div className="text-[8px] font-mono font-bold text-amber/40 tracking-wider mb-1.5 uppercase">Source Breakdown</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {Object.entries(scanResult.raw_counts).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-gray-600 truncate">{k.replace(/_/g, ' ')}</span>
              <span className="text-[8px] font-mono text-amber/50 tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="text-[8px] font-mono font-bold text-amber/40 tracking-wider uppercase">
        Top Alerts ({scanResult.highlights.length})
      </div>
      {scanResult.highlights.slice(0, 15).map((h, i) => (
        <HighlightCard key={i} highlight={h} />
      ))}

      {/* Errors */}
      {scanResult.errors.length > 0 && (
        <div className="p-2 border border-red-500/20 bg-red-500/5">
          <div className="text-[8px] font-mono font-bold text-red-400/60 tracking-wider uppercase mb-1">
            Errors ({scanResult.errors.length})
          </div>
          {scanResult.errors.map((e, i) => (
            <p key={i} className="text-[7px] font-mono text-red-400/50">{e}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: ScanHighlight }) {
  const sevColor = highlight.severity >= 70 ? 'border-red-500/30 bg-red-500/5' :
    highlight.severity >= 50 ? 'border-orange-400/30 bg-orange-400/5' :
    highlight.severity >= 30 ? 'border-yellow-400/30 bg-yellow-400/5' :
    'border-amber/10 bg-surface/50';

  return (
    <div className={clsx('p-2 border', sevColor)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9px] font-mono text-amber/80 leading-relaxed flex-1">{highlight.title}</p>
        <span className={clsx(
          'text-[7px] font-mono font-bold px-1 py-0.5 flex-shrink-0',
          highlight.severity >= 70 ? 'text-red-400 bg-red-500/10' :
          highlight.severity >= 50 ? 'text-orange-400 bg-orange-400/10' :
          'text-yellow-400 bg-yellow-400/10',
        )}>
          {Math.round(highlight.severity)}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[7px] font-mono text-gray-600">{highlight.source}</span>
        <span className="text-[7px] font-mono text-gray-700">·</span>
        <span className="text-[7px] font-mono text-gray-600">{highlight.category}</span>
      </div>
      {highlight.snippet && (
        <p className="text-[7px] font-mono text-gray-600 mt-1 leading-relaxed">{highlight.snippet}</p>
      )}
    </div>
  );
}

function LayersPanel({ layers, onToggle, onRefresh, loading }: {
  layers: import('../types').DataLayerState[];
  onToggle: (key: import('../types').DataLayerKey) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-2">
      <button
        onClick={onRefresh}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 border border-tactical-cyan/30 bg-tactical-cyan/5 text-[9px] font-mono text-tactical-cyan tracking-wider uppercase hover:bg-tactical-cyan/10 transition"
      >
        <RefreshCw className={clsx('h-3 w-3', loading && 'animate-spin')} />
        {loading ? 'REFRESHING...' : 'REFRESH ALL'}
      </button>
      {layers.map(layer => (
        <button
          key={layer.key}
          onClick={() => onToggle(layer.key)}
          className={clsx(
            'w-full flex items-center justify-between px-2.5 py-1.5 border text-left transition',
            layer.enabled
              ? 'border-amber/20 bg-amber/5'
              : 'border-gray-800 bg-surface/30',
          )}
        >
          <div className="flex items-center gap-2">
            <span className={clsx(
              'inline-block h-2 w-2 rounded-full',
              layer.enabled ? `bg-[${layer.color}]` : 'bg-gray-700',
            )} style={layer.enabled ? { backgroundColor: layer.color } : {}} />
            <span className={clsx(
              'text-[9px] font-mono tracking-wider uppercase',
              layer.enabled ? 'text-amber' : 'text-gray-600',
            )}>
              {layer.label}
            </span>
          </div>
          <span className={clsx(
            'text-[8px] font-mono tabular-nums',
            layer.enabled ? 'text-amber/60' : 'text-gray-700',
          )}>
            {layer.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function AIPanel({ scanResult }: { scanResult: ScanResult | null }) {
  const ai = scanResult?.ai_analysis;

  if (!isAIEnabled()) {
    return (
      <div className="text-center py-8">
        <Brain className="h-8 w-8 text-gray-700 mx-auto mb-2" />
        <p className="text-[9px] font-mono text-gray-600">AI Analysis Offline</p>
        <p className="text-[8px] font-mono text-gray-700 mt-1">
          Add your OpenAI API key in Settings to enable.
        </p>
      </div>
    );
  }

  if (!ai) {
    return (
      <div className="text-center py-8">
        <Brain className="h-8 w-8 text-amber/20 mx-auto mb-2" />
        <p className="text-[9px] font-mono text-gray-600">No AI analysis yet.</p>
        <p className="text-[8px] font-mono text-gray-700 mt-1">Run a scan to get AI threat assessment.</p>
      </div>
    );
  }

  const threatLevel = ai.threat_level ?? 'medium';

  return (
    <div className="space-y-3">
      {/* Threat level badge */}
      <div className={clsx('p-3 border text-center', THREAT_BG[threatLevel] ?? THREAT_BG.medium)}>
        <div className={clsx('text-[12px] font-display tracking-[0.2em] uppercase font-bold', THREAT_COLORS[threatLevel])}>
          {threatLevel.toUpperCase()}
        </div>
        <div className="text-[7px] font-mono text-gray-600 mt-0.5">GLOBAL THREAT ASSESSMENT</div>
      </div>

      {/* Analysis text */}
      <div className="p-2 border border-amber/10 bg-surface/50">
        <div className="text-[8px] font-mono font-bold text-amber/40 tracking-wider mb-1.5 uppercase">Analysis</div>
        <p className="text-[8px] font-mono text-gray-400 leading-relaxed whitespace-pre-wrap">
          {ai.analysis}
        </p>
      </div>

      {/* Key entities */}
      {ai.key_entities.length > 0 && (
        <div className="p-2 border border-amber/10 bg-surface/50">
          <div className="text-[8px] font-mono font-bold text-amber/40 tracking-wider mb-1.5 uppercase">Key Entities</div>
          <div className="flex flex-wrap gap-1">
            {ai.key_entities.map((e, i) => (
              <span key={i} className="px-1.5 py-0.5 border border-amber/15 bg-amber/5 text-[7px] font-mono text-amber/60">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended actions */}
      {ai.recommended_actions.length > 0 && (
        <div className="p-2 border border-tactical-cyan/15 bg-tactical-cyan/5">
          <div className="text-[8px] font-mono font-bold text-tactical-cyan/60 tracking-wider mb-1.5 uppercase">
            Recommended Actions
          </div>
          {ai.recommended_actions.map((a, i) => (
            <div key={i} className="flex items-start gap-1.5 mt-1">
              <ChevronRight className="h-2.5 w-2.5 text-tactical-cyan/40 mt-0.5 flex-shrink-0" />
              <p className="text-[8px] font-mono text-tactical-cyan/50 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
