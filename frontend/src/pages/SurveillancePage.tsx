import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Satellite, Flame, Sun, Globe, RefreshCw,
  Radio, Shield, AlertTriangle, ExternalLink, Wifi, Clock,
  Telescope, Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  fetchNasaEvents,
  fetchSpaceWeather,
  fetchFireHotspots,
  fetchAPOD,
  fetchEpicImages,
  fetchNearEarthObjects,
  getPublicWebcams,
  type NasaEvent,
  type SpaceWeatherEvent,
  type FireHotspot,
  type NasaAPOD,
  type EpicImage,
  type NearEarthObject,
  type PublicWebcam,
} from '../services/advancedLayers';

type Tab = 'cameras' | 'nasa' | 'space' | 'fires' | 'neo';

const REFRESH_INTERVAL = 60_000; // 60 seconds

export function SurveillancePage() {
  const [tab, setTab] = useState<Tab>('cameras');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<number | null>(null);

  // Data
  const [webcams] = useState<PublicWebcam[]>(getPublicWebcams());
  const [nasaEvents, setNasaEvents] = useState<NasaEvent[]>([]);
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherEvent[]>([]);
  const [fireHotspots, setFireHotspots] = useState<FireHotspot[]>([]);
  const [apod, setApod] = useState<NasaAPOD | null>(null);
  const [epicImages, setEpicImages] = useState<EpicImage[]>([]);
  const [neos, setNeos] = useState<NearEarthObject[]>([]);
  const [activeCamera, setActiveCamera] = useState<PublicWebcam | null>(null);

  const doFetch = useCallback(async () => {
    setLoading(true);
    try {
      const [evts, sw, fires, apodData, epic, neoData] = await Promise.allSettled([
        fetchNasaEvents({ days: 30, limit: 50 }),
        fetchSpaceWeather(30),
        fetchFireHotspots({ days: 1 }),
        fetchAPOD(),
        fetchEpicImages(8),
        fetchNearEarthObjects(),
      ]);
      if (evts.status === 'fulfilled') setNasaEvents(evts.value);
      if (sw.status === 'fulfilled') setSpaceWeather(sw.value);
      if (fires.status === 'fulfilled') setFireHotspots(fires.value);
      if (apodData.status === 'fulfilled') setApod(apodData.value);
      if (epic.status === 'fulfilled') setEpicImages(epic.value);
      if (neoData.status === 'fulfilled') setNeos(neoData.value);
      setLastUpdate(new Date());
    } catch { /* errors handled in fetchers */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    doFetch();
    if (autoRefresh) {
      intervalRef.current = window.setInterval(doFetch, REFRESH_INTERVAL);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [doFetch, autoRefresh]);

  const tabs: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'cameras', label: 'LIVE CAMERAS', icon: Camera, count: webcams.length },
    { key: 'nasa', label: 'NASA EONET', icon: Satellite, count: nasaEvents.length },
    { key: 'space', label: 'SPACE WEATHER', icon: Sun, count: spaceWeather.length },
    { key: 'fires', label: 'FIRE HOTSPOTS', icon: Flame, count: fireHotspots.length },
    { key: 'neo', label: 'NEO TRACKING', icon: Telescope, count: neos.length },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface">
      {/* Header */}
      <div className="border-b border-amber/10 bg-surface px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-amber" />
            <h1 className="text-[12px] font-display tracking-[0.15em] text-amber uppercase text-glow-amber">
              SURVEILLANCE & MONITORING
            </h1>
            <div className="flex items-center gap-1.5">
              <Wifi className={clsx('h-3 w-3', autoRefresh ? 'text-tactical-green animate-pulse' : 'text-red-400')} />
              <span className="text-[9px] font-mono text-tactical-green/50 tracking-wider">
                {autoRefresh ? 'LIVE 60s' : 'PAUSED'}
              </span>
              {lastUpdate && (
                <span className="text-[8px] font-mono text-amber/30 ml-2">
                  <Clock className="h-3 w-3 inline mr-0.5" />
                  {lastUpdate.toLocaleTimeString()}
                </span>
              )}
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
              {autoRefresh ? '● AUTO' : '○ MANUAL'}
            </button>
            <button
              onClick={doFetch}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1 text-[9px] font-mono text-amber/50 border border-amber/20 hover:bg-amber/10"
            >
              <RefreshCw className={clsx('h-3 w-3', loading && 'animate-spin')} />
              SCAN
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border border-amber/20 divide-x divide-amber/20">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono tracking-wider transition-colors',
                tab === key
                  ? 'bg-amber/15 text-amber'
                  : 'text-amber/30 hover:text-amber/50'
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
              <span className={clsx(
                'px-1 py-0.5 text-[7px] rounded',
                tab === key ? 'bg-amber/20 text-amber' : 'bg-amber/5 text-amber/30'
              )}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {tab === 'cameras' && <CamerasTab webcams={webcams} active={activeCamera} onSelect={setActiveCamera} apod={apod} epicImages={epicImages} />}
        {tab === 'nasa' && <NasaTab events={nasaEvents} loading={loading} />}
        {tab === 'space' && <SpaceWeatherTab events={spaceWeather} loading={loading} />}
        {tab === 'fires' && <FiresTab hotspots={fireHotspots} loading={loading} />}
        {tab === 'neo' && <NeoTab objects={neos} loading={loading} />}
      </div>
    </div>
  );
}

/* ================================================================
   📷 CAMERAS TAB
   ================================================================ */
function CamerasTab({ webcams, active, onSelect, apod, epicImages }: {
  webcams: PublicWebcam[];
  active: PublicWebcam | null;
  onSelect: (cam: PublicWebcam | null) => void;
  apod: NasaAPOD | null;
  epicImages: EpicImage[];
}) {
  return (
    <div className="space-y-6">
      {/* Active camera viewer */}
      {active && active.streamUrl && (
        <div className="border border-amber/20 bg-black">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-amber/10 bg-surface">
            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-red-400 animate-pulse" />
              <span className="text-[10px] font-mono text-amber tracking-wider">{active.title}</span>
            </div>
            <button onClick={() => onSelect(null)} className="text-amber/30 hover:text-amber text-[10px] font-mono">✕</button>
          </div>
          <div className="aspect-video">
            <iframe
              src={active.streamUrl}
              title={active.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Camera grid */}
      <div>
        <h3 className="text-[10px] font-mono text-amber/40 tracking-wider mb-3 flex items-center gap-2">
          <Camera className="h-3 w-3" /> GLOBAL LIVE FEEDS ({webcams.length})
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {webcams.map((cam) => (
            <button
              key={cam.id}
              onClick={() => onSelect(cam.streamUrl ? cam : null)}
              className={clsx(
                'border border-amber/15 bg-black/50 hover:border-amber/30 transition-colors text-left group',
                active?.id === cam.id && 'border-amber/50 ring-1 ring-amber/20'
              )}
            >
              <div className="aspect-video bg-gray-900 relative overflow-hidden">
                <img
                  src={cam.thumbnailUrl}
                  alt={cam.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/70 px-1.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[7px] font-mono text-red-400 tracking-wider">LIVE</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="text-[9px] font-mono text-white/90">{cam.title}</div>
                  <div className="text-[7px] font-mono text-white/50">{cam.location} · {cam.source}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* NASA EPIC — Earth from Space */}
      {epicImages.length > 0 && (
        <div>
          <h3 className="text-[10px] font-mono text-amber/40 tracking-wider mb-3 flex items-center gap-2">
            <Globe className="h-3 w-3" /> NASA DSCOVR EPIC — EARTH FROM 1.5M KM
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {epicImages.map((img) => (
              <div key={img.identifier} className="border border-amber/15 bg-black/50">
                <div className="aspect-square bg-gray-900 relative overflow-hidden">
                  <img
                    src={img.imageUrl}
                    alt={img.caption}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="text-[7px] font-mono text-white/60">{img.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NASA APOD */}
      {apod && (
        <div>
          <h3 className="text-[10px] font-mono text-amber/40 tracking-wider mb-3 flex items-center gap-2">
            <Satellite className="h-3 w-3" /> NASA ASTRONOMY PICTURE OF THE DAY
          </h3>
          <div className="border border-amber/15 bg-black/50 flex flex-col md:flex-row">
            {apod.media_type === 'image' ? (
              <img src={apod.url} alt={apod.title} className="md:w-1/2 object-cover max-h-64" loading="lazy" />
            ) : (
              <iframe src={apod.url} title={apod.title} className="md:w-1/2 aspect-video" allowFullScreen />
            )}
            <div className="p-4 flex-1">
              <h4 className="text-[11px] font-display text-amber tracking-wider mb-2">{apod.title}</h4>
              <p className="text-[9px] font-mono text-amber/50 leading-relaxed line-clamp-6">{apod.explanation}</p>
              <div className="mt-2 text-[8px] font-mono text-amber/30">
                {apod.date} {apod.copyright ? `· © ${apod.copyright}` : ''}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   🛰️ NASA EVENTS TAB
   ================================================================ */
function NasaTab({ events, loading }: { events: NasaEvent[]; loading: boolean }) {
  const catColors: Record<string, string> = {
    'Wildfires': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    'Severe Storms': 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    'Volcanoes': 'text-red-400 border-red-400/30 bg-red-400/10',
    'Sea and Lake Ice': 'text-cyan-300 border-cyan-300/30 bg-cyan-300/10',
    'Floods': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    'Earthquakes': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    'Landslides': 'text-amber border-amber/30 bg-amber/10',
  };

  if (loading && events.length === 0) return <LoadingState label="Querying NASA EONET…" />;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-mono text-amber/40">
          {events.length} events · Last 30 days · NASA Earth Observatory
        </span>
      </div>
      {events.map((ev) => (
        <div key={ev.id} className="border border-amber/10 p-3 hover:border-amber/20 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={clsx(
                  'px-1.5 py-0.5 text-[7px] font-mono tracking-wider border',
                  catColors[ev.category] ?? 'text-amber/50 border-amber/20 bg-amber/5',
                )}>
                  {ev.category.toUpperCase()}
                </span>
                {!ev.closed && (
                  <span className="flex items-center gap-1 text-[7px] font-mono text-tactical-green">
                    <span className="h-1 w-1 rounded-full bg-tactical-green animate-pulse" />
                    ACTIVE
                  </span>
                )}
              </div>
              <h4 className="text-[10px] font-mono text-amber/80 mb-1">{ev.title}</h4>
              {ev.description && <p className="text-[8px] font-mono text-amber/40 line-clamp-2">{ev.description}</p>}
              <div className="flex items-center gap-3 mt-1.5 text-[8px] font-mono text-amber/30">
                <span>{new Date(ev.date).toLocaleDateString()}</span>
                {ev.latitude != null && <span>{ev.latitude.toFixed(2)}°, {ev.longitude?.toFixed(2)}°</span>}
                {ev.magnitudeValue != null && <span>Mag: {ev.magnitudeValue} {ev.magnitudeUnit}</span>}
              </div>
            </div>
            <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-amber/20 hover:text-amber">
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   ☀️ SPACE WEATHER TAB
   ================================================================ */
function SpaceWeatherTab({ events, loading }: { events: SpaceWeatherEvent[]; loading: boolean }) {
  const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    FLR: { icon: Sun, color: 'text-yellow-400', label: 'Solar Flare' },
    CME: { icon: Zap, color: 'text-orange-400', label: 'CME' },
    GST: { icon: AlertTriangle, color: 'text-red-400', label: 'Geomagnetic Storm' },
  };

  if (loading && events.length === 0) return <LoadingState label="Querying NASA DONKI…" />;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-mono text-amber/40">
          {events.length} events · NASA DONKI Space Weather Database
        </span>
      </div>
      {events.map((ev) => {
        const config = typeConfig[ev.type] ?? { icon: Sun, color: 'text-amber', label: ev.type };
        const Icon = config.icon;
        return (
          <div key={ev.id} className="border border-amber/10 p-3 hover:border-amber/20 transition-colors">
            <div className="flex items-center gap-3">
              <Icon className={clsx('h-4 w-4', config.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={clsx('text-[8px] font-mono tracking-wider px-1.5 py-0.5 border', config.color, 'border-current/30 bg-current/5')}>
                    {config.label.toUpperCase()}
                  </span>
                  {ev.classType && <span className="text-[9px] font-mono text-amber/60">{ev.classType}</span>}
                </div>
                <h4 className="text-[10px] font-mono text-amber/80 mt-1">{ev.title}</h4>
                <div className="text-[8px] font-mono text-amber/30 mt-0.5">
                  {ev.time ? new Date(ev.time).toLocaleString() : '—'}
                </div>
              </div>
              {ev.link && (
                <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-amber/20 hover:text-amber">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        );
      })}
      {events.length === 0 && !loading && (
        <div className="text-center py-8 text-[10px] font-mono text-amber/30">
          No space weather events in the past 30 days — solar activity is quiet
        </div>
      )}
    </div>
  );
}

/* ================================================================
   🔥 FIRE HOTSPOTS TAB
   ================================================================ */
function FiresTab({ hotspots, loading }: { hotspots: FireHotspot[]; loading: boolean }) {
  if (loading && hotspots.length === 0) return <LoadingState label="Querying NASA FIRMS…" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-mono text-amber/40">
          {hotspots.length} hotspots · Last 24h · NASA FIRMS VIIRS
        </span>
      </div>

      {hotspots.length === 0 && !loading && (
        <div className="text-center py-8 text-[10px] font-mono text-amber/30">
          FIRMS data may be rate-limited. Fire hotspot data refreshes periodically.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[9px] font-mono">
          <thead>
            <tr className="text-amber/40 uppercase tracking-wider border-b border-amber/10">
              <th className="text-left px-2 py-1.5">Lat</th>
              <th className="text-left px-2 py-1.5">Lon</th>
              <th className="text-right px-2 py-1.5">Brightness</th>
              <th className="text-center px-2 py-1.5">Confidence</th>
              <th className="text-right px-2 py-1.5">FRP (MW)</th>
              <th className="text-left px-2 py-1.5">Satellite</th>
              <th className="text-left px-2 py-1.5">Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {hotspots.slice(0, 100).map((h, i) => (
              <tr key={i} className="border-b border-amber/5 text-amber/60 hover:bg-amber/5">
                <td className="px-2 py-1">{h.latitude.toFixed(3)}</td>
                <td className="px-2 py-1">{h.longitude.toFixed(3)}</td>
                <td className="px-2 py-1 text-right">
                  <span className={clsx(
                    h.brightness > 400 ? 'text-red-400' : h.brightness > 350 ? 'text-orange-400' : 'text-amber/60'
                  )}>
                    {h.brightness.toFixed(1)} K
                  </span>
                </td>
                <td className="px-2 py-1 text-center">
                  <span className={clsx(
                    'px-1 py-0.5 text-[7px]',
                    h.confidence === 'high' ? 'text-red-400 bg-red-400/10' :
                    h.confidence === 'nominal' ? 'text-amber/60 bg-amber/5' :
                    'text-amber/30 bg-amber/5'
                  )}>
                    {h.confidence.toUpperCase()}
                  </span>
                </td>
                <td className="px-2 py-1 text-right">{h.frp.toFixed(1)}</td>
                <td className="px-2 py-1 text-amber/40">{h.satellite}</td>
                <td className="px-2 py-1 text-amber/40">{h.acq_date} {h.acq_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================
   ☄️ NEO TRACKING TAB
   ================================================================ */
function NeoTab({ objects, loading }: { objects: NearEarthObject[]; loading: boolean }) {
  if (loading && objects.length === 0) return <LoadingState label="Querying NASA NeoWs…" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-mono text-amber/40">
          {objects.length} objects · Next 7 days · NASA NeoWs
        </span>
        <span className="text-[8px] font-mono text-red-400/50">
          {objects.filter(n => n.is_potentially_hazardous).length} POTENTIALLY HAZARDOUS
        </span>
      </div>

      {objects.map((neo) => (
        <div
          key={neo.id}
          className={clsx(
            'border p-3 transition-colors',
            neo.is_potentially_hazardous
              ? 'border-red-500/30 hover:border-red-500/50 bg-red-500/5'
              : 'border-amber/10 hover:border-amber/20'
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Telescope className={clsx('h-3 w-3', neo.is_potentially_hazardous ? 'text-red-400' : 'text-amber/50')} />
                <span className="text-[10px] font-mono text-amber/80">{neo.name}</span>
                {neo.is_potentially_hazardous && (
                  <span className="px-1.5 py-0.5 text-[7px] font-mono text-red-400 border border-red-400/30 bg-red-400/10 animate-pulse">
                    ⚠ PHA
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[8px] font-mono">
                <span className="text-amber/30">DIAMETER</span>
                <span className="text-amber/60">{Math.round(neo.estimated_diameter_min_m)}–{Math.round(neo.estimated_diameter_max_m)} m</span>
                <span className="text-amber/30">MISS DISTANCE</span>
                <span className={clsx('text-amber/60', neo.miss_distance_km < 7_500_000 && 'text-red-400')}>
                  {(neo.miss_distance_km / 1_000_000).toFixed(2)} M km
                </span>
                <span className="text-amber/30">VELOCITY</span>
                <span className="text-amber/60">{Math.round(neo.relative_velocity_kmh).toLocaleString()} km/h</span>
                <span className="text-amber/30">CLOSEST APPROACH</span>
                <span className="text-amber/60">{neo.close_approach_date}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {objects.length === 0 && !loading && (
        <div className="text-center py-8 text-[10px] font-mono text-amber/30">
          No near-earth objects data available
        </div>
      )}
    </div>
  );
}

/* ---- Shared ---- */
function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
      <span className="text-[9px] font-mono text-amber/40 tracking-wider">{label}</span>
    </div>
  );
}
