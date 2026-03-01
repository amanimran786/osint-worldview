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
      <TopBar title="Analytics" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Time range selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Time range:</span>
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                days === d
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-surface-hover'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        )}

        {analytics && !loading && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
                <span className="text-xs text-gray-500">Total Signals</span>
                <div className="text-2xl font-bold text-white mt-1">{analytics.total_signals}</div>
              </div>
              <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
                <span className="text-xs text-gray-500">New / Untriaged</span>
                <div className="text-2xl font-bold text-yellow-400 mt-1">{analytics.new_signals}</div>
              </div>
              <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
                <span className="text-xs text-gray-500">Critical</span>
                <div className="text-2xl font-bold text-red-400 mt-1">{analytics.critical_signals}</div>
              </div>
              <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
                <span className="text-xs text-gray-500">Open Cases</span>
                <div className="text-2xl font-bold text-green-400 mt-1">{analytics.open_cases}</div>
              </div>
            </div>

            {/* Timeline chart */}
            <SignalTimeline data={analytics.signals_over_time} />

            {/* Side-by-side charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
