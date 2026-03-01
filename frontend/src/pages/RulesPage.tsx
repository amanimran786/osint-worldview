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
      <TopBar title="Detection Rules" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 w-28">Category</th>
                <th className="px-4 py-3 w-20">Severity</th>
                <th className="px-4 py-3">Keywords</th>
                <th className="px-4 py-3 w-20">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-gray-200">{r.name}</td>
                  <td className="px-4 py-3 text-gray-400">{r.category}</td>
                  <td className="px-4 py-3 text-gray-400">{r.severity}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-xs">
                    {r.keywords}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        r.enabled ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rules.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              No rules yet. Run the seed script to add defaults.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
