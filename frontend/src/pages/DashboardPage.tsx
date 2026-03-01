import { useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';
import { SeverityBadge } from '../components/SeverityBadge';
import { Shield, FolderOpen, Rss, AlertTriangle } from 'lucide-react';

export function DashboardPage() {
  const signals = useStore((s) => s.signals);
  const cases = useStore((s) => s.cases);
  const sources = useStore((s) => s.sources);
  const loadSignals = useStore((s) => s.loadSignals);
  const loadCases = useStore((s) => s.loadCases);
  const loadSources = useStore((s) => s.loadSources);

  useEffect(() => {
    loadSignals();
    loadCases();
    loadSources();
  }, [loadSignals, loadCases, loadSources]);

  const { newCount, critCount, openCases } = useMemo(() => ({
    newCount: signals.filter((s) => s.status === 'New').length,
    critCount: signals.filter((s) => s.severity >= 60).length,
    openCases: cases.filter((c) => c.status !== 'Closed').length,
  }), [signals, cases]);

  const stats = useMemo(() => [
    { label: 'Signals', value: signals.length, icon: Shield, color: 'text-brand-500' },
    { label: 'New / Untriaged', value: newCount, icon: AlertTriangle, color: 'text-yellow-400' },
    { label: 'Critical', value: critCount, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Open Cases', value: openCases, icon: FolderOpen, color: 'text-green-400' },
    { label: 'Sources', value: sources.length, icon: Rss, color: 'text-blue-400' },
  ], [signals.length, newCount, critCount, openCases, sources.length]);

  const recent = useMemo(() => signals.slice(0, 8), [signals]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

        {/* Recent signals */}
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
                  <div className="text-xs text-gray-500">{sig.source}</div>
                </div>
                <span className="text-xs text-gray-500">{sig.status}</span>
              </div>
            ))}
            {recent.length === 0 && (
              <p className="text-sm text-gray-500">No signals yet. Click "Poll feeds" to ingest.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
