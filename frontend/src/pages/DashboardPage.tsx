import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';
import { SeverityBadge } from '../components/SeverityBadge';
import { ThreatMap } from '../components/ThreatMap';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';
import { SignalTimeline, SeverityPieChart, SourceBarChart } from '../components/AnalyticsCharts';
import {
  Shield, FolderOpen, Rss, AlertTriangle, TrendingUp, MapPin, Download,
  Plane, Satellite, Flame, Sun, Telescope, Wifi,
} from 'lucide-react';
import * as api from '../api';
import type { Analytics } from '../types';
import {
  fetchAirTraffic,
  fetchNasaEvents,
  fetchSpaceWeather,
  fetchNearEarthObjects,
} from '../services/advancedLayers';

export function DashboardPage() {
  const signals = useStore((s) => s.signals);
  const cases = useStore((s) => s.cases);
  const sources = useStore((s) => s.sources);
  const loadSignals = useStore((s) => s.loadSignals);
  const loadCases = useStore((s) => s.loadCases);
  const loadSources = useStore((s) => s.loadSources);

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'analytics'>('overview');

  // Live data layer counts
  const [liveFeeds, setLiveFeeds] = useState<{ flights: number; nasaEvents: number; spaceWeather: number; neos: number; hazardousNeos: number }>({
    flights: 0, nasaEvents: 0, spaceWeather: 0, neos: 0, hazardousNeos: 0,
  });

  useEffect(() => {
    loadSignals();
    loadCases();
    loadSources();
    api.fetchAnalytics(30).then(setAnalytics).catch(() => {});

    // Fetch live layer counts
    Promise.allSettled([
      fetchAirTraffic(),
      fetchNasaEvents({ days: 7, limit: 100 }),
      fetchSpaceWeather(7),
      fetchNearEarthObjects(),
    ]).then(([flights, events, sw, neoResult]) => {
      const flightData = flights.status === 'fulfilled' ? flights.value : [];
      const eventData = events.status === 'fulfilled' ? events.value : [];
      const swData = sw.status === 'fulfilled' ? sw.value : [];
      const neoData = neoResult.status === 'fulfilled' ? neoResult.value : [];
      setLiveFeeds({
        flights: flightData.length,
        nasaEvents: eventData.length,
        spaceWeather: swData.length,
        neos: neoData.length,
        hazardousNeos: neoData.filter(n => n.is_potentially_hazardous).length,
      });
    });
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
    { label: 'SIGNALS', value: analytics?.total_signals ?? signals.length, icon: Shield, color: 'text-amber' },
    { label: 'UNTRIAGED', value: analytics?.new_signals ?? newCount, icon: AlertTriangle, color: 'text-yellow-400' },
    { label: 'CRITICAL', value: analytics?.critical_signals ?? critCount, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'OPEN CASES', value: analytics?.open_cases ?? openCases, icon: FolderOpen, color: 'text-tactical-green' },
    { label: 'SOURCES', value: sources.length, icon: Rss, color: 'text-tactical-blue' },
    { label: 'GEOLOCATED', value: geoCount, icon: MapPin, color: 'text-purple-400' },
  ], [signals.length, newCount, critCount, openCases, sources.length, geoCount, analytics]);

  const recent = useMemo(() => signals.slice(0, 8), [signals]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="COMMAND DASHBOARD" />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {stats.map((st) => (
            <div
              key={st.label}
              className="hud-border bg-surface-card p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <st.icon className={`h-3.5 w-3.5 ${st.color}`} />
                <span className="text-[9px] font-mono text-gray-600 tracking-wider uppercase">{st.label}</span>
              </div>
              <div className={`text-xl font-display font-bold tabular-nums ${st.color}`}>
                {st.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 border-b border-amber/10">
          {[
            { key: 'overview' as const, label: 'OVERVIEW', icon: TrendingUp },
            { key: 'map' as const, label: 'THREAT MAP', icon: MapPin },
            { key: 'analytics' as const, label: 'ANALYTICS', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-mono tracking-wider uppercase border-b-2 -mb-px transition-all ${
                activeTab === tab.key
                  ? 'border-amber text-amber text-glow-amber'
                  : 'border-transparent text-gray-600 hover:text-gray-400'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}

          {/* Export button */}
          <div className="ml-auto flex items-center gap-2">
            <a
              href={api.getExportUrl('csv')}
              download
              className="flex items-center gap-1 border border-amber/15 px-2.5 py-1 text-[10px] font-mono text-amber/40 hover:text-amber hover:border-amber/30 tracking-wider uppercase transition-all"
            >
              <Download className="h-3 w-3" /> CSV
            </a>
            <a
              href={api.getExportUrl('json')}
              download
              className="flex items-center gap-1 border border-amber/15 px-2.5 py-1 text-[10px] font-mono text-amber/40 hover:text-amber hover:border-amber/30 tracking-wider uppercase transition-all"
            >
              <Download className="h-3 w-3" /> JSON
            </a>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* AI Analysis Panel */}
            <AIAnalysisPanel />

            {/* Live Intelligence Feeds */}
            <div>
              <h2 className="text-[10px] font-display tracking-[0.15em] text-amber/50 uppercase mb-3 flex items-center gap-2">
                <Wifi className="h-3 w-3 text-tactical-green animate-pulse" />
                LIVE INTELLIGENCE FEEDS
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {[
                  { label: 'FLIGHTS TRACKED', value: liveFeeds.flights, icon: Plane, color: 'text-sky-400', to: '/airspace' },
                  { label: 'NASA EVENTS', value: liveFeeds.nasaEvents, icon: Satellite, color: 'text-emerald-400', to: '/surveillance' },
                  { label: 'SPACE WEATHER', value: liveFeeds.spaceWeather, icon: Sun, color: 'text-yellow-400', to: '/surveillance' },
                  { label: 'NEAR-EARTH OBJ', value: liveFeeds.neos, icon: Telescope, color: 'text-purple-400', to: '/surveillance' },
                  { label: 'FIRE HOTSPOTS', value: liveFeeds.hazardousNeos, icon: Flame, color: 'text-orange-400', to: '/surveillance' },
                ].map((feed) => (
                  <a
                    key={feed.label}
                    href={feed.to}
                    className="hud-border bg-surface-card p-3 hover:border-amber/30 transition-all group cursor-pointer block"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <feed.icon className={`h-3.5 w-3.5 ${feed.color}`} />
                      <span className="text-[9px] font-mono text-gray-600 tracking-wider uppercase group-hover:text-gray-400 transition-colors">{feed.label}</span>
                    </div>
                    <div className={`text-xl font-display font-bold tabular-nums ${feed.color}`}>
                      {feed.value}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent signals + quick chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h2 className="text-[10px] font-display tracking-[0.15em] text-amber/50 uppercase mb-3">
                  RECENT SIGNALS
                </h2>
                <div className="space-y-1">
                  {recent.map((sig) => (
                    <div
                      key={sig.id}
                      className="flex items-center gap-3 hud-border bg-surface-card px-3 py-2"
                    >
                      <SeverityBadge score={sig.severity} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-mono text-gray-300 truncate">{sig.title}</div>
                        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-mono">
                          <span>{sig.source}</span>
                          {sig.location_name && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              {sig.location_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-amber/30 uppercase tracking-wider">{sig.status}</span>
                    </div>
                  ))}
                  {recent.length === 0 && (
                    <p className="text-[11px] font-mono text-gray-600 text-center py-6">
                      NO SIGNALS · CLICK &quot;INGEST&quot; TO BEGIN
                    </p>
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
          <div className="h-[500px]">
            <ThreatMap />
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-4">
            <SignalTimeline data={analytics.signals_over_time} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SeverityPieChart data={analytics.severity_distribution} />
              <SourceBarChart data={analytics.top_sources} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && !analytics && (
          <p className="text-[11px] font-mono text-gray-600 text-center py-8 tracking-wider">
            LOADING ANALYTICS MODULE...
          </p>
        )}
      </div>
    </div>
  );
}
