import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';
import type { Analytics } from '../types';

const SEVERITY_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'];
const SOURCE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#4f46e5', '#4338ca', '#3730a3', '#312e81'];

export function SignalTimeline({ data }: { data: Analytics['signals_over_time'] }) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">Signals Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(val: string) => val.slice(5)} // MM-DD
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#signalGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeverityPieChart({ data }: { data: Analytics['severity_distribution'] }) {
  const chartData = useMemo(() => [
    { name: 'Low', value: data.low },
    { name: 'Medium', value: data.medium },
    { name: 'High', value: data.high },
    { name: 'Critical', value: data.critical },
  ].filter((d) => d.value > 0), [data]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Severity Distribution</h3>
        <p className="text-sm text-gray-500 text-center py-8">No data yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">Severity Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={SEVERITY_COLORS[idx % SEVERITY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourceBarChart({ data }: { data: Analytics['top_sources'] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Top Sources</h3>
        <p className="text-sm text-gray-500 text-center py-8">No data yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700/50 bg-surface-card p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">Top Sources</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="source"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            width={120}
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
