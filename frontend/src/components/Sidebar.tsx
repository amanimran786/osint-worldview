import { NavLink } from 'react-router-dom';
import {
  Activity,
  Shield,
  Rss,
  FolderOpen,
  BookOpen,
  Map,
  BarChart3,
  Radio,
  Plane,
  Camera,
  Ship,
  Library,
  Settings,
  LogOut,
  Scan,
  Eye,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { useVariant } from '../contexts/VariantContext';

const links = [
  { to: '/', label: 'Dashboard', icon: Activity },
  { to: '/signals', label: 'Signals', icon: Shield },
  { to: '/map', label: 'World View', icon: Map },
  { to: '/god-mode', label: '4D God Mode', icon: Eye },
  { to: '/scanner', label: 'Scanner', icon: Scan },
  { to: '/airspace', label: 'Airspace', icon: Plane },
  { to: '/maritime', label: 'Maritime', icon: Ship },
  { to: '/surveillance', label: 'Surveillance', icon: Camera },
  { to: '/osint-bible', label: 'OSINT Bible', icon: Library },
  { to: '/cases', label: 'Cases', icon: FolderOpen },
  { to: '/rules', label: 'Rules', icon: BookOpen },
  { to: '/sources', label: 'Sources', icon: Rss },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { variant, variantMeta, variants, setVariant } = useVariant();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-amber/10 bg-surface">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-amber/10">
          <Radio className="h-5 w-5 text-amber animate-blink-slow" />
          <div className="flex flex-col">
            <span className="text-[11px] font-display tracking-[0.15em] text-amber text-glow-amber">
              {variantMeta.shortName} VIEW
            </span>
            <span className="text-[8px] font-mono tracking-wider text-amber/30 uppercase">
              {variantMeta.tagline}
            </span>
          </div>
        </div>

      {/* Classification strip */}
      <div className="bg-red-900/30 px-4 py-0.5 text-center">
        <span className="text-[8px] font-mono tracking-[0.3em] text-red-400/60 uppercase">
          CLASSIFIED
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 text-[11px] font-mono tracking-wider uppercase',
                'border transition-all duration-150',
                isActive
                  ? 'border-amber/30 bg-amber/10 text-amber text-glow-amber'
                  : 'border-transparent text-gray-600 hover:text-amber/70 hover:border-amber/15 hover:bg-amber/5',
              )
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Settings + Operator */}
      <div className="border-t border-amber/10 px-2 py-2 space-y-1">
        <label className="block px-3 pt-1">
          <span className="text-[8px] font-mono tracking-[0.2em] text-amber/30 uppercase">Variant</span>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as typeof variant)}
            className="mt-1 w-full border border-amber/20 bg-surface-card px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-amber/80 focus:border-amber/40 focus:outline-none"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} className="bg-surface-card text-amber/90">
                {v.shortName}
              </option>
            ))}
          </select>
        </label>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2 text-[11px] font-mono tracking-wider uppercase',
              'border transition-all duration-150',
              isActive
                ? 'border-amber/30 bg-amber/10 text-amber text-glow-amber'
                : 'border-transparent text-gray-600 hover:text-amber/70 hover:border-amber/15 hover:bg-amber/5',
            )
          }
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </NavLink>

        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-3 py-2 text-[11px] font-mono tracking-wider uppercase border border-transparent text-gray-600 hover:text-red-400/80 hover:border-red-400/15 hover:bg-red-400/5 transition-all duration-150"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      {/* Operator info */}
      {user && (
        <div className="border-t border-amber/10 px-4 py-2">
          <div className="text-[9px] font-mono text-amber/40 tracking-wider truncate">
            {user.email ?? 'OPERATOR'}
          </div>
        </div>
      )}

      {/* Status footer */}
      <div className="border-t border-amber/10 px-4 py-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-tactical-green animate-blink-slow" />
          <span className="text-[9px] font-mono text-tactical-green/60 tracking-wider">SYSTEMS NOMINAL</span>
        </div>
        <div className="text-[8px] font-mono text-gray-700 tracking-wider">
          v3.2.0 · {variantMeta.name}
        </div>
      </div>
    </aside>
  );
}
