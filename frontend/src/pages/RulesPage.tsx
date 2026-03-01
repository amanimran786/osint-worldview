import { useEffect } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';

export function RulesPage() {
  const rules = useStore((s) => s.rules);
  const loadRules = useStore((s) => s.loadRules);

  useEffect(() => {
    loadRules();
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="DETECTION RULES" />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-amber/10 text-left text-[9px] uppercase tracking-[0.15em] text-amber/30">
                <th className="px-3 py-2.5">Name</th>
                <th className="px-3 py-2.5 w-28">Category</th>
                <th className="px-3 py-2.5 w-20">Severity</th>
                <th className="px-3 py-2.5">Keywords</th>
                <th className="px-3 py-2.5 w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-gray-900/50 hover:bg-amber/5 transition-colors">
                  <td className="px-3 py-2.5 text-gray-300">{r.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{r.category}</td>
                  <td className="px-3 py-2.5 text-gray-500 tabular-nums">{r.severity}</td>
                  <td className="px-3 py-2.5 text-[10px] text-gray-600 truncate max-w-xs">
                    {r.keywords}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          r.enabled ? 'bg-tactical-green' : 'bg-gray-700'
                        }`}
                      />
                      <span className={`text-[9px] uppercase tracking-wider ${r.enabled ? 'text-tactical-green/60' : 'text-gray-700'}`}>
                        {r.enabled ? 'ON' : 'OFF'}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rules.length === 0 && (
            <p className="text-[11px] font-mono text-gray-600 text-center py-8 tracking-wider">
              NO RULES · RUN SEED SCRIPT TO ADD DEFAULTS
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
