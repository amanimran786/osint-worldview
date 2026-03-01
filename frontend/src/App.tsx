import { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { HUDOverlay } from './components/HUDOverlay';
import { ToastContainer } from './components/Toast';
import { useWebSocket } from './hooks/useWebSocket';
import { useStore } from './store';
import type { WSMessage } from './types';

// Lazy-load pages for code-splitting — each becomes a separate JS chunk
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SignalsPage = lazy(() => import('./pages/SignalsPage').then(m => ({ default: m.SignalsPage })));
const CasesPage = lazy(() => import('./pages/CasesPage').then(m => ({ default: m.CasesPage })));
const RulesPage = lazy(() => import('./pages/RulesPage').then(m => ({ default: m.RulesPage })));
const SourcesPage = lazy(() => import('./pages/SourcesPage').then(m => ({ default: m.SourcesPage })));
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AirspacePage = lazy(() => import('./pages/AirspacePage').then(m => ({ default: m.AirspacePage })));
const SurveillancePage = lazy(() => import('./pages/SurveillancePage').then(m => ({ default: m.SurveillancePage })));

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber border-t-transparent" />
        <span className="text-[10px] font-mono text-amber/40 tracking-[0.2em] uppercase">
          Loading Module...
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const loadSignals = useStore((s) => s.loadSignals);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }>>([]);

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Real-time WebSocket notifications
  useWebSocket(useCallback((msg: WSMessage) => {
    switch (msg.type) {
      case 'new_signal':
        addToast('⚡ NEW SIGNAL DETECTED', 'info');
        loadSignals(); // auto-refresh
        break;
      case 'signal_update':
        loadSignals();
        break;
      case 'poll_complete': {
        const count = (msg.data?.new_signals as number) ?? 0;
        addToast(`✓ FEED POLL — ${count} NEW SIGNALS`, 'success');
        loadSignals();
        break;
      }
    }
  }, [addToast, loadSignals]));

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-surface">
        <Sidebar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/airspace" element={<AirspacePage />} />
            <Route path="/surveillance" element={<SurveillancePage />} />
          </Routes>
        </Suspense>
        <HUDOverlay />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </BrowserRouter>
  );
}
