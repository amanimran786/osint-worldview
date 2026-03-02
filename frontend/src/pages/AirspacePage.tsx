import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Plane, RefreshCw, Filter, MapPin, ArrowUp, ArrowDown,
  Minus, Radio, Layers, Clock, Globe, Wifi, Crosshair,
  Navigation, LocateFixed, List, Map as MapIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  fetchAirTraffic,
  fetchFlightTrack,
  type FlightVector,
  type FlightWaypoint,
} from '../services/advancedLayers';

/* ================================================================
   HELPERS
   ================================================================ */
function formatAlt(m: number | null): string {
  if (m == null) return '—';
  return `${Math.round(m * 3.28084).toLocaleString()} ft`;
}
function formatSpeed(ms: number | null): string {
  if (ms == null) return '—';
  return `${Math.round(ms * 1.944)} kts`;
}
function categoryLabel(cat: number): string {
  const labels: Record<number, string> = {
    0: 'Unknown', 1: 'No Info', 2: 'Light', 3: 'Small', 4: 'Large',
    5: 'High Vortex', 6: 'Heavy', 7: 'Hi-Perf', 8: 'Rotorcraft',
    9: 'Glider', 10: 'Lighter-than-air', 14: 'UAV', 15: 'Space',
  };
  return labels[cat] ?? 'Other';
}
function verticalIndicator(vr: number | null) {
  if (vr == null || Math.abs(vr) < 0.5) return <Minus className="h-3 w-3 text-amber/40" />;
  return vr > 0
    ? <ArrowUp className="h-3 w-3 text-tactical-green" />
    : <ArrowDown className="h-3 w-3 text-red-400" />;
}

/* ---- Cached plane icons ---- */
const _planeIconCache = new Map<string, L.DivIcon>();
function planeIcon(heading: number | null, onGround: boolean, selected: boolean) {
  const rot = Math.round((heading ?? 0) / 10) * 10;
  const key = `${rot}_${onGround}_${selected}`;
  let icon = _planeIconCache.get(key);
  if (!icon) {
    const color = selected ? '#fbbf24' : onGround ? '#64748b' : '#38bdf8';
    const size = selected ? 18 : 12;
    const glow = selected ? `filter:drop-shadow(0 0 6px ${color});` : '';
    icon = L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;transform:rotate(${rot}deg);${glow}">
        <svg viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
    _planeIconCache.set(key, icon);
  }
  return icon;
}

/* ---- Alt color for trail gradient ---- */
function altColor(alt: number | null): string {
  if (alt == null || alt <= 0) return '#64748b';
  if (alt < 3000) return '#22c55e';
  if (alt < 6000) return '#eab308';
  if (alt < 9000) return '#f97316';
  return '#ef4444';
}

/* ---- Map controller: follow selected aircraft ---- */
function FollowController({ target, follow }: { target: FlightVector | null; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (follow && target?.latitude != null && target?.longitude != null) {
      map.panTo([target.latitude, target.longitude], { animate: true, duration: 0.8 });
    }
  }, [follow, target, map]);
  return null;
}

/* ---- Regions for quick filter ---- */
const REGIONS: Record<string, { lamin: number; lomin: number; lamax: number; lomax: number; label: string }> = {
  world: { lamin: -90, lomin: -180, lamax: 90, lomax: 180, label: 'GLOBAL' },
  us: { lamin: 24, lomin: -125, lamax: 50, lomax: -66, label: 'USA' },
  europe: { lamin: 35, lomin: -10, lamax: 72, lomax: 40, label: 'EUROPE' },
  asia: { lamin: 10, lomin: 60, lamax: 55, lomax: 150, label: 'ASIA-PAC' },
  mideast: { lamin: 12, lomin: 25, lamax: 42, lomax: 65, label: 'MIDEAST' },
};

const REFRESH_INTERVAL = 15_000;

/* ================================================================
   MAIN PAGE
   ================================================================ */
