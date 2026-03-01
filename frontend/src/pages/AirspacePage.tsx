import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plane, RefreshCw, Filter, MapPin, ArrowUp, ArrowDown,
  Minus, Radio, Layers, Clock, Globe, Wifi,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  fetchAirTraffic,
  fetchFlightTrack,
  type FlightVector,
  type FlightWaypoint,
} from '../services/advancedLayers';

/* ---- Helpers ---- */
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

/* ---- Regions for quick filter ---- */
const REGIONS: Record<string, { lamin: number; lomin: number; lamax: number; lomax: number; label: string }> = {
  world: { lamin: -90, lomin: -180, lamax: 90, lomax: 180, label: 'GLOBAL' },
  us: { lamin: 24, lomin: -125, lamax: 50, lomax: -66, label: 'USA' },
  europe: { lamin: 35, lomin: -10, lamax: 72, lomax: 40, label: 'EUROPE' },
  asia: { lamin: 10, lomin: 60, lamax: 55, lomax: 150, label: 'ASIA-PAC' },
  mideast: { lamin: 12, lomin: 25, lamax: 42, lomax: 65, label: 'MIDEAST' },
};

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function AirspacePage() {
  const [flights, setFlights] = useState<FlightVector[]>([]);
  const [filtered, setFiltered] = useState<FlightVector[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [region, setRegion] = useState('world');
  const [search, setSearch] = useState('');
  const [selectedFlight, setSelectedFlight] = useState<FlightVector | null>(null);
  const [trackPoints, setTrackPoints] = useState<FlightWaypoint[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState({ total: 0, airborne: 0, ground: 0, countries: 0 });
  const intervalRef = useRef<number | null>(null);

  const doFetch = useCallback(async () => {
    setLoading(true);
    try {
      const bounds = region === 'world' ? undefined : REGIONS[region];
      const data = await fetchAirTraffic(bounds ? { bounds } : undefined);
      setFlights(data);
      setLastUpdate(new Date());

      const airborne = data.filter(f => !f.on_ground).length;
      const countries = new Set(data.map(f => f.origin_country)).size;
      setStats({ total: data.length, airborne, ground: data.length - airborne, countries });
    } catch { /* handled in fetcher */ }
    setLoading(false);
  }, [region]);

  // Initial + interval fetch
  useEffect(() => {
    doFetch();
    if (autoRefresh) {
      intervalRef.current = window.setInterval(doFetch, REFRESH_INTERVAL);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [doFetch, autoRefresh]);

  // Filter by search
  useEffect(() => {
    if (!search) { setFiltered(flights); return; }
    const q = search.toLowerCase();
    setFiltered(flights.filter(f =>
      f.callsign?.toLowerCase().includes(q) ||
      f.icao24.toLowerCase().includes(q) ||
      f.origin_country.toLowerCase().includes(q)
    ));
  }, [flights, search]);

  // Fetch track when flight selected
  useEffect(() => {
    if (!selectedFlight) { setTrackPoints([]); return; }
    fetchFlightTrack(selectedFlight.icao24).then(setTrackPoints).catch(() => setTrackPoints([]));
  }, [selectedFlight]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* Header */}
      <div className="border-b border-amber/10 bg-surface px-4 py-3">
        <div className="flex items-center justify-between mb-3">
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
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={clsx(
                'px-2 py-1 text-[8px] font-mono tracking-wider border transition-colors',
                autoRefresh
                  ? 'border-tactical-green/30 text-tactical-green bg-tactical-green/10'
                  : 'border-red-500/30 text-red-400 bg-red-500/10'
              )}
            >
              {autoRefresh ? '● LIVE 30s' : '○ PAUSED'}
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

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-4 text-[9px] font-mono">
            <span className="text-amber/40">
              <Globe className="h-3 w-3 inline mr-1" />{stats.airborne} AIRBORNE
            </span>
            <span className="text-amber/40">
              <MapPin className="h-3 w-3 inline mr-1" />{stats.ground} GROUND
            </span>
            <span className="text-amber/40">
              <Layers className="h-3 w-3 inline mr-1" />{stats.countries} COUNTRIES
            </span>
            {lastUpdate && (
              <span className="text-amber/30">
                <Clock className="h-3 w-3 inline mr-1" />{lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Region + Search */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-amber/20 divide-x divide-amber/20">
            {Object.entries(REGIONS).map(([key, r]) => (
              <button
                key={key}
                onClick={() => setRegion(key)}
                className={clsx(
                  'px-2 py-1 text-[8px] font-mono tracking-wider transition-colors',
                  region === key
                    ? 'bg-amber/15 text-amber'
                    : 'text-amber/30 hover:text-amber/50'
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
              className="w-full bg-surface border border-amber/20 pl-7 pr-3 py-1.5 text-[10px] font-mono text-amber placeholder:text-amber/20 focus:outline-none focus:border-amber/40"
            />
          </div>
        </div>
      </div>

      {/* Content: Table + Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Flight list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <table className="w-full text-[10px] font-mono">
            <thead className="sticky top-0 bg-surface border-b border-amber/10">
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
              {filtered.map((f) => (
                <tr
                  key={f.icao24}
                  onClick={() => setSelectedFlight(f)}
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
                    {f.squawk === '7700' ? (
                      <span className="text-red-400 animate-pulse font-bold">7700</span>
                    ) : f.squawk === '7600' ? (
                      <span className="text-orange-400 font-bold">7600</span>
                    ) : f.squawk === '7500' ? (
                      <span className="text-red-500 animate-pulse font-bold">7500</span>
                    ) : (
                      <span className="text-amber/30">{f.squawk ?? '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Flight detail panel */}
        {selectedFlight && (
          <div className="w-80 border-l border-amber/10 bg-surface overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-display tracking-wider text-amber text-glow-amber">
                  {selectedFlight.callsign || selectedFlight.icao24}
                </h3>
                <button
                  onClick={() => setSelectedFlight(null)}
                  className="text-amber/30 hover:text-amber text-[10px] font-mono"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-[10px] font-mono">
                <DetailRow label="ICAO24" value={selectedFlight.icao24} />
                <DetailRow label="CALLSIGN" value={selectedFlight.callsign ?? '—'} />
                <DetailRow label="ORIGIN" value={selectedFlight.origin_country} />
                <DetailRow label="CATEGORY" value={categoryLabel(selectedFlight.category)} />
                <DetailRow label="SQUAWK" value={selectedFlight.squawk ?? '—'} highlight={
                  selectedFlight.squawk === '7700' || selectedFlight.squawk === '7500'
                } />

                <div className="border-t border-amber/10 pt-2 mt-2" />
                <DetailRow label="ALTITUDE (BARO)" value={formatAlt(selectedFlight.baro_altitude)} />
                <DetailRow label="ALTITUDE (GEO)" value={formatAlt(selectedFlight.geo_altitude)} />
                <DetailRow label="GROUND SPEED" value={formatSpeed(selectedFlight.velocity)} />
                <DetailRow label="HEADING" value={selectedFlight.true_track != null ? `${Math.round(selectedFlight.true_track)}°` : '—'} />
                <DetailRow label="VERTICAL RATE" value={
                  selectedFlight.vertical_rate != null
                    ? `${selectedFlight.vertical_rate > 0 ? '+' : ''}${Math.round(selectedFlight.vertical_rate * 196.85)} ft/min`
                    : '—'
                } />
                <DetailRow label="ON GROUND" value={selectedFlight.on_ground ? 'YES' : 'NO'} />

                <div className="border-t border-amber/10 pt-2 mt-2" />
                <DetailRow label="LATITUDE" value={selectedFlight.latitude?.toFixed(4) ?? '—'} />
                <DetailRow label="LONGITUDE" value={selectedFlight.longitude?.toFixed(4) ?? '—'} />
              </div>

              {/* Track history */}
              {trackPoints.length > 0 && (
                <div className="border-t border-amber/10 pt-3">
                  <h4 className="text-[9px] font-mono text-amber/40 tracking-wider mb-2 flex items-center gap-1.5">
                    <Radio className="h-3 w-3" /> FLIGHT TRACK ({trackPoints.length} WAYPOINTS)
                  </h4>
                  <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-1">
                    {trackPoints.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2 text-[8px] font-mono text-amber/40">
                        <span className="w-14">{new Date(pt.time * 1000).toLocaleTimeString()}</span>
                        <span className="w-16">{formatAlt(pt.baro_altitude)}</span>
                        <span>{pt.latitude?.toFixed(2) ?? '—'}, {pt.longitude?.toFixed(2) ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency squawk alert */}
              {(selectedFlight.squawk === '7700' || selectedFlight.squawk === '7600' || selectedFlight.squawk === '7500') && (
                <div className="bg-red-900/30 border border-red-500/40 p-3">
                  <div className="text-[9px] font-mono text-red-400 font-bold tracking-wider animate-pulse">
                    ⚠ EMERGENCY SQUAWK DETECTED
                  </div>
                  <div className="text-[8px] font-mono text-red-400/60 mt-1">
                    {selectedFlight.squawk === '7700' && 'GENERAL EMERGENCY'}
                    {selectedFlight.squawk === '7600' && 'COMMUNICATION FAILURE'}
                    {selectedFlight.squawk === '7500' && 'HIJACK CODE — REPORT IMMEDIATELY'}
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

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-amber/30">{label}</span>
      <span className={clsx(highlight ? 'text-red-400 font-bold' : 'text-amber/70')}>{value}</span>
    </div>
  );
}
