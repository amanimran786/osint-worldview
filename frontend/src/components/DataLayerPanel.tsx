import { useState, useEffect, useCallback } from 'react';
import type { DataLayerKey, DataLayerState, EarthquakeFeature, WeatherData, CyberThreat, DisasterEvent } from '../types';
import type { FlightVector, NasaEvent, FireHotspot, SpaceWeatherEvent, GdeltArticle, CountryThreatScore, RansomwareEvent, Vessel } from '../services/advancedLayers';
import type { SiteVariant } from '../config/variants';
import { VARIANT_DEFAULT_LAYERS } from '../config/variantProfiles';
import * as api from '../api';
import {
  fetchAirTraffic,
  fetchNasaEvents,
  fetchFireHotspots,
  fetchSpaceWeather,
  fetchGdeltNews,
  getCountryThreatScores,
  getRansomwareEvents,
  fetchMaritimeVessels,
} from '../services/advancedLayers';
import {
  Activity, Cloud, Shield, AlertTriangle,
  Zap, Loader2, Plane, Satellite, Flame, Sun,
  Newspaper, Globe, Skull, Ship, CloudRain, Radio,
} from 'lucide-react';

const LAYER_META: Record<DataLayerKey, { label: string; icon: typeof Activity; color: string }> = {
  signals: { label: 'OSINT Signals', icon: Shield, color: '#f0a030' },
  earthquakes: { label: 'Earthquakes', icon: Activity, color: '#ef4444' },
  weather: { label: 'Weather Intel', icon: Cloud, color: '#3b82f6' },
  cyber: { label: 'Cyber Threats', icon: Zap, color: '#a855f7' },
  disasters: { label: 'Disasters', icon: AlertTriangle, color: '#f97316' },
  flights: { label: 'Air Traffic', icon: Plane, color: '#38bdf8' },
  nasaEvents: { label: 'NASA Events', icon: Satellite, color: '#34d399' },
  fires: { label: 'Fire Hotspots', icon: Flame, color: '#fb923c' },
  spaceWeather: { label: 'Space Weather', icon: Sun, color: '#fbbf24' },
  gdeltNews: { label: 'GDELT Intel', icon: Newspaper, color: '#06b6d4' },
  countryThreats: { label: 'Threat Index', icon: Globe, color: '#dc2626' },
  ransomware: { label: 'Ransomware', icon: Skull, color: '#e11d48' },
  maritime: { label: 'Maritime AIS', icon: Ship, color: '#06b6d4' },
  weatherRadar: { label: 'Weather Radar', icon: CloudRain, color: '#818cf8' },
  satellite: { label: 'Satellite Imagery', icon: Radio, color: '#a3e635' },
};