export function AirspacePage() {
  const [flights, setFlights] = useState<FlightVector[]>([]);
  const [filtered, setFiltered] = useState<FlightVector[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [region, setRegion] = useState('world');
  const [search, setSearch] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<FlightVector | null>(null);
  const [trackPoints, setTrackPoints] = useState<FlightWaypoint[]>([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [follow, setFollow] = useState(false);
  const [view, setView] = useState<'map' | 'table'>('map');
  const [stats, setStats] = useState({ total: 0, airborne: 0, ground: 0, countries: 0 });
  const intervalRef = useRef<number | null>(null);
  const prevPositions = useRef<Map<string, { lat: number; lng: number }[]>>(new Map());

  const doFetch = useCallback(async () => {
    setLoading(true);
    try {
      const bounds = region === 'world' ? undefined : REGIONS[region];
      const data = await fetchAirTraffic(bounds ? { bounds } : undefined);
      const posMap = prevPositions.current;
      data.forEach(f => {
        if (f.latitude != null && f.longitude != null) {
          const hist = posMap.get(f.icao24) ?? [];
          hist.push({ lat: f.latitude, lng: f.longitude });
          if (hist.length > 20) hist.shift();
          posMap.set(f.icao24, hist);
        }
      });
      setFlights(data);
      setLastUpdate(new Date());
      const airborne = data.filter(f => !f.on_ground).length;
      const countries = new Set(data.map(f => f.origin_country)).size;
      setStats({ total: data.length, airborne, ground: data.length - airborne, countries });
      if (selectedFlight) {
        const updated = data.find(f => f.icao24 === selectedFlight.icao24);
        if (updated) setSelectedFlight(updated);
      }
    } catch { /* handled */ }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  useEffect(() => {
    doFetch();
    if (autoRefresh) {
      intervalRef.current = window.setInterval(doFetch, REFRESH_INTERVAL);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [doFetch, autoRefresh]);

  useEffect(() => {
    if (!search) { setFiltered(flights); return; }
    const q = search.toLowerCase();
    setFiltered(flights.filter(f =>
      f.callsign?.toLowerCase().includes(q) ||
      f.icao24.toLowerCase().includes(q) ||
      f.origin_country.toLowerCase().includes(q)
    ));
  }, [flights, search]);

  useEffect(() => {
    if (!selectedFlight) { setTrackPoints([]); return; }
    setTrackLoading(true);
    fetchFlightTrack(selectedFlight.icao24)
      .then(setTrackPoints)
      .catch(() => setTrackPoints([]))
      .finally(() => setTrackLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlight?.icao24]);

  const trackLine = useMemo<[number, number][]>(() => {
    return trackPoints
      .filter(p => p.latitude != null && p.longitude != null)
      .map(p => [p.latitude!, p.longitude!] as [number, number]);
  }, [trackPoints]);

  const selectedTrail = useMemo<[number, number][]>(() => {
    if (!selectedFlight) return [];
    const hist = prevPositions.current.get(selectedFlight.icao24);
    if (!hist || hist.length < 2) return [];
    return hist.map(p => [p.lat, p.lng] as [number, number]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlight, flights]);

  const selectFlight = useCallback((f: FlightVector | null) => {
    setSelectedFlight(f);
    if (!f) setFollow(false);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* Header */}
      <div className="border-b border-amber/10 bg-surface px-4 py-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Plane className="h-4 w-4 text-amber" />
            <h1 className="text-[12px] font-display tracking-[0.15em] text-amber uppercase text-glow-amber">
              AIRSPACE MONITOR
            </h1>
            <div className="flex items-center gap-1.5">
              <Wifi className={clsx('h-3 w-3', autoRefresh ? 'text-tactical-green animate-pulse' : 'text-red-400')} />
              <span className="text-[9px] font-mono text-tactical-green/50 tracking-wider">
                {autoRefresh ? 'LIVE' : 'PAUSED'} · {stats.total} AIRCRAFT
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-amber/20 divide-x divide-amber/20">
              <button
                onClick={() => setView('map')}
                className={clsx('px-2 py-1 transition-colors', view === 'map' ? 'bg-amber/15 text-amber' : 'text-amber/30 hover:text-amber/50')}
                title="Map view"
              >
                <MapIcon className="h-3 w-3" />
              </button>
              <button
                onClick={() => setView('table')}
                className={clsx('px-2 py-1 transition-colors', view === 'table' ? 'bg-amber/15 text-amber' : 'text-amber/30 hover:text-amber/50')}
                title="Table view"
              >
                <List className="h-3 w-3" />
              </button>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={clsx(
                'px-2 py-1 text-[8px] font-mono tracking-wider border transition-colors',
                autoRefresh
                  ? 'border-tactical-green/30 text-tactical-green bg-tactical-green/10'
                  : 'border-red-500/30 text-red-400 bg-red-500/10'
              )}
            >
              {autoRefresh ? '● LIVE 15s' : '○ PAUSED'}
            </button>
            <button
              onClick={doFetch}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-mono text-amber/50 border border-amber/20 hover:bg-amber/10 transition-colors"
            >
              <RefreshCw className={clsx('h-3 w-3', loading && 'animate-spin')} />
              REFRESH
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[9px] font-mono shrink-0">
            <span className="text-amber/40"><Globe className="h-3 w-3 inline mr-1" />{stats.airborne} AIR</span>
            <span className="text-amber/40"><MapPin className="h-3 w-3 inline mr-1" />{stats.ground} GND</span>
            <span className="text-amber/40"><Layers className="h-3 w-3 inline mr-1" />{stats.countries} NAT</span>
            {lastUpdate && <span className="text-amber/30"><Clock className="h-3 w-3 inline mr-1" />{lastUpdate.toLocaleTimeString()}</span>}
          </div>
          <div className="flex items-center border border-amber/20 divide-x divide-amber/20">
            {Object.entries(REGIONS).map(([key, r]) => (
              <button
                key={key}
                onClick={() => setRegion(key)}
                className={clsx(
                  'px-2 py-1 text-[8px] font-mono tracking-wider transition-colors',
                  region === key ? 'bg-amber/15 text-amber' : 'text-amber/30 hover:text-amber/50'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-amber/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search callsign, ICAO24, country…"
              className="w-full bg-surface border border-amber/20 pl-7 pr-3 py-1 text-[10px] font-mono text-amber placeholder:text-amber/20 focus:outline-none focus:border-amber/40"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {view === 'map' ? (
            <MapContainer
              center={[30, 0]}
              zoom={3}
              style={{ height: '100%', width: '100%', background: '#080e1a' }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <FollowController target={selectedFlight} follow={follow} />

              {filtered
                .filter(f => f.latitude != null && f.longitude != null)
                .slice(0, 800)
                .map(f => (
                  <Marker
                    key={f.icao24}
                    position={[f.latitude!, f.longitude!]}
                    icon={planeIcon(f.true_track, f.on_ground, selectedFlight?.icao24 === f.icao24)}
                    eventHandlers={{ click: () => selectFlight(f) }}
                  >
                    <Popup>
                      <div className="min-w-[180px] text-[11px] font-mono">
                        <p className="font-bold text-sky-400 mb-1">✈ {f.callsign ?? f.icao24}</p>
                        <p className="text-amber/70">{f.origin_country}</p>
                        <p className="text-amber/50 mt-1">
                          {f.baro_altitude ? `${Math.round(f.baro_altitude * 3.28084).toLocaleString()} ft` : 'Ground'}
                          {f.velocity ? ` · ${Math.round(f.velocity * 1.944)} kts` : ''}
                          {f.true_track != null ? ` · ${Math.round(f.true_track)}°` : ''}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {selectedTrail.length > 1 && (
                <Polyline
                  positions={selectedTrail}
                  pathOptions={{ color: '#fbbf24', weight: 2, opacity: 0.6, dashArray: '6,4' }}
                />
              )}

              {trackLine.length > 1 && (
                <>
                  <Polyline
                    positions={trackLine}
                    pathOptions={{ color: '#38bdf8', weight: 2.5, opacity: 0.7 }}
                  />
                  {trackPoints
                    .filter(p => p.latitude != null && p.longitude != null)
                    .map((p, i) => (
                      <CircleMarker
                        key={`wp-${i}`}
                        center={[p.latitude!, p.longitude!]}
                        radius={3}
                        pathOptions={{
                          color: altColor(p.baro_altitude),
                          fillColor: altColor(p.baro_altitude),
                          fillOpacity: 0.8,
                          weight: 1,
                        }}
                      >
                        <Popup>
                          <div className="text-[10px] font-mono">
                            <p className="text-amber/70">{new Date(p.time * 1000).toLocaleTimeString()}</p>
                            <p className="text-amber/50">{formatAlt(p.baro_altitude)}</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                </>
              )}
            </MapContainer>
          ) : (
            <div className="h-full overflow-y-auto scrollbar-thin">
              <table className="w-full text-[10px] font-mono">
                <thead className="sticky top-0 bg-surface border-b border-amber/10 z-10">
                  <tr className="text-amber/40 uppercase tracking-wider">
                    <th className="text-left px-3 py-2">Callsign</th>
                    <th className="text-left px-2 py-2">ICAO24</th>
                    <th className="text-left px-2 py-2">Origin</th>
                    <th className="text-right px-2 py-2">Altitude</th>
                    <th className="text-right px-2 py-2">Speed</th>
                    <th className="text-center px-2 py-2">Heading</th>
                    <th className="text-center px-2 py-2">V/R</th>
                    <th className="text-left px-2 py-2">Cat</th>
                    <th className="text-center px-2 py-2">Squawk</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-amber/30">
                        {search ? 'No matching aircraft' : 'No aircraft data — try a different region'}
                      </td>
                    </tr>
                  )}
                  {filtered.map(f => (
                    <tr
                      key={f.icao24}
                      onClick={() => selectFlight(f)}
                      className={clsx(
                        'border-b border-amber/5 cursor-pointer transition-colors',
                        selectedFlight?.icao24 === f.icao24
                          ? 'bg-amber/10 text-amber'
                          : 'text-amber/60 hover:bg-amber/5',
                        f.on_ground && 'opacity-50',
                      )}
                    >
                      <td className="px-3 py-1.5 font-semibold">
                        <Plane className="h-3 w-3 inline mr-1.5 text-cyan-400/60" style={{
                          transform: `rotate(${(f.true_track ?? 0) - 45}deg)`,
                        }} />
                        {f.callsign || '—'}
                      </td>
                      <td className="px-2 py-1.5 text-amber/40">{f.icao24}</td>
                      <td className="px-2 py-1.5">{f.origin_country}</td>
                      <td className="px-2 py-1.5 text-right">{formatAlt(f.baro_altitude)}</td>
                      <td className="px-2 py-1.5 text-right">{formatSpeed(f.velocity)}</td>
                      <td className="px-2 py-1.5 text-center">{f.true_track != null ? `${Math.round(f.true_track)}°` : '—'}</td>
                      <td className="px-2 py-1.5 text-center">{verticalIndicator(f.vertical_rate)}</td>
                      <td className="px-2 py-1.5 text-amber/40">{categoryLabel(f.category)}</td>
                      <td className="px-2 py-1.5 text-center">
                        {f.squawk === '7700' ? <span className="text-red-400 animate-pulse font-bold">7700</span>
                          : f.squawk === '7600' ? <span className="text-orange-400 font-bold">7600</span>
                          : f.squawk === '7500' ? <span className="text-red-500 animate-pulse font-bold">7500</span>
                          : <span className="text-amber/30">{f.squawk ?? '—'}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'map' && (
            <div className="absolute bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm px-3 py-1.5 flex items-center justify-between z-[1000]">
              <span className="text-[9px] text-amber/50 font-mono">
                {filtered.length} AIRCRAFT · {region.toUpperCase()} · {autoRefresh ? '15s REFRESH' : 'PAUSED'}
              </span>
              <div className="flex items-center gap-3 text-[8px] font-mono">
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-sky-400" /> AIRBORNE</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-slate-500" /> GROUND</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber" /> SELECTED</span>
                {trackLine.length > 0 && (
                  <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5 bg-sky-400" /> TRACK</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Flight detail panel */}
        {selectedFlight && (
          <div className="w-80 border-l border-amber/10 bg-surface overflow-y-auto shrink-0 scrollbar-thin">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-display tracking-wider text-amber text-glow-amber">
                    {selectedFlight.callsign || selectedFlight.icao24}
                  </h3>
                  <p className="text-[9px] font-mono text-amber/40 mt-0.5">
                    {selectedFlight.origin_country} · {categoryLabel(selectedFlight.category)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {view === 'map' && (
                    <button
                      onClick={() => setFollow(!follow)}
                      className={clsx(
                        'p-1.5 border transition-colors',
                        follow
                          ? 'border-amber/40 bg-amber/15 text-amber'
                          : 'border-amber/20 text-amber/30 hover:text-amber/50'
                      )}
                      title={follow ? 'Stop following' : 'Follow aircraft'}
                    >
                      <LocateFixed className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => selectFlight(null)}
                    className="text-amber/30 hover:text-amber p-1.5 border border-amber/20 hover:bg-amber/10"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {follow && (
                <div className="flex items-center gap-2 bg-amber/10 border border-amber/20 px-3 py-1.5">
                  <Crosshair className="h-3 w-3 text-amber animate-pulse" />
                  <span className="text-[9px] font-mono text-amber tracking-wider">TRACKING — AUTO-CENTER</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono">
                <DataCell label="ICAO24" value={selectedFlight.icao24} />
                <DataCell label="SQUAWK" value={selectedFlight.squawk ?? '—'} highlight={['7700','7500','7600'].includes(selectedFlight.squawk ?? '')} />
                <DataCell label="ALT (BARO)" value={formatAlt(selectedFlight.baro_altitude)} />
                <DataCell label="ALT (GEO)" value={formatAlt(selectedFlight.geo_altitude)} />
                <DataCell label="GND SPEED" value={formatSpeed(selectedFlight.velocity)} />
                <DataCell label="HEADING" value={selectedFlight.true_track != null ? `${Math.round(selectedFlight.true_track)}°` : '—'} />
                <DataCell label="V/RATE" value={
                  selectedFlight.vertical_rate != null
                    ? `${selectedFlight.vertical_rate > 0 ? '+' : ''}${Math.round(selectedFlight.vertical_rate * 196.85)} fpm`
                    : '—'
                } />
                <DataCell label="STATUS" value={selectedFlight.on_ground ? 'ON GROUND' : 'AIRBORNE'} />
                <DataCell label="LATITUDE" value={selectedFlight.latitude?.toFixed(5) ?? '—'} />
                <DataCell label="LONGITUDE" value={selectedFlight.longitude?.toFixed(5) ?? '—'} />
              </div>

              {trackPoints.length > 2 && (
                <div className="border-t border-amber/10 pt-3">
                  <h4 className="text-[9px] font-mono text-amber/40 tracking-wider mb-2 flex items-center gap-1.5">
                    <Navigation className="h-3 w-3" /> ALTITUDE PROFILE
                  </h4>
                  <AltitudeProfile waypoints={trackPoints} />
                </div>
              )}

              <div className="border-t border-amber/10 pt-3">
                <h4 className="text-[9px] font-mono text-amber/40 tracking-wider mb-2 flex items-center gap-1.5">
                  <Radio className="h-3 w-3" />
                  {trackLoading ? 'LOADING TRACK…' : `FLIGHT TRACK (${trackPoints.length} WP)`}
                </h4>
                {trackLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                  </div>
                ) : trackPoints.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
                    {trackPoints.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2 text-[8px] font-mono text-amber/40 hover:text-amber/60 transition-colors">
                        <span className="w-16 shrink-0">{new Date(pt.time * 1000).toLocaleTimeString()}</span>
                        <span className="w-14 text-right" style={{ color: altColor(pt.baro_altitude) }}>
                          {formatAlt(pt.baro_altitude)}
                        </span>
                        <span>{pt.latitude?.toFixed(3) ?? '—'}, {pt.longitude?.toFixed(3) ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[8px] font-mono text-amber/20 py-2">
                    No track data — OpenSky track API requires recent flight activity
                  </p>
                )}
              </div>

              {(selectedFlight.squawk === '7700' || selectedFlight.squawk === '7600' || selectedFlight.squawk === '7500') && (
                <div className="bg-red-900/30 border border-red-500/40 p-3 animate-pulse">
                  <div className="text-[9px] font-mono text-red-400 font-bold tracking-wider">
                    ⚠ EMERGENCY SQUAWK — {selectedFlight.squawk}
                  </div>
                  <div className="text-[8px] font-mono text-red-400/60 mt-1">
                    {selectedFlight.squawk === '7700' && 'GENERAL EMERGENCY — MAYDAY'}
                    {selectedFlight.squawk === '7600' && 'RADIO FAILURE — NORDO'}
                    {selectedFlight.squawk === '7500' && 'UNLAWFUL INTERFERENCE — ALERT AUTHORITIES'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */
function DataCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] text-amber/25 tracking-wider">{label}</span>
      <span className={clsx('text-[11px]', highlight ? 'text-red-400 font-bold animate-pulse' : 'text-amber/70')}>
        {value}
      </span>
    </div>
  );
}

function AltitudeProfile({ waypoints }: { waypoints: FlightWaypoint[] }) {
  const pts = waypoints.filter(w => w.baro_altitude != null);
  if (pts.length < 2) return null;

  const maxAlt = Math.max(...pts.map(p => p.baro_altitude!), 1);
  const h = 60;
  const w = 260;
  const dx = w / (pts.length - 1);

  const pathD = pts.map((p, i) => {
    const x = i * dx;
    const y = h - (p.baro_altitude! / maxAlt) * (h - 4);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const fillD = `${pathD} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
      <defs>
        <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#altGrad)" />
      <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
      <text x="2" y="10" fill="#f0a030" opacity="0.4" fontSize="8" fontFamily="monospace">
        {formatAlt(maxAlt)}
      </text>
    </svg>
  );
}
