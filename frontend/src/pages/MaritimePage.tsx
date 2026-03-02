import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Ship, RefreshCw, List, Map as MapIcon,
  Search, Filter, ChevronDown, ChevronUp,
  Crosshair, Wifi,
} from 'lucide-react';
import {
  fetchMaritimeVessels,
  getWeatherTileLayers,
  getSatelliteTileLayers,
  type Vessel,
  type WeatherTileLayer,
  type SatelliteTileLayer,
} from '../services/advancedLayers';
import 'leaflet/dist/leaflet.css';

/* ---- Icon cache ---- */
const _iconCache = new Map<string, L.DivIcon>();
function cachedIcon(key: string, factory: () => L.DivIcon): L.DivIcon {
  let icon = _iconCache.get(key);
  if (!icon) { icon = factory(); _iconCache.set(key, icon); }
  return icon;
}

const SHIP_TYPE_COLORS: Record<number, string> = {
  3: '#22d3ee',  // Fishing
  4: '#67e8f9',  // HSC
  5: '#fbbf24',  // Pilot/SAR/Tug
  6: '#a78bfa',  // Passenger
  7: '#34d399',  // Cargo
  8: '#f97316',  // Tanker
  9: '#94a3b8',  // Other
};

function vesselMapIcon(heading: number | null, shipType: number, _speed: number | null, isSelected: boolean) {
  const rotBucket = Math.round((heading ?? 0) / 15) * 15;
  const typeBucket = Math.floor(shipType / 10);
  const selKey = isSelected ? 'sel' : 'def';
  return cachedIcon(`vm_${rotBucket}_${typeBucket}_${selKey}`, () => {
    const color = SHIP_TYPE_COLORS[typeBucket] ?? '#94a3b8';
    const size = isSelected ? 18 : 12;
    const glow = isSelected ? `filter:drop-shadow(0 0 6px ${color});` : '';
    return L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;transform:rotate(${rotBucket}deg);${glow}">
        <svg viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}">
          <path d="M12 2L4 22l8-4 8 4L12 2z"/>
        </svg>
      </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  });
}

/* ---- Map follow controller ---- */
function MapFollow({ vessel, follow }: { vessel: Vessel | null; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (follow && vessel) {
      map.flyTo([vessel.latitude, vessel.longitude], Math.max(map.getZoom(), 8), { duration: 1 });
    }
  }, [follow, vessel, map]);
  return null;
}

