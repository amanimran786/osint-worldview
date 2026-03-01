import { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { SignalTimeline, SeverityPieChart, SourceBarChart } from '../components/AnalyticsCharts';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';
import * as api from '../api';
import type { Analytics } from '../types';

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.fetchAnalytics(days).then((data) => {
      setAnalytics(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [days]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="ANALYTICS" />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Time range selector */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-mono text-gray-600 mr-2 tracking-wider uppercase">Range:</span>
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border transition-all ${
                days === d
                  ? 'border-amber/40 bg-amber/10 text-amber'
                  : 'border-transparent text-gray-600 hover:text-amber/60 hover:border-amber/15'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber border-t-transparent" />
            <span className="text-[10px] font-mono text-amber/40 tracking-wider">COMPUTING...</span>
          </div>
        )}

        {analytics && !loading && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="hud-border bg-surface-card p-3">
                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">Total Signals</span>
                <div className="text-xl font-display font-bold text-amber mt-1 tabular-nums">{analytics.total_signals}</div>
              </div>
              <div className="hud-border bg-surface-card p-3">
                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">Untriaged</span>
                <div className="text-xl font-display font-bold text-yellow-400 mt-1 tabular-nums">{analytics.new_signals}</div>
              </div>
              <div className="hud-border bg-surface-card p-3">
                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">Critical</span>
                <div className="text-xl font-display font-bold text-red-400 mt-1 tabular-nums">{analytics.critical_signals}</div>
              </div>
              <div className="hud-border bg-surface-card p-3">
                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">Open Cases</span>
                <div className="text-xl font-display font-bold text-tactical-green mt-1 tabular-nums">{analytics.open_cases}</div>
              </div>
            </div>

            {/* Timeline chart */}
            <SignalTimeline data={analytics.signals_over_time} />

            {/* Side-by-side charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SeverityPieChart data={analytics.severity_distribution} />
              <SourceBarChart data={analytics.top_sources} />
            </div>

            {/* AI Analysis */}
            <AIAnalysisPanel />
          </>
        )}
      </div>
    </div>
  );
}
