import { useState } from 'react';
import { Brain, Loader2, AlertTriangle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import type { AIAnalysis } from '../types';
import * as api from '../api';

const THREAT_COLORS: Record<string, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  high: 'bg-red-500/20 text-red-400 border-red-500/40',
  critical: 'bg-red-600/20 text-red-300 border-red-600/40',
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
    <div className="rounded-xl border border-gray-700/50 bg-surface-card">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-hover rounded-t-xl"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-300">AI Threat Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          {!analysis && !loading && (
            <button
              onClick={(e) => { e.stopPropagation(); runAnalysis(); }}
              className="rounded-lg bg-purple-600/20 px-3 py-1 text-xs text-purple-400 hover:bg-purple-600/30"
            >
              Analyze
            </button>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 py-4 justify-center text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing signals…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {analysis && !loading && (
            <>
              {/* Threat level badge */}
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-xs text-gray-500">Threat Level:</span>
                <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${THREAT_COLORS[analysis.threat_level] ?? THREAT_COLORS.medium}`}>
                  {analysis.threat_level.toUpperCase()}
                </span>
              </div>

              {/* Analysis text */}
              <p className="text-sm text-gray-300 leading-relaxed">{analysis.analysis}</p>

              {/* Key entities */}
              {analysis.key_entities.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Key Entities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.key_entities.map((entity, i) => (
                      <span key={i} className="rounded-full bg-gray-700/50 px-2 py-0.5 text-xs text-gray-300">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended actions */}
              {analysis.recommended_actions.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Recommended Actions</span>
                  <ul className="space-y-1">
                    {analysis.recommended_actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="text-brand-500 mt-0.5">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Re-analyze button */}
              <button
                onClick={runAnalysis}
                className="rounded-lg bg-purple-600/20 px-3 py-1.5 text-xs text-purple-400 hover:bg-purple-600/30"
              >
                Re-analyze
              </button>
            </>
          )}

          {!analysis && !loading && !error && (
            <p className="text-xs text-gray-500 text-center py-2">
              Click "Analyze" to get AI-powered threat intelligence insights.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
