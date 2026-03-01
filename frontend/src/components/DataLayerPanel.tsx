import { useState, useEffect } from 'react';
import type { DataLayerKey, DataLayerState, EarthquakeFeature, WeatherData, CyberThreat, DisasterEvent } from '../types';
import * as api from '../api';
import {
  Activity, Cloud, Shield, AlertTriangle,
  Zap, Loader2,
} from 'lucide-react';

const LAYER_META: Record<DataLayerKey, { label: string; icon: typeof Activity; color: string }> = {
  signals: { label: 'OSINT Signals', icon: Shield, color: '#f0a030' },
  earthquakes: { label: 'Earthquakes', icon: Activity, color: '#ef4444' },
  weather: { label: 'Weather Intel', icon: Cloud, color: '#3b82f6' },
  cyber: { label: 'Cyber Threats', icon: Zap, color: '#a855f7' },
  disasters: { label: 'Disasters', icon: AlertTriangle, color: '#f97316' },
};

export interface LayerData {
  earthquakes: EarthquakeFeature[];
  weather: WeatherData[];
  cyber: CyberThreat[];
  disasters: DisasterEvent[];
}

interface DataLayerPanelProps {
  layers: DataLayerState[];
  onToggle: (key: DataLayerKey) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function DataLayerPanel({ layers, onToggle, onRefresh, loading }: DataLayerPanelProps) {
  return (
    <div className="hud-border bg-surface-card/90 backdrop-blur-sm p-3 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-display tracking-[0.2em] text-amber/70 uppercase">
          Data Layers
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-[10px] text-amber/40 hover:text-amber border border-amber/20 px-2 py-0.5 font-mono uppercase tracking-wider disabled:opacity-30"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Refresh'}
        </button>
      </div>

      {layers.map((layer) => {
        const meta = LAYER_META[layer.key];
        const Icon = meta.icon;
        return (
          <button
            key={layer.key}
            onClick={() => onToggle(layer.key)}
            className={`
              w-full flex items-center gap-2 px-2 py-1.5 text-left
              border transition-all duration-150
              ${layer.enabled
                ? 'border-amber/30 bg-amber/5'
                : 'border-gray-800 bg-transparent hover:border-gray-700'
              }
            `}
          >
            <Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: layer.enabled ? meta.color : '#4b5563' }}
            />
            <div className="flex-1 min-w-0">
              <span className={`text-[11px] font-mono ${layer.enabled ? 'text-gray-200' : 'text-gray-600'}`}>
                {meta.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {layer.count > 0 && (
                <span
                  className="text-[10px] font-mono tabular-nums"
                  style={{ color: layer.enabled ? meta.color : '#6b7280' }}
                >
                  {layer.count.toLocaleString()}
                </span>
              )}
              <span className={`text-[9px] font-mono uppercase tracking-wider ${layer.enabled ? 'text-tactical-green' : 'text-gray-700'}`}>
                {layer.enabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ---- Hook: manages layer data fetching ---- */
export function useDataLayers() {
  const [layers, setLayers] = useState<DataLayerState[]>([
    { key: 'signals', label: 'OSINT Signals', enabled: true, count: 0, color: '#f0a030' },
    { key: 'earthquakes', label: 'Earthquakes', enabled: false, count: 0, color: '#ef4444' },
    { key: 'weather', label: 'Weather Intel', enabled: false, count: 0, color: '#3b82f6' },
    { key: 'cyber', label: 'Cyber Threats', enabled: false, count: 0, color: '#a855f7' },
    { key: 'disasters', label: 'Disasters', enabled: false, count: 0, color: '#f97316' },
  ]);

  const [data, setData] = useState<LayerData>({
    earthquakes: [],
    weather: [],
    cyber: [],
    disasters: [],
  });

  const [loading, setLoading] = useState(false);

  const toggle = (key: DataLayerKey) => {
    setLayers(prev => prev.map(l =>
      l.key === key ? { ...l, enabled: !l.enabled } : l
    ));
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const [eq, wx, cy, dis] = await Promise.allSettled([
        api.fetchEarthquakes({ period: 'day', min_magnitude: 2.5 }),
        api.fetchWeather(),
        api.fetchCyberThreats({ limit: 50 }),
        api.fetchDisasters(),
      ]);

      const eqData = eq.status === 'fulfilled' ? eq.value : [];
      const wxData = wx.status === 'fulfilled' ? wx.value : [];
      const cyData = cy.status === 'fulfilled' ? cy.value : [];
      const disData = dis.status === 'fulfilled' ? dis.value : [];

      setData({ earthquakes: eqData, weather: wxData, cyber: cyData, disasters: disData });
      setLayers(prev => prev.map(l => {
        switch (l.key) {
          case 'earthquakes': return { ...l, count: eqData.length };
          case 'weather': return { ...l, count: wxData.length };
          case 'cyber': return { ...l, count: cyData.length };
          case 'disasters': return { ...l, count: disData.length };
          default: return l;
        }
      }));
    } catch {
      // silently fail — layers are optional
    }
    setLoading(false);
  };

  // Fetch on mount
  useEffect(() => { refresh(); }, []);

  return { layers, data, loading, toggle, refresh, setLayers };
}
