import { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { HUDOverlay } from './components/HUDOverlay';
import { ToastContainer } from './components/Toast';
import { useWebSocket } from './hooks/useWebSocket';
import { useStore } from './store';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import type { WSMessage } from './types';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SignalsPage = lazy(() => import('./pages/SignalsPage').then(m => ({ default: m.SignalsPage })));
const CasesPage = lazy(() => import('./pages/CasesPage').then(m => ({ default: m.CasesPage })));
const RulesPage = lazy(() => import('./pages/RulesPage').then(m => ({ default: m.RulesPage })));
const SourcesPage = lazy(() => import('./pages/SourcesPage').then(m => ({ default: m.SourcesPage })));
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AirspacePage = lazy(() => import('./pages/AirspacePage').then(m => ({ default: m.AirspacePage })));
const MaritimePage = lazy(() => import('./pages/MaritimePage').then(m => ({ default: m.MaritimePage })));
const SurveillancePage = lazy(() => import('./pages/SurveillancePage').then(m => ({ default: m.SurveillancePage })));
const OSINTBiblePage = lazy(() => import('./pages/OSINTBiblePage').then(m => ({ default: m.OSINTBiblePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

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

function AuthLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber border-t-transparent" />
        <span className="text-[10px] font-mono text-amber/40 tracking-[0.3em] uppercase">
          Verifying Clearance...
        </span>
      </div>
    </div>
  );
}

function ProtectedApp() {
  const { user, loading } = useAuth();
  const loadSignals = useStore((s) => s.loadSignals);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }>>([]);

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useWebSocket(useCallback((msg: WSMessage) => {
    switch (msg.type) {
      case 'new_signal':
        addToast('\u26A1 NEW SIGNAL DETECTED', 'info');
        loadSignals();
        break;
      case 'signal_update':
        loadSignals();
        break;
      case 'poll_complete': {
        const count = (msg.data?.new_signals as number) ?? 0;
        addToast('\u2713 FEED POLL \u2014 ' + count + ' NEW SIGNALS', 'success');
        loadSignals();
        break;
      }
    }
  }, [addToast, loadSignals]));

  if (loading) return <AuthLoader />;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
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
          <Route path="/maritime" element={<MaritimePage />} />
          <Route path="/surveillance" element={<SurveillancePage />} />
          <Route path="/osint-bible" element={<OSINTBiblePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <HUDOverlay />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedApp />
      </BrowserRouter>
    </AuthProvider>
  );
}
