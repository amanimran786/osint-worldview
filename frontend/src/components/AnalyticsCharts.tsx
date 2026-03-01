import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';
import type { Analytics } from '../types';

const SEVERITY_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'];
const SOURCE_COLORS = ['#f0a030', '#f0a03099', '#f0a03066', '#f0a03044', '#f0a03033', '#d48a20', '#c07818', '#a06010', '#804800', '#603800'];

const TOOLTIP_STYLE = {
  background: '#0c1220',
  border: '1px solid rgba(240,160,48,0.25)',
  borderRadius: '0',
  color: '#f0a030',
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
};

export function SignalTimeline({ data }: { data: Analytics['signals_over_time'] }) {
  return (
    <div className="hud-border bg-surface-card p-4">
      <h3 className="text-[10px] font-display tracking-[0.15em] text-amber/50 uppercase mb-4">Signals Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f0a030" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f0a030" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2440" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(val: string) => val.slice(5)}
          />
          <YAxis tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#f0a030"
            strokeWidth={1.5}
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
      <div className="hud-border bg-surface-card p-4">
        <h3 className="text-[10px] font-display tracking-[0.15em] text-amber/50 uppercase mb-4">Severity Distribution</h3>
        <p className="text-[11px] font-mono text-gray-600 text-center py-8">NO DATA</p>
      </div>
    );
  }

  return (
    <div className="hud-border bg-surface-card p-4">
      <h3 className="text-[10px] font-display tracking-[0.15em] text-amber/50 uppercase mb-4">Severity Distribution</h3>
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
            stroke="#080e1a"
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={SEVERITY_COLORS[idx % SEVERITY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourceBarChart({ data }: { data: Analytics['top_sources'] }) {
  if (data.length === 0) {
    return (
      <div className="hud-border bg-surface-card p-4">
        <h3 className="text-[10px] font-display tracking-[0.15em] text-amber/50 uppercase mb-4">Top Sources</h3>
        <p className="text-[11px] font-mono text-gray-600 text-center py-8">NO DATA</p>
      </div>
    );
  }

  return (
    <div className="hud-border bg-surface-card p-4">
      <h3 className="text-[10px] font-display tracking-[0.15em] text-amber/50 uppercase mb-4">Top Sources</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2440" />
          <XAxis type="number" tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'JetBrains Mono' }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="source"
            tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            width={120}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="count" radius={[0, 2, 2, 0]}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
