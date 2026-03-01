import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { GeoSignal } from '../types';
import type { DataLayerState } from '../types';
import type { LayerData } from './DataLayerPanel';
import { severityColor, severityLabel } from '../types';
import * as api from '../api';
import 'leaflet/dist/leaflet.css';
import type { City } from './CityQuickJump';

/* ---- Map controller: fly to city ---- */
function MapController({ flyTo }: { flyTo: City | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, { duration: 1.5 });
    }
  }, [flyTo, map]);
  return null;
}

/* ---- Earthquake icon ---- */
function earthquakeIcon(mag: number) {
  const size = Math.max(8, Math.min(24, mag * 4));
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:radial-gradient(circle,#ef4444 0%,#ef444400 70%);
      border:1px solid #ef444480;
      animation:rec-pulse 2s infinite;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/* ---- Weather icon ---- */
function weatherIcon(severity: string) {
  const colors: Record<string, string> = {
    clear: '#3b82f6', mild: '#60a5fa', moderate: '#f59e0b', severe: '#ef4444', extreme: '#dc2626',
  };
  const color = colors[severity] || '#3b82f6';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:10px;height:10px;
      background:${color};
      border:1px solid ${color}80;
      transform:rotate(45deg);
    "></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

/* ---- Disaster icon ---- */
const disasterIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:12px;height:12px;
    background:#f97316;border:1px solid #f9731680;
    clip-path:polygon(50% 0%,100% 100%,0% 100%);
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface ThreatMapProps {
  layers?: DataLayerState[];
  layerData?: LayerData;
  flyTo?: City | null;
  signalCount?: (n: number) => void;
}

export function ThreatMap({ layers, layerData, flyTo, signalCount }: ThreatMapProps) {
  const [signals, setSignals] = useState<GeoSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  const isLayerOn = useCallback((key: string) => {
    if (!layers) return key === 'signals';
    return layers.find(l => l.key === key)?.enabled ?? false;
  }, [layers]);

  useEffect(() => {
    api.fetchGeoSignals({ limit: 500 }).then((data) => {
      const geo = data.filter((s) => s.latitude !== null && s.longitude !== null);
      setSignals(geo);
      signalCount?.(geo.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [signalCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-surface-card hud-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber border-t-transparent" />
          <span className="text-[10px] text-amber/40 font-mono tracking-wider">LOADING FEEDS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hud-border overflow-hidden h-full relative">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        style={{ height: '100%', width: '100%', background: '#080e1a' }}
        scrollWheelZoom={true}
        zoomControl={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController flyTo={flyTo ?? null} />

        {/* OSINT signals layer */}
        {isLayerOn('signals') && signals.map((sig) => (
          <CircleMarker
            key={`sig-${sig.id}`}
            center={[sig.latitude!, sig.longitude!]}
            radius={Math.max(5, Math.min(12, sig.severity / 6))}
            pathOptions={{
              color: severityColor(sig.severity),
              fillColor: severityColor(sig.severity),
              fillOpacity: 0.5,
              weight: 1,
            }}
          >
            <Popup>
              <div className="min-w-[180px] text-[11px] font-mono">
                <p className="font-bold text-amber mb-1">{sig.title}</p>
                <p className="text-amber/60">{sig.source} · {severityLabel(sig.severity)}</p>
                {sig.location_name && (
                  <p className="text-amber/40 mt-1">📍 {sig.location_name}</p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Earthquake layer */}
        {isLayerOn('earthquakes') && layerData?.earthquakes.map((eq) => (
          <Marker
            key={`eq-${eq.id}`}
            position={[eq.latitude, eq.longitude]}
            icon={earthquakeIcon(eq.magnitude)}
          >
            <Popup>
              <div className="min-w-[180px] text-[11px] font-mono">
                <p className="font-bold text-red-400 mb-1">🌍 M{eq.magnitude.toFixed(1)}</p>
                <p className="text-amber/70">{eq.title}</p>
                <p className="text-amber/40 mt-1">Depth: {eq.depth}km</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Weather layer */}
        {isLayerOn('weather') && layerData?.weather.map((wx) => (
          <Marker
            key={`wx-${wx.city}`}
            position={[wx.latitude, wx.longitude]}
            icon={weatherIcon(wx.severity)}
          >
            <Popup>
              <div className="min-w-[160px] text-[11px] font-mono">
                <p className="font-bold text-blue-400 mb-1">🌤 {wx.city}</p>
                <p className="text-amber/70">{wx.temperature_c}°C · {wx.condition}</p>
                <p className="text-amber/40 mt-1">Wind: {wx.wind_speed_kmh} km/h</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Disaster layer */}
        {isLayerOn('disasters') && layerData?.disasters
          .filter(d => d.latitude !== null && d.longitude !== null)
          .map((d, i) => (
            <Marker
              key={`dis-${i}`}
              position={[d.latitude!, d.longitude!]}
              icon={disasterIcon}
            >
              <Popup>
                <div className="min-w-[180px] text-[11px] font-mono">
                  <p className="font-bold text-orange-400 mb-1">⚠ {d.title}</p>
                  <p className="text-amber/60 line-clamp-2">{d.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm px-3 py-1.5 flex items-center justify-between z-[1000]">
        <span className="text-[10px] text-amber/50 font-mono">
          {signals.length} SIGNALS TRACKED
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-severity-low" /> LOW
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-severity-med" /> MED
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-severity-high" /> HIGH
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-severity-crit" /> CRIT
          </span>
        </div>
      </div>
    </div>
  );
}
