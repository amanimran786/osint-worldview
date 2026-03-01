import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';
import { SeverityBadge } from '../components/SeverityBadge';
import { ThreatMap } from '../components/ThreatMap';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';
import { SignalTimeline, SeverityPieChart, SourceBarChart } from '../components/AnalyticsCharts';
import { Shield, FolderOpen, Rss, AlertTriangle, TrendingUp, MapPin, Download } from 'lucide-react';
import * as api from '../api';
import type { Analytics } from '../types';

export function DashboardPage() {
  const signals = useStore((s) => s.signals);
  const cases = useStore((s) => s.cases);
  const sources = useStore((s) => s.sources);
  const loadSignals = useStore((s) => s.loadSignals);
  const loadCases = useStore((s) => s.loadCases);
  const loadSources = useStore((s) => s.loadSources);

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'analytics'>('overview');

  useEffect(() => {
    loadSignals();
    loadCases();
    loadSources();
    api.fetchAnalytics(30).then(setAnalytics).catch(() => {});
  }, [loadSignals, loadCases, loadSources]);

  const { newCount, critCount, openCases } = useMemo(() => ({
    newCount: signals.filter((s) => s.status === 'New').length,
    critCount: signals.filter((s) => s.severity >= 60).length,
    openCases: cases.filter((c) => c.status !== 'Closed').length,
  }), [signals, cases]);

  const geoCount = useMemo(
    () => signals.filter((s) => s.latitude !== null).length,
    [signals],
  );

  const stats = useMemo(() => [
    { label: 'Signals', value: analytics?.total_signals ?? signals.length, icon: Shield, color: 'text-brand-500' },
    { label: 'New / Untriaged', value: analytics?.new_signals ?? newCount, icon: AlertTriangle, color: 'text-yellow-400' },
    { label: 'Critical', value: analytics?.critical_signals ?? critCount, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Open Cases', value: analytics?.open_cases ?? openCases, icon: FolderOpen, color: 'text-green-400' },
    { label: 'Sources', value: sources.length, icon: Rss, color: 'text-blue-400' },
    { label: 'Geolocated', value: geoCount, icon: MapPin, color: 'text-purple-400' },
  ], [signals.length, newCount, critCount, openCases, sources.length, geoCount, analytics]);

  const recent = useMemo(() => signals.slice(0, 8), [signals]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((st) => (
            <div
              key={st.label}
              className="rounded-xl border border-gray-700/50 bg-surface-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <st.icon className={`h-4 w-4 ${st.color}`} />
                <span className="text-xs text-gray-500">{st.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{st.value}</div>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 border-b border-gray-700/50">
          {[
            { key: 'overview' as const, label: 'Overview', icon: TrendingUp },
            { key: 'map' as const, label: 'Threat Map', icon: MapPin },
            { key: 'analytics' as const, label: 'Analytics', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}

          {/* Export button */}
          <div className="ml-auto flex items-center gap-2">
            <a
              href={api.getExportUrl('csv')}
              download
              className="flex items-center gap-1 rounded-lg bg-gray-700/50 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            >
              <Download className="h-3 w-3" /> CSV
            </a>
            <a
              href={api.getExportUrl('json')}
              download
              className="flex items-center gap-1 rounded-lg bg-gray-700/50 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            >
              <Download className="h-3 w-3" /> JSON
            </a>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Analysis Panel */}
            <AIAnalysisPanel />

            {/* Recent signals + quick chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-400 mb-3">Recent Signals</h2>
                <div className="space-y-2">
                  {recent.map((sig) => (
                    <div
                      key={sig.id}
                      className="flex items-center gap-4 rounded-lg border border-gray-700/50 bg-surface-card px-4 py-3"
                    >
                      <SeverityBadge score={sig.severity} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-200 truncate">{sig.title}</div>
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
                      <span className="text-xs text-gray-500">{sig.status}</span>
                    </div>
                  ))}
                  {recent.length === 0 && (
                    <p className="text-sm text-gray-500">No signals yet. Click "Poll feeds" to ingest.</p>
                  )}
                </div>
              </div>

              {analytics && (
                <SeverityPieChart data={analytics.severity_distribution} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <ThreatMap />
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <SignalTimeline data={analytics.signals_over_time} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SeverityPieChart data={analytics.severity_distribution} />
              <SourceBarChart data={analytics.top_sources} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && !analytics && (
          <p className="text-sm text-gray-500 text-center py-8">Loading analytics…</p>
        )}
      </div>
    </div>
  );
}
