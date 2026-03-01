import { useEffect } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';
import { SignalTable } from '../components/SignalTable';
import { SignalDetail } from '../components/SignalDetail';

const statusFilters = ['', 'New', 'In Review', 'Escalated', 'Dismissed', 'Closed'];

export function SignalsPage() {
  const signals = useStore((s) => s.signals);
  const selectedId = useStore((s) => s.selectedSignalId);
  const filterStatus = useStore((s) => s.filterStatus);
  const loadSignals = useStore((s) => s.loadSignals);
  const setFilterStatus = useStore((s) => s.setFilterStatus);
  const selectSignal = useStore((s) => s.selectSignal);

  useEffect(() => {
    loadSignals();
  }, []);

  const selected = signals.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Signals" />

      {/* Filter bar */}
      <div className="flex items-center gap-2 border-b border-gray-700/50 bg-surface-card px-6 py-2">
        <span className="text-xs text-gray-500 mr-2">Status:</span>
        {statusFilters.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filterStatus === st
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:bg-surface-hover'
            }`}
          >
            {st || 'All'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <SignalTable
            signals={signals}
            selectedId={selectedId}
            onSelect={selectSignal}
          />
        </div>
        {selected && (
          <div className="w-96 shrink-0">
            <SignalDetail signal={selected} onClose={() => selectSignal(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