export interface LayerData {
  earthquakes: EarthquakeFeature[];
  weather: WeatherData[];
  cyber: CyberThreat[];
  disasters: DisasterEvent[];
  flights: FlightVector[];
  nasaEvents: NasaEvent[];
  fires: FireHotspot[];
  spaceWeather: SpaceWeatherEvent[];
  gdeltNews: GdeltArticle[];
  countryThreats: CountryThreatScore[];
  ransomware: RansomwareEvent[];
  vessels: Vessel[];
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
function makeBaseLayers(): DataLayerState[] {
  return [
    { key: 'signals', label: 'OSINT Signals', enabled: true, count: 0, color: '#f0a030' },
    { key: 'earthquakes', label: 'Earthquakes', enabled: true, count: 0, color: '#ef4444' },
    { key: 'weather', label: 'Weather Intel', enabled: true, count: 0, color: '#3b82f6' },
    { key: 'cyber', label: 'Cyber Threats', enabled: false, count: 0, color: '#a855f7' },
    { key: 'disasters', label: 'Disasters', enabled: true, count: 0, color: '#f97316' },
    { key: 'flights', label: 'Air Traffic', enabled: true, count: 0, color: '#38bdf8' },
    { key: 'nasaEvents', label: 'NASA Events', enabled: true, count: 0, color: '#34d399' },
    { key: 'fires', label: 'Fire Hotspots', enabled: true, count: 0, color: '#fb923c' },
    { key: 'spaceWeather', label: 'Space Weather', enabled: true, count: 0, color: '#fbbf24' },
    { key: 'gdeltNews', label: 'GDELT Intel', enabled: true, count: 0, color: '#06b6d4' },
    { key: 'countryThreats', label: 'Threat Index', enabled: false, count: 0, color: '#dc2626' },
    { key: 'ransomware', label: 'Ransomware', enabled: false, count: 0, color: '#e11d48' },
    { key: 'maritime', label: 'Maritime AIS', enabled: true, count: 0, color: '#06b6d4' },
    { key: 'weatherRadar', label: 'Weather Radar', enabled: false, count: 0, color: '#818cf8' },
    { key: 'satellite', label: 'Satellite Imagery', enabled: false, count: 0, color: '#a3e635' },
  ];
}

function applyVariantDefaults(layers: DataLayerState[], variant: SiteVariant): DataLayerState[] {
  const enabledSet = new Set(VARIANT_DEFAULT_LAYERS[variant]);
  return layers.map((layer) => ({ ...layer, enabled: enabledSet.has(layer.key) }));
}

export function useDataLayers(variant: SiteVariant) {
  const [layers, setLayers] = useState<DataLayerState[]>(() => applyVariantDefaults(makeBaseLayers(), variant));

  const [data, setData] = useState<LayerData>({
    earthquakes: [],
    weather: [],
    cyber: [],
    disasters: [],
    flights: [],
    nasaEvents: [],
    fires: [],
    spaceWeather: [],
    gdeltNews: [],
    countryThreats: [],
    ransomware: [],
    vessels: [],
  });

  const [loading, setLoading] = useState(false);
  const [failureStreak, setFailureStreak] = useState(0);

  const toggle = (key: DataLayerKey) => {
    setLayers(prev => prev.map(l =>
      l.key === key ? { ...l, enabled: !l.enabled } : l
    ));
  };

  useEffect(() => {
    setLayers((prev) => applyVariantDefaults(prev, variant));
  }, [variant]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [eq, wx, cy, dis, fl, nasa, fire, sw, gdelt, threats, ransom, vessels] = await Promise.allSettled([
        api.fetchEarthquakes({ period: 'day', min_magnitude: 2.5 }),
        api.fetchWeather(),
        api.fetchCyberThreats({ limit: 50 }),
        api.fetchDisasters(),
        fetchAirTraffic(),
        fetchNasaEvents({ days: 7, limit: 100 }),
        fetchFireHotspots({ days: 1 }),
        fetchSpaceWeather(7),
        fetchGdeltNews(),
        Promise.resolve(getCountryThreatScores()),
        Promise.resolve(getRansomwareEvents()),
        fetchMaritimeVessels(),
      ]);

      const eqData = eq.status === 'fulfilled' ? eq.value : [];
      const wxData = wx.status === 'fulfilled' ? wx.value : [];
      const cyData = cy.status === 'fulfilled' ? cy.value : [];
      const disData = dis.status === 'fulfilled' ? dis.value : [];
      const flData = fl.status === 'fulfilled' ? fl.value : [];
      const nasaData = nasa.status === 'fulfilled' ? nasa.value : [];
      const fireData = fire.status === 'fulfilled' ? fire.value : [];
      const swData = sw.status === 'fulfilled' ? sw.value : [];
      const gdeltData = gdelt.status === 'fulfilled' ? gdelt.value : [];
      const threatsData = threats.status === 'fulfilled' ? threats.value : [];
      const ransomData = ransom.status === 'fulfilled' ? ransom.value : [];
      const vesselData = vessels.status === 'fulfilled' ? vessels.value : [];
      const rejectedCount = [eq, wx, cy, dis, fl, nasa, fire, sw, gdelt, threats, ransom, vessels]
        .filter((result) => result.status === 'rejected').length;
      setFailureStreak((prev) => (rejectedCount === 0 ? 0 : Math.min(prev + 1, 5)));

      setData({
        earthquakes: eqData,
        weather: wxData,
        cyber: cyData,
        disasters: disData,
        flights: flData,
        nasaEvents: nasaData,
        fires: fireData,
        spaceWeather: swData,
        gdeltNews: gdeltData,
        countryThreats: threatsData,
        ransomware: ransomData,
        vessels: vesselData,
      });
      setLayers(prev => prev.map(l => {
        switch (l.key) {
          case 'earthquakes': return { ...l, count: eqData.length };
          case 'weather': return { ...l, count: wxData.length };
          case 'cyber': return { ...l, count: cyData.length };
          case 'disasters': return { ...l, count: disData.length };
          case 'flights': return { ...l, count: flData.length };
          case 'nasaEvents': return { ...l, count: nasaData.length };
          case 'fires': return { ...l, count: fireData.length };
          case 'spaceWeather': return { ...l, count: swData.length };
          case 'gdeltNews': return { ...l, count: gdeltData.length };
          case 'countryThreats': return { ...l, count: threatsData.length };
          case 'ransomware': return { ...l, count: ransomData.length };
          case 'maritime': return { ...l, count: vesselData.length };
          default: return l;
        }
      }));
    } catch {
      // silently fail — layers are optional
      setFailureStreak((prev) => Math.min(prev + 1, 5));
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch on mount
  useEffect(() => { refresh(); }, [refresh]);

  // Adaptive background refresh loop:
  // - normal mode: ~45s
  // - hidden tab: ~2m
  // - failure streak: exponential backoff up to 8m
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (stopped) return;
      const baseMs = document.visibilityState === 'hidden' ? 120_000 : 45_000;
      const backoffFactor = Math.min(2 ** failureStreak, 16);
      const delay = Math.min(baseMs * backoffFactor, 480_000);
      timer = setTimeout(async () => {
        await refresh();
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [refresh, failureStreak]);

  return { layers, data, loading, toggle, refresh, setLayers };
}
