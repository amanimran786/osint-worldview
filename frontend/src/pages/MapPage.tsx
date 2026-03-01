import { useState, useCallback } from 'react';
import { ThreatMap } from '../components/ThreatMap';
import { DataLayerPanel, useDataLayers } from '../components/DataLayerPanel';
import { CityQuickJump } from '../components/CityQuickJump';
import { VisualModeSelector } from '../components/VisualModeSelector';
import type { City } from '../components/CityQuickJump';
import type { VisualMode } from '../types';
import { Wifi, Maximize2 } from 'lucide-react';

export function MapPage() {
  const { layers, data, loading, toggle, refresh, setLayers } = useDataLayers();
  const [flyTo, setFlyTo] = useState<City | null>(null);
  const [activeCity, setActiveCity] = useState<string>();
  const [visualMode, setVisualMode] = useState<VisualMode>('normal');
  const [signalCount, setSignalCount] = useState(0);

  const handleCityJump = useCallback((city: City) => {
    setFlyTo(city);
    setActiveCity(city.name);
  }, []);

  const handleSignalCount = useCallback((n: number) => {
    setSignalCount(n);
    setLayers(prev => prev.map(l => l.key === 'signals' ? { ...l, count: n } : l));
  }, [setLayers]);

  const visualModeClass = {
    normal: '',
    crt: 'crt-mode',
    nvg: 'nvg-mode',
    flir: 'flir-mode',
    noir: 'noir-mode',
    snow: 'snow-mode',
  }[visualMode];

  return (
    <div className={`flex-1 flex flex-col overflow-hidden bg-surface ${visualModeClass}`}>
      {/* Top bar with visual modes and city jump */}
      <div className="border-b border-amber/10 bg-surface px-4 py-2 space-y-2 z-10">
        {/* Row 1: Title + Visual Modes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[12px] font-display tracking-[0.15em] text-amber uppercase text-glow-amber">
              WORLD VIEW
            </h1>
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-tactical-green/60" />
              <span className="text-[9px] font-mono text-tactical-green/50 tracking-wider">
                LIVE · {signalCount} FEEDS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <VisualModeSelector current={visualMode} onChange={setVisualMode} />
            <button className="text-amber/30 hover:text-amber/60 transition-colors">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Row 2: City Quick Jump */}
        <CityQuickJump onJump={handleCityJump} active={activeCity} />
      </div>

      {/* Main map area with data layer panel overlay */}
      <div className="flex-1 relative">
        {/* The map */}
        <ThreatMap
          layers={layers}
          layerData={data}
          flyTo={flyTo}
          signalCount={handleSignalCount}
        />

        {/* Data layer panel — floating left */}
        <div className="absolute top-4 left-4 z-[1000] w-52">
          <DataLayerPanel
            layers={layers}
            onToggle={toggle}
            onRefresh={refresh}
            loading={loading}
          />
        </div>

        {/* Mini stats — floating right */}
        <div className="absolute top-4 right-4 z-[1000] hud-border bg-surface/90 backdrop-blur-sm p-3 space-y-2">
          <div className="text-[9px] font-display tracking-[0.2em] text-amber/50 uppercase mb-2">
            INTEL SUMMARY
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
            <span className="text-gray-600">Signals</span>
            <span className="text-amber tabular-nums text-right">{signalCount}</span>
            <span className="text-gray-600">Earthquakes</span>
            <span className="text-red-400 tabular-nums text-right">
              {layers.find(l => l.key === 'earthquakes')?.count ?? 0}
            </span>
            <span className="text-gray-600">Weather</span>
            <span className="text-blue-400 tabular-nums text-right">
              {layers.find(l => l.key === 'weather')?.count ?? 0}
            </span>
            <span className="text-gray-600">Cyber</span>
            <span className="text-purple-400 tabular-nums text-right">
              {layers.find(l => l.key === 'cyber')?.count ?? 0}
            </span>
            <span className="text-gray-600">Disasters</span>
            <span className="text-orange-400 tabular-nums text-right">
              {layers.find(l => l.key === 'disasters')?.count ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
