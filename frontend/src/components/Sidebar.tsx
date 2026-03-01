import { NavLink } from 'react-router-dom';
import {
  Activity,
  Shield,
  Rss,
  FolderOpen,
  BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';

const links = [
  { to: '/', label: 'Dashboard', icon: Activity },
  { to: '/signals', label: 'Signals', icon: Shield },
  { to: '/cases', label: 'Cases', icon: FolderOpen },
  { to: '/rules', label: 'Rules', icon: BookOpen },
  { to: '/sources', label: 'Sources', icon: Rss },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-700/50 bg-surface-card">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4 border-b border-gray-700/50">
        <Shield className="h-6 w-6 text-brand-500" />
        <span className="text-sm font-bold tracking-wide text-white">
          OSINT Worldview
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-brand-600/20 text-brand-500'
                  : 'text-gray-400 hover:bg-surface-hover hover:text-gray-200',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700/50 px-4 py-3 text-xs text-gray-500">
        v0.1.0 &middot; GSOC
      </div>
    </aside>
  );
}
