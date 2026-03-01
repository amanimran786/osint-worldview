import { TopBar } from '../components/TopBar';
import { ThreatMap } from '../components/ThreatMap';
import { useEffect, useState } from 'react';
import * as api from '../api';
import type { HeatmapEntry } from '../types';

export function MapPage() {
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);

  useEffect(() => {
    api.fetchHeatmap().then(setHeatmap).catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Threat Map" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <ThreatMap />

        {/* Country heatmap table */}
        {heatmap.length > 0 && (
          <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Signals by Country
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-2">Country</th>
                    <th className="px-4 py-2 text-right">Signals</th>
                    <th className="px-4 py-2 text-right">Avg Severity</th>
                    <th className="px-4 py-2">Threat Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmap.map((row) => (
                    <tr key={row.country_code} className="border-b border-gray-800/50 hover:bg-surface-hover">
                      <td className="px-4 py-2 font-medium text-gray-200">
                        {row.country_code}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-300">{row.count}</td>
                      <td className="px-4 py-2 text-right text-gray-400">
                        {row.avg_severity}
                      </td>
                      <td className="px-4 py-2">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, row.avg_severity)}%`,
                              backgroundColor:
                                row.avg_severity >= 60
                                  ? '#dc2626'
                                  : row.avg_severity >= 35
                                    ? '#ef4444'
                                    : row.avg_severity >= 15
                                      ? '#f59e0b'
                                      : '#22c55e',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
