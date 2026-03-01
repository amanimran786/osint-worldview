import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

// Lazy-load pages for code-splitting — each becomes a separate JS chunk
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SignalsPage = lazy(() => import('./pages/SignalsPage').then(m => ({ default: m.SignalsPage })));
const CasesPage = lazy(() => import('./pages/CasesPage').then(m => ({ default: m.CasesPage })));
const RulesPage = lazy(() => import('./pages/RulesPage').then(m => ({ default: m.RulesPage })));
const SourcesPage = lazy(() => import('./pages/SourcesPage').then(m => ({ default: m.SourcesPage })));

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-surface">
        <Sidebar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/signals" element={<SignalsPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/sources" element={<SourcesPage />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
