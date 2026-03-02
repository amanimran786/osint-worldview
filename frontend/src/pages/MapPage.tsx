import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { ThreatMap } from '../components/ThreatMap';
import { DataLayerPanel, useDataLayers } from '../components/DataLayerPanel';
import { CityQuickJump } from '../components/CityQuickJump';
import { VisualModeSelector } from '../components/VisualModeSelector';
import type { City } from '../components/CityQuickJump';
import type { VisualMode, GeoSignal } from '../types';
import { Wifi, Maximize2, Globe, Map } from 'lucide-react';
import * as api from '../api';

const Globe3D = lazy(() => import('../components/Globe3D').then(m => ({ default: m.Globe3D })));

export function MapPage() {
  const { layers, data, loading, toggle, refresh, setLayers } = useDataLayers();
  const [flyTo, setFlyTo] = useState<City | null>(null);
  const [activeCity, setActiveCity] = useState<string>();
  const [visualMode, setVisualMode] = useState<VisualMode>('normal');
  const [signalCount, setSignalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [geoSignals, setGeoSignals] = useState<GeoSignal[]>([]);

  // Fetch geo signals for 3D globe
  useEffect(() => {
    api.fetchGeoSignals({ limit: 500 }).then((data) => {
      const geo = data.filter((s) => s.latitude !== null && s.longitude !== null);
      setGeoSignals(geo);
    }).catch(() => {});
  }, []);

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
        {/* Row 1: Title + View Toggle + Visual Modes */}
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
            {/* 2D / 3D toggle */}
            <div className="flex items-center border border-amber/20 divide-x divide-amber/20">
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                  viewMode === '2d'
                    ? 'bg-amber/15 text-amber'
                    : 'text-amber/30 hover:text-amber/50'
                }`}
              >
                <Map className="h-3 w-3" />
                2D
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                  viewMode === '3d'
                    ? 'bg-amber/15 text-amber'
                    : 'text-amber/30 hover:text-amber/50'
                }`}
              >
                <Globe className="h-3 w-3" />
                3D
              </button>
            </div>
            <VisualModeSelector current={visualMode} onChange={setVisualMode} />
            <button className="text-amber/30 hover:text-amber/60 transition-colors">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Row 2: City Quick Jump (2D only) */}
        {viewMode === '2d' && (
          <CityQuickJump onJump={handleCityJump} active={activeCity} />
        )}
      </div>

      {/* Main map/globe area with data layer panel overlay */}
      <div className="flex-1 relative">
        {viewMode === '2d' ? (
          <ThreatMap
            layers={layers}
            layerData={data}
            flyTo={flyTo}
            signalCount={handleSignalCount}
          />
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-[#060a14]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                <span className="text-[10px] font-mono text-amber/40 tracking-[0.2em]">INITIALIZING GLOBE...</span>
              </div>
            </div>
          }>
            <Globe3D signals={geoSignals} layers={layers} layerData={data} />
          </Suspense>
        )}

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
            <span className="text-gray-600">Flights</span>
            <span className="text-sky-400 tabular-nums text-right">
              {layers.find(l => l.key === 'flights')?.count ?? 0}
            </span>
            <span className="text-gray-600">NASA Events</span>
            <span className="text-emerald-400 tabular-nums text-right">
              {layers.find(l => l.key === 'nasaEvents')?.count ?? 0}
            </span>
            <span className="text-gray-600">Fires</span>
            <span className="text-orange-300 tabular-nums text-right">
              {layers.find(l => l.key === 'fires')?.count ?? 0}
            </span>
            <span className="text-gray-600">Space Wx</span>
            <span className="text-yellow-400 tabular-nums text-right">
              {layers.find(l => l.key === 'spaceWeather')?.count ?? 0}
            </span>
            <span className="text-gray-600">GDELT Intel</span>
            <span className="text-cyan-400 tabular-nums text-right">
              {layers.find(l => l.key === 'gdeltNews')?.count ?? 0}
            </span>
            <span className="text-gray-600">Threat Idx</span>
            <span className="text-red-500 tabular-nums text-right">
              {layers.find(l => l.key === 'countryThreats')?.count ?? 0}
            </span>
            <span className="text-gray-600">Ransomware</span>
            <span className="text-rose-400 tabular-nums text-right">
              {layers.find(l => l.key === 'ransomware')?.count ?? 0}
            </span>
            <span className="text-gray-600">Maritime</span>
            <span className="text-cyan-400 tabular-nums text-right">
              {layers.find(l => l.key === 'maritime')?.count ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
