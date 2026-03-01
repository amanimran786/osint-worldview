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
      <TopBar title="SIGNALS" />

      {/* Filter bar */}
      <div className="flex items-center gap-2 border-b border-amber/10 bg-surface px-4 py-2">
        <span className="text-[9px] font-mono text-gray-600 mr-2 tracking-wider uppercase">Status:</span>
        {statusFilters.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border transition-all ${
              filterStatus === st
                ? 'border-amber/40 bg-amber/10 text-amber'
                : 'border-transparent text-gray-600 hover:text-amber/60 hover:border-amber/15'
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
