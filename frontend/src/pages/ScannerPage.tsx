/**
 * Scanner Page — Full OSINT scan control & history
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Scan, Brain, AlertTriangle, RefreshCw, Play, Pause,
  ChevronRight, Activity, BarChart3, Zap, History as HistoryIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { runScan, getScanHistory, AutoScanner, isAIEnabled } from '../services/scanner';
import type { ScanResult } from '../services/scanner';

export function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [autoScanActive, setAutoScanActive] = useState(false);
  const [nextScanIn, setNextScanIn] = useState(300);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const autoScannerRef = useRef<AutoScanner | null>(null);

  // Load history on mount
  useEffect(() => {
    const h = getScanHistory();
    setHistory(h);
    if (h.length > 0 && h[0]) setScanResult(h[0]);
  }, []);

  // Auto-scanner setup
  useEffect(() => {
    const scanner = new AutoScanner(5 * 60 * 1000);
    scanner
      .onScanStart(() => setScanning(true))
      .onScanComplete((result) => {
        setScanning(false);
        setScanResult(result);
        setHistory(getScanHistory());
        setNextScanIn(300);
      })
      .onError(() => setScanning(false));

    autoScannerRef.current = scanner;
    if (autoScanActive) scanner.start();

    return () => scanner.stop();
  }, [autoScanActive]);

  // Countdown
  useEffect(() => {
    if (!autoScanActive) return;
    const id = setInterval(() => {
      setNextScanIn(prev => (prev <= 1 ? 300 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [autoScanActive]);

  const handleManualScan = useCallback(async () => {
    setScanning(true);
    try {
      const result = await runScan();
      setScanResult(result);
      setHistory(getScanHistory());
      setNextScanIn(300);
    } catch { /* handled */ }
    setScanning(false);
  }, []);

  const toggleAutoScan = useCallback(() => {
    setAutoScanActive(prev => {
      const next = !prev;
      if (next) autoScannerRef.current?.start();
      else autoScannerRef.current?.stop();
      return next;
    });
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const threatLevel = scanResult?.ai_analysis?.threat_level ?? 'unknown';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-amber/10">
        <div>
          <h1 className="text-sm font-display tracking-[0.2em] text-amber text-glow-amber uppercase">
            OSINT Scanner
          </h1>
          <p className="text-[9px] font-mono text-amber/30 mt-0.5 tracking-wider">
            AUTOMATED INTELLIGENCE COLLECTION & ANALYSIS
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-scan toggle */}
          <button
            onClick={toggleAutoScan}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 border text-[10px] font-mono tracking-wider uppercase transition-all',
              autoScanActive
                ? 'border-tactical-green/30 bg-tactical-green/10 text-tactical-green'
                : 'border-gray-700 bg-surface text-gray-500',
            )}
          >
            {autoScanActive ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            AUTO-SCAN {autoScanActive ? 'ON' : 'OFF'}
            {autoScanActive && (
              <span className="ml-2 text-[9px] tabular-nums opacity-60">({formatTime(nextScanIn)})</span>
            )}
          </button>

          {/* Manual scan */}
          <button
            onClick={handleManualScan}
            disabled={scanning}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 border text-[10px] font-mono tracking-wider uppercase transition-all',
              scanning
                ? 'border-amber/30 bg-amber/10 text-amber cursor-wait'
                : 'border-tactical-cyan/40 bg-tactical-cyan/10 text-tactical-cyan hover:bg-tactical-cyan/20',
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
                RUN SCAN
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Cards Row */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'SOURCES', value: scanResult?.sources_scanned ?? 0, icon: Zap, color: 'tactical-cyan' },
            { label: 'ITEMS', value: scanResult?.total_items ?? 0, icon: Activity, color: 'amber' },
            { label: 'ALERTS', value: scanResult?.highlights?.length ?? 0, icon: AlertTriangle, color: 'red-400' },
            { label: 'SCANS', value: history.length, icon: BarChart3, color: 'tactical-green' },
            { label: 'AI STATUS', value: isAIEnabled() ? 'ACTIVE' : 'OFFLINE', icon: Brain, color: isAIEnabled() ? 'tactical-green' : 'gray-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="border border-amber/10 bg-surface/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 text-${color}`} />
                <span className="text-[8px] font-mono text-gray-600 tracking-wider">{label}</span>
              </div>
              <div className={`text-lg font-mono font-bold text-${color} tabular-nums`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid: Left = Results, Right = AI + History */}
        <div className="grid grid-cols-3 gap-4">
          {/* Left 2 cols: Highlights */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber" />
              <span className="text-[10px] font-display tracking-[0.15em] text-amber uppercase">
                Intelligence Highlights
              </span>
            </div>

            {!scanResult ? (
              <div className="border border-amber/10 bg-surface/30 p-8 text-center">
                <Scan className="h-10 w-10 text-amber/15 mx-auto mb-3" />
                <p className="text-[10px] font-mono text-gray-600">No scan data yet</p>
                <p className="text-[9px] font-mono text-gray-700 mt-1">Click "RUN SCAN" to collect intelligence</p>
              </div>
            ) : (
              <>
                {/* Raw Counts */}
                <div className="border border-amber/10 bg-surface/30 p-3">
                  <div className="text-[8px] font-mono text-amber/40 tracking-wider mb-2 uppercase font-bold">Source Breakdown</div>
                  <div className="grid grid-cols-4 gap-x-4 gap-y-1">
                    {Object.entries(scanResult.raw_counts).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-gray-600 truncate">{k.replace(/_/g, ' ')}</span>
                        <span className="text-[9px] font-mono text-amber/50 tabular-nums font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights list */}
                <div className="space-y-2">
                  {scanResult.highlights.length === 0 ? (
                    <div className="border border-amber/10 bg-surface/30 p-4 text-center">
                      <p className="text-[9px] font-mono text-gray-600">No high-priority alerts detected</p>
                    </div>
                  ) : (
                    scanResult.highlights.map((h, i) => {
                      const sevColor = h.severity >= 70 ? 'border-red-500/30 bg-red-500/5' :
                        h.severity >= 50 ? 'border-orange-400/30 bg-orange-400/5' :
                        h.severity >= 30 ? 'border-yellow-400/30 bg-yellow-400/5' :
                        'border-amber/10 bg-surface/50';

                      return (
                        <div key={i} className={clsx('border p-3', sevColor)}>
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] font-mono text-amber/80 leading-relaxed flex-1">{h.title}</p>
                            <span className={clsx(
                              'text-[8px] font-mono font-bold px-1.5 py-0.5 flex-shrink-0',
                              h.severity >= 70 ? 'text-red-400 bg-red-500/10 border border-red-500/20' :
                              h.severity >= 50 ? 'text-orange-400 bg-orange-400/10 border border-orange-400/20' :
                              'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
                            )}>
                              SEV {Math.round(h.severity)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[8px] font-mono text-gray-600 border border-amber/10 px-1.5 py-0.5">{h.source}</span>
                            <span className="text-[8px] font-mono text-gray-600">{h.category}</span>
                          </div>
                          {h.snippet && (
                            <p className="text-[8px] font-mono text-gray-600 mt-1.5 leading-relaxed">{h.snippet}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right col: AI Analysis + History */}
          <div className="space-y-4">
            {/* AI Analysis */}
            <div className="border border-amber/10 bg-surface/30 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-tactical-cyan" />
                <span className="text-[10px] font-display tracking-[0.15em] text-tactical-cyan uppercase">
                  AI Analysis
                </span>
              </div>

              {!isAIEnabled() ? (
                <div className="text-center py-4">
                  <Brain className="h-6 w-6 text-gray-700 mx-auto mb-2" />
                  <p className="text-[8px] font-mono text-gray-600">AI offline — add OpenAI key in Settings</p>
                </div>
              ) : !scanResult?.ai_analysis ? (
                <div className="text-center py-4">
                  <p className="text-[8px] font-mono text-gray-600">Run a scan to get AI analysis</p>
                </div>
              ) : (
                <>
                  <div className={clsx(
                    'p-2 border text-center',
                    threatLevel === 'critical' ? 'border-red-500/30 bg-red-500/10' :
                    threatLevel === 'high' ? 'border-orange-400/30 bg-orange-400/10' :
                    threatLevel === 'medium' ? 'border-yellow-400/30 bg-yellow-400/10' :
                    'border-tactical-green/30 bg-tactical-green/10',
                  )}>
                    <span className={clsx(
                      'text-[10px] font-display tracking-[0.15em] uppercase font-bold',
                      threatLevel === 'critical' ? 'text-red-400' :
                      threatLevel === 'high' ? 'text-orange-400' :
                      threatLevel === 'medium' ? 'text-yellow-400' :
                      'text-tactical-green',
                    )}>
                      THREAT: {threatLevel.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[8px] font-mono text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {scanResult.ai_analysis.analysis}
                  </p>

                  {scanResult.ai_analysis.key_entities.length > 0 && (
                    <div>
                      <div className="text-[7px] font-mono text-amber/40 tracking-wider uppercase mb-1 font-bold">Entities</div>
                      <div className="flex flex-wrap gap-1">
                        {scanResult.ai_analysis.key_entities.map((e, i) => (
                          <span key={i} className="px-1.5 py-0.5 border border-amber/15 bg-amber/5 text-[7px] font-mono text-amber/60">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {scanResult.ai_analysis.recommended_actions.length > 0 && (
                    <div>
                      <div className="text-[7px] font-mono text-tactical-cyan/50 tracking-wider uppercase mb-1 font-bold">Actions</div>
                      {scanResult.ai_analysis.recommended_actions.map((a, i) => (
                        <div key={i} className="flex items-start gap-1.5 mt-0.5">
                          <ChevronRight className="h-2.5 w-2.5 text-tactical-cyan/40 mt-0.5 flex-shrink-0" />
                          <p className="text-[7px] font-mono text-tactical-cyan/40 leading-relaxed">{a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Scan History */}
            <div className="border border-amber/10 bg-surface/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <HistoryIcon className="h-3.5 w-3.5 text-amber" />
                <span className="text-[10px] font-display tracking-[0.15em] text-amber uppercase">
                  Scan History
                </span>
              </div>
              {history.length === 0 ? (
                <p className="text-[8px] font-mono text-gray-600 text-center py-3">No scans yet</p>
              ) : (
                <div className="space-y-1">
                  {history.slice(0, 10).map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setScanResult(h)}
                      className={clsx(
                        'w-full flex items-center justify-between px-2 py-1.5 border text-left transition',
                        scanResult?.id === h.id
                          ? 'border-amber/20 bg-amber/5'
                          : 'border-transparent hover:border-amber/10 hover:bg-surface/50',
                      )}
                    >
                      <div>
                        <div className="text-[8px] font-mono text-amber/60 tabular-nums">
                          {new Date(h.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-[7px] font-mono text-gray-600">
                          {h.sources_scanned} src · {h.total_items} items
                        </div>
                      </div>
                      <span className={clsx(
                        'text-[7px] font-mono font-bold px-1 py-0.5',
                        (h.ai_analysis?.threat_level ?? 'unknown') === 'critical' ? 'text-red-400 bg-red-500/10' :
                        (h.ai_analysis?.threat_level ?? 'unknown') === 'high' ? 'text-orange-400 bg-orange-400/10' :
                        (h.ai_analysis?.threat_level ?? 'unknown') === 'medium' ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-tactical-green bg-tactical-green/10',
                      )}>
                        {(h.ai_analysis?.threat_level ?? '—').toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Errors */}
            {scanResult && scanResult.errors.length > 0 && (
              <div className="border border-red-500/20 bg-red-500/5 p-3">
                <div className="text-[8px] font-mono font-bold text-red-400/60 tracking-wider uppercase mb-1">
                  Errors ({scanResult.errors.length})
                </div>
                {scanResult.errors.map((e, i) => (
                  <p key={i} className="text-[7px] font-mono text-red-400/50 mt-0.5">{e}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
