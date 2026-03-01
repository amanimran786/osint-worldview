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

/* ---- Cyber threat icon ---- */
const cyberIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:8px;height:8px;border-radius:50%;
    background:#a855f7;border:1px solid #a855f780;
    box-shadow:0 0 6px #a855f7;
  "></div>`,
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});

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

/* ---- Flight icon (small plane triangle) ---- */
function flightIcon(heading: number | null, onGround: boolean) {
  const color = onGround ? '#64748b' : '#38bdf8';
  const rot = heading ?? 0;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:10px;height:10px;
      transform:rotate(${rot}deg);
    "><svg viewBox="0 0 24 24" fill="${color}" width="10" height="10"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

/* ---- NASA event icon ---- */
function nasaEventIcon(category: string) {
  const colors: Record<string, string> = {
    'Wildfires': '#ef4444', 'Severe Storms': '#8b5cf6', 'Volcanoes': '#dc2626',
    'Sea and Lake Ice': '#67e8f9', 'Floods': '#3b82f6', 'Drought': '#fbbf24',
  };
  const color = colors[category] ?? '#34d399';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:10px;height:10px;border-radius:50%;
      background:${color};border:1.5px solid ${color}80;
      box-shadow:0 0 6px ${color};
    "></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

/* ---- Fire hotspot icon ---- */
function fireIcon(confidence: string) {
  const color = confidence === 'high' ? '#dc2626' : confidence === 'nominal' ? '#f97316' : '#fbbf24';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:8px;height:8px;border-radius:50%;
      background:radial-gradient(circle,${color} 0%,${color}00 70%);
      border:1px solid ${color}60;
    "></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });
}

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
                <p className="text-amber/40 mt-1">Depth: {eq.depth_km}km</p>
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

        {/* Cyber threats layer */}
        {isLayerOn('cyber') && layerData?.cyber
          .filter(c => c.latitude && c.longitude)
          .map((c, i) => (
            <Marker
              key={`cyber-${i}`}
              position={[c.latitude, c.longitude]}
              icon={cyberIcon}
            >
              <Popup>
                <div className="min-w-[180px] text-[11px] font-mono">
                  <p className="font-bold text-purple-400 mb-1">🛡 {c.malware}</p>
                  <p className="text-amber/70">{c.ip}:{c.port}</p>
                  <p className="text-amber/40 mt-1">{c.country} · {c.status}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Air Traffic layer */}
        {isLayerOn('flights') && layerData?.flights
          ?.filter(f => f.latitude != null && f.longitude != null)
          .slice(0, 500)
          .map((f, i) => (
            <Marker
              key={`fl-${i}`}
              position={[f.latitude!, f.longitude!]}
              icon={flightIcon(f.true_track, f.on_ground)}
            >
              <Popup>
                <div className="min-w-[180px] text-[11px] font-mono">
                  <p className="font-bold text-sky-400 mb-1">✈ {f.callsign ?? f.icao24}</p>
                  <p className="text-amber/70">{f.origin_country}</p>
                  <p className="text-amber/40 mt-1">
                    {f.baro_altitude ? `${Math.round(f.baro_altitude * 3.28084).toLocaleString()} ft` : 'Ground'}
                    {f.velocity ? ` · ${Math.round(f.velocity * 1.944)} kts` : ''}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* NASA EONET events layer */}
        {isLayerOn('nasaEvents') && layerData?.nasaEvents
          ?.filter(e => e.latitude != null && e.longitude != null)
          .map((e, i) => (
            <Marker
              key={`nasa-${i}`}
              position={[e.latitude!, e.longitude!]}
              icon={nasaEventIcon(e.category)}
            >
              <Popup>
                <div className="min-w-[180px] text-[11px] font-mono">
                  <p className="font-bold text-emerald-400 mb-1">🛰 {e.title}</p>
                  <p className="text-amber/70">{e.category}</p>
                  <p className="text-amber/40 mt-1">{e.source} · {new Date(e.date).toLocaleDateString()}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Fire hotspots layer */}
        {isLayerOn('fires') && layerData?.fires
          ?.slice(0, 300)
          .map((f, i) => (
            <Marker
              key={`fire-${i}`}
              position={[f.latitude, f.longitude]}
              icon={fireIcon(f.confidence)}
            >
              <Popup>
                <div className="min-w-[160px] text-[11px] font-mono">
                  <p className="font-bold text-orange-400 mb-1">🔥 Fire Hotspot</p>
                  <p className="text-amber/70">Brightness: {f.brightness.toFixed(0)}K</p>
                  <p className="text-amber/40 mt-1">Confidence: {f.confidence}</p>
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
