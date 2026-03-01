import { useState } from 'react';
import { Brain, Loader2, AlertTriangle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import type { AIAnalysis } from '../types';
import * as api from '../api';

const THREAT_COLORS: Record<string, string> = {
  low: 'bg-green-500/15 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/15 text-red-400 border-red-500/30',
  critical: 'bg-red-600/15 text-red-300 border-red-600/30',
};

export function AIAnalysisPanel() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.analyzeSignals(20);
      setAnalysis(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hud-border bg-surface-card">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-amber/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <h3 className="text-[10px] font-display tracking-[0.15em] text-amber/60 uppercase">AI Threat Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          {!analysis && !loading && (
            <button
              onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
              className="border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[9px] font-mono text-purple-400 hover:bg-purple-500/20 uppercase tracking-wider"
            >
              Analyze
            </button>
          )}
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-600" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-600" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-amber/40" />
              <span className="text-[10px] font-mono text-amber/40 tracking-wider">ANALYZING SIGNALS...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-[11px] font-mono">
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}

          {analysis && !loading && (
            <>
              {/* Threat level badge */}
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-amber/40" />
                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">Threat Level:</span>
                <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${THREAT_COLORS[analysis.threat_level] ?? THREAT_COLORS.medium}`}>
                  {analysis.threat_level}
                </span>
              </div>

              {/* Analysis text */}
              <p className="text-[11px] font-mono text-gray-400 leading-relaxed">{analysis.analysis}</p>

              {/* Key entities */}
              {analysis.key_entities.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono text-gray-600 block mb-1 uppercase tracking-wider">Key Entities</span>
                  <div className="flex flex-wrap gap-1">
                    {analysis.key_entities.map((entity, i) => (
                      <span key={i} className="border border-gray-800 px-1.5 py-0.5 text-[10px] font-mono text-gray-400">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended actions */}
              {analysis.recommended_actions.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono text-gray-600 block mb-1 uppercase tracking-wider">Recommended Actions</span>
                  <ul className="space-y-1">
                    {analysis.recommended_actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-[10px] font-mono text-gray-500">
                        <span className="text-amber mt-0.5">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-analyze button */}
              <button
                onClick={runAnalysis}
                className="border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[9px] font-mono text-purple-400 hover:bg-purple-500/20 uppercase tracking-wider"
              >
                Re-analyze
              </button>
            </>
          )}

          {!analysis && !loading && !error && (
            <p className="text-[10px] font-mono text-gray-600 text-center py-2 tracking-wider">
              CLICK "ANALYZE" FOR AI THREAT INTELLIGENCE
            </p>
          )}
        </div>
      )}
    </div>
  );
}