/* ---- Vessel detail panel ---- */
function VesselDetailPanel({ vessel, onClose }: { vessel: Vessel; onClose: () => void }) {
  return (
    <div className="hud-border bg-surface-card/95 backdrop-blur-sm p-3 space-y-2 max-w-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-display tracking-[0.15em] text-cyan-400 uppercase">
          VESSEL DETAIL
        </span>
        <button onClick={onClose} className="text-gray-600 hover:text-amber text-[10px] font-mono">✕</button>
      </div>

      <div className="space-y-1.5 text-[10px] font-mono">
        <div className="flex justify-between">
          <span className="text-gray-500">NAME</span>
          <span className="text-cyan-300">{vessel.name ?? 'UNKNOWN'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">MMSI</span>
          <span className="text-amber/80">{vessel.mmsi}</span>
        </div>
        {vessel.imo && (
          <div className="flex justify-between">
            <span className="text-gray-500">IMO</span>
            <span className="text-amber/80">{vessel.imo}</span>
          </div>
        )}
        {vessel.callsign && (
          <div className="flex justify-between">
            <span className="text-gray-500">CALLSIGN</span>
            <span className="text-amber/80">{vessel.callsign}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">TYPE</span>
          <span className="text-emerald-400">{vessel.shipTypeName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">FLAG</span>
          <span className="text-amber/80">{vessel.flag || '—'}</span>
        </div>

        <div className="border-t border-amber/10 my-1" />

        <div className="flex justify-between">
          <span className="text-gray-500">SPEED</span>
          <span className="text-cyan-300">{vessel.speed != null ? `${vessel.speed} kts` : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">COURSE</span>
          <span className="text-amber/80">{vessel.course != null ? `${vessel.course}°` : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">HEADING</span>
          <span className="text-amber/80">{vessel.heading != null ? `${vessel.heading}°` : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">NAV STATUS</span>
          <span className="text-yellow-400">{vessel.navStatus}</span>
        </div>

        <div className="border-t border-amber/10 my-1" />

        {vessel.destination && (
          <div className="flex justify-between">
            <span className="text-gray-500">DESTINATION</span>
            <span className="text-emerald-300">{vessel.destination}</span>
          </div>
        )}
        {vessel.draught != null && (
          <div className="flex justify-between">
            <span className="text-gray-500">DRAUGHT</span>
            <span className="text-amber/80">{vessel.draught}m</span>
          </div>
        )}
        {vessel.length != null && vessel.width != null && (
          <div className="flex justify-between">
            <span className="text-gray-500">SIZE</span>
            <span className="text-amber/80">{vessel.length}m × {vessel.width}m</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">LAST UPDATE</span>
          <span className="text-gray-600">{new Date(vessel.lastUpdate).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Type color legend dot */}
      <div className="flex items-center gap-2 pt-1">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: SHIP_TYPE_COLORS[Math.floor(vessel.shipType / 10)] ?? '#94a3b8' }}
        />
        <span className="text-[9px] font-mono text-gray-500">{vessel.shipTypeName}</span>
      </div>
    </div>
  );
}

/* ---- Overlay selector for weather/sat tiles ---- */
function OverlaySelector({
  weatherLayers,
  satelliteLayers,
  activeOverlay,
  onSelect,
}: {
  weatherLayers: WeatherTileLayer[];
  satelliteLayers: SatelliteTileLayer[];
  activeOverlay: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="hud-border bg-surface-card/95 backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 w-full text-left"
      >
        <span className="text-[10px] font-display tracking-[0.15em] text-amber/70 uppercase flex-1">
          OVERLAYS {activeOverlay ? '· 1 ACTIVE' : ''}
        </span>
        {open ? <ChevronUp className="h-3 w-3 text-amber/40" /> : <ChevronDown className="h-3 w-3 text-amber/40" />}
      </button>

      {open && (
        <div className="px-2 pb-2 space-y-1">
          <div className="text-[8px] font-mono text-amber/30 tracking-wider uppercase px-1 pt-1">
            WEATHER
          </div>
          {weatherLayers.map(l => (
            <button
              key={l.id}
              onClick={() => onSelect(activeOverlay === l.id ? null : l.id)}
              className={`w-full text-left px-2 py-1 text-[10px] font-mono border transition-all ${
                activeOverlay === l.id
                  ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              {l.label}
            </button>
          ))}

          <div className="text-[8px] font-mono text-amber/30 tracking-wider uppercase px-1 pt-2">
            SATELLITE
          </div>
          {satelliteLayers.map(l => (
            <button
              key={l.id}
              onClick={() => onSelect(activeOverlay === l.id ? null : l.id)}
              className={`w-full text-left px-2 py-1 text-[10px] font-mono border transition-all ${
                activeOverlay === l.id
                  ? 'border-lime-400/30 bg-lime-400/10 text-lime-300'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              {l.label}
            </button>
          ))}

          {activeOverlay && (
            <button
              onClick={() => onSelect(null)}
              className="w-full text-center px-2 py-1 text-[10px] font-mono text-red-400/60 hover:text-red-400 border border-red-400/20 mt-1"
            >
              CLEAR OVERLAY
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Tile overlay controller ---- */
function TileOverlayController({ overlayId }: { overlayId: string | null }) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    // Remove old
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!overlayId) return;

    // Find in weather or satellite
    const wxLayers = getWeatherTileLayers();
    const satLayers = getSatelliteTileLayers();
    const wx = wxLayers.find(l => l.id === overlayId);
    const sat = satLayers.find(l => l.id === overlayId);
    const cfg = wx ?? sat;
    if (!cfg) return;

    layerRef.current = L.tileLayer(cfg.urlTemplate, {
      opacity: cfg.opacity,
      attribution: cfg.attribution,
      maxZoom: 'maxZoom' in cfg ? (cfg as SatelliteTileLayer).maxZoom : 18,
    }).addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [overlayId, map]);

  return null;
}

/* ---- Main page ---- */
type ViewMode = 'map' | 'table';
type ShipFilter = 'all' | 'cargo' | 'tanker' | 'passenger' | 'fishing' | 'military';

const SHIP_FILTERS: { key: ShipFilter; label: string; types: number[] }[] = [
  { key: 'all', label: 'All Vessels', types: [] },
  { key: 'cargo', label: 'Cargo', types: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79] },
  { key: 'tanker', label: 'Tankers', types: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89] },
  { key: 'passenger', label: 'Passenger', types: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69] },
  { key: 'fishing', label: 'Fishing', types: [30] },
  { key: 'military', label: 'Military', types: [35] },
];

export function MaritimePage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [follow, setFollow] = useState(false);
  const [view, setView] = useState<ViewMode>('map');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [shipFilter, setShipFilter] = useState<ShipFilter>('all');
  const [overlayId, setOverlayId] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval>>();

  const weatherLayers = useMemo(() => getWeatherTileLayers(), []);
  const satelliteLayers = useMemo(() => getSatelliteTileLayers(), []);

  const loadVessels = useCallback(async () => {
    try {
      const data = await fetchMaritimeVessels();
      setVessels(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVessels();
    refreshTimerRef.current = setInterval(loadVessels, 60_000); // refresh every 60s
    return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current); };
  }, [loadVessels]);

  const filteredVessels = useMemo(() => {
    let list = vessels;
    // Ship type filter
    if (shipFilter !== 'all') {
      const types = SHIP_FILTERS.find(f => f.key === shipFilter)?.types ?? [];
      list = list.filter(v => types.includes(v.shipType));
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v =>
        (v.name?.toLowerCase().includes(q)) ||
        v.mmsi.includes(q) ||
        (v.callsign?.toLowerCase().includes(q)) ||
        (v.destination?.toLowerCase().includes(q)) ||
        v.flag.toLowerCase().includes(q)
      );
    }
    return list;
  }, [vessels, shipFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const moving = vessels.filter(v => (v.speed ?? 0) > 0.5).length;
    const anchored = vessels.filter(v => v.navStatus === 'At anchor' || v.navStatus === 'Moored').length;
    const cargo = vessels.filter(v => Math.floor(v.shipType / 10) === 7).length;
    const tanker = vessels.filter(v => Math.floor(v.shipType / 10) === 8).length;
    return { total: vessels.length, moving, anchored, cargo, tanker };
  }, [vessels]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* Top bar */}
      <div className="border-b border-amber/10 bg-surface px-4 py-2 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ship className="h-4 w-4 text-cyan-400" />
            <h1 className="text-[12px] font-display tracking-[0.15em] text-amber uppercase text-glow-amber">
              MARITIME INTELLIGENCE
            </h1>
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-tactical-green/60" />
              <span className="text-[9px] font-mono text-tactical-green/50 tracking-wider">
                LIVE · {vessels.length} VESSELS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border border-amber/20 divide-x divide-amber/20">
              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                  view === 'map' ? 'bg-amber/15 text-amber' : 'text-amber/30 hover:text-amber/50'
                }`}
              >
                <MapIcon className="h-3 w-3" /> MAP
              </button>
              <button
                onClick={() => setView('table')}
                className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                  view === 'table' ? 'bg-amber/15 text-amber' : 'text-amber/30 hover:text-amber/50'
                }`}
              >
                <List className="h-3 w-3" /> TABLE
              </button>
            </div>

            <button
              onClick={loadVessels}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-mono text-amber/40 hover:text-amber border border-amber/20 uppercase tracking-wider"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> REFRESH
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-amber/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vessel name, MMSI, callsign..."
              className="w-full pl-7 pr-2 py-1 bg-surface border border-amber/15 text-[10px] font-mono text-amber/80 placeholder:text-amber/20 focus:outline-none focus:border-amber/40"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-3 w-3 text-amber/30" />
            {SHIP_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setShipFilter(f.key)}
                className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border transition-all ${
                  shipFilter === f.key
                    ? 'border-amber/30 bg-amber/10 text-amber'
                    : 'border-transparent text-gray-600 hover:text-amber/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-4 mt-2 text-[9px] font-mono">
          <span className="text-gray-500">TOTAL: <span className="text-cyan-400">{stats.total}</span></span>
          <span className="text-gray-500">MOVING: <span className="text-tactical-green">{stats.moving}</span></span>
          <span className="text-gray-500">ANCHORED: <span className="text-yellow-400">{stats.anchored}</span></span>
          <span className="text-gray-500">CARGO: <span className="text-emerald-400">{stats.cargo}</span></span>
          <span className="text-gray-500">TANKER: <span className="text-orange-400">{stats.tanker}</span></span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {view === 'map' ? (
          <>
            <MapContainer
              center={[20, 0]}
              zoom={3}
              style={{ height: '100%', width: '100%', background: '#080e1a' }}
              scrollWheelZoom
              zoomControl
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              <TileOverlayController overlayId={overlayId} />
              <MapFollow vessel={selected} follow={follow} />

              {filteredVessels.map((v, i) => (
                <Marker
                  key={`v-${v.mmsi}-${i}`}
                  position={[v.latitude, v.longitude]}
                  icon={vesselMapIcon(v.heading, v.shipType, v.speed, selected?.mmsi === v.mmsi)}
                  eventHandlers={{
                    click: () => { setSelected(v); setFollow(false); },
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px] text-[11px] font-mono">
                      <p className="font-bold text-cyan-400 mb-1">🚢 {v.name ?? v.mmsi}</p>
                      <p className="text-amber/70">{v.shipTypeName} · {v.flag}</p>
                      <p className="text-amber/50 mt-1">
                        {v.speed != null ? `${v.speed} kts` : '—'}
                        {v.course != null ? ` · COG ${v.course}°` : ''}
                      </p>
                      {v.destination && <p className="text-amber/30 mt-0.5">→ {v.destination}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Shipping lane indicators — dashed lines for major routes */}
            </MapContainer>

            {/* Overlay panel — top right */}
            <div className="absolute top-4 right-4 z-[1000] w-48">
              <OverlaySelector
                weatherLayers={weatherLayers}
                satelliteLayers={satelliteLayers}
                activeOverlay={overlayId}
                onSelect={setOverlayId}
              />
            </div>

            {/* Vessel detail — bottom left */}
            {selected && (
              <div className="absolute bottom-4 left-4 z-[1000]">
                <VesselDetailPanel vessel={selected} onClose={() => setSelected(null)} />
              </div>
            )}

            {/* Vessel type legend */}
            <div className="absolute top-4 left-4 z-[1000] hud-border bg-surface-card/90 backdrop-blur-sm p-2 space-y-1">
              <span className="text-[9px] font-display tracking-[0.15em] text-amber/50 uppercase">
                VESSEL TYPES
              </span>
              {Object.entries(SHIP_TYPE_COLORS).map(([key, color]) => {
                const labels: Record<string, string> = {
                  '3': 'Fishing', '4': 'HSC', '5': 'Pilot/SAR/Tug',
                  '6': 'Passenger', '7': 'Cargo', '8': 'Tanker', '9': 'Other',
                };
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[9px] font-mono text-gray-500">{labels[key] ?? 'Unknown'}</span>
                  </div>
                );
              })}
            </div>

            {/* Follow button */}
            {selected && (
              <div className="absolute bottom-4 right-4 z-[1000]">
                <button
                  onClick={() => setFollow(!follow)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-all ${
                    follow
                      ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
                      : 'border-amber/20 text-amber/40 hover:text-amber/60'
                  }`}
                >
                  <Crosshair className="h-3 w-3" />
                  {follow ? 'TRACKING' : 'FOLLOW'}
                </button>
              </div>
            )}

            {/* Status bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm px-3 py-1.5 flex items-center justify-between z-[999]">
              <span className="text-[10px] text-amber/50 font-mono">
                {filteredVessels.length} VESSELS DISPLAYED
                {overlayId ? ` · OVERLAY: ${overlayId.toUpperCase()}` : ''}
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                {Object.entries(SHIP_TYPE_COLORS).slice(0, 5).map(([key, color]) => {
                  const labels: Record<string, string> = {
                    '3': 'FISH', '6': 'PAX', '7': 'CARGO', '8': 'TANK', '9': 'OTHER',
                  };
                  if (!labels[key]) return null;
                  return (
                    <span key={key} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      <span style={{ color }}>{labels[key]}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Table view */
          <div className="overflow-auto h-full">
            <table className="w-full text-[10px] font-mono">
              <thead className="bg-surface-card sticky top-0 z-10">
                <tr className="text-left text-amber/50 tracking-wider uppercase">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">MMSI</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Flag</th>
                  <th className="px-3 py-2">Speed</th>
                  <th className="px-3 py-2">Course</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Destination</th>
                  <th className="px-3 py-2">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber/5">
                {filteredVessels.map((v, i) => {
                  const typeColor = SHIP_TYPE_COLORS[Math.floor(v.shipType / 10)] ?? '#94a3b8';
                  const isSelected = selected?.mmsi === v.mmsi;
                  return (
                    <tr
                      key={`${v.mmsi}-${i}`}
                      onClick={() => { setSelected(v); setView('map'); setFollow(true); }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-400/10 border-l-2 border-cyan-400'
                          : 'hover:bg-amber/5'
                      }`}
                    >
                      <td className="px-3 py-1.5 text-cyan-300">{v.name ?? '—'}</td>
                      <td className="px-3 py-1.5 text-amber/60">{v.mmsi}</td>
                      <td className="px-3 py-1.5" style={{ color: typeColor }}>{v.shipTypeName}</td>
                      <td className="px-3 py-1.5 text-amber/60">{v.flag || '—'}</td>
                      <td className="px-3 py-1.5 text-tactical-green">
                        {v.speed != null ? `${v.speed} kts` : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-amber/60">
                        {v.course != null ? `${v.course}°` : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-yellow-400/70">{v.navStatus}</td>
                      <td className="px-3 py-1.5 text-emerald-400/60">{v.destination ?? '—'}</td>
                      <td className="px-3 py-1.5 text-gray-600">
                        {new Date(v.lastUpdate).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
