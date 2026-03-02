import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Satellite, Flame, Sun, Globe, RefreshCw,
  Shield, AlertTriangle, ExternalLink, Wifi, Clock,
  Telescope, Zap, Maximize2,
  Eye, MapPin, X,
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
  getPublicWebcamsAsync,
  type NasaEvent,
  type SpaceWeatherEvent,
  type FireHotspot,
  type NasaAPOD,
  type EpicImage,
  type NearEarthObject,
  type PublicWebcam,
} from '../services/advancedLayers';

type Tab = 'cameras' | 'nasa' | 'space' | 'fires' | 'neo';

const REFRESH_INTERVAL = 60_000;

export function SurveillancePage() {
  const [tab, setTab] = useState<Tab>('cameras');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const [webcams, setWebcams] = useState<PublicWebcam[]>(getPublicWebcams());
  const [webcamsLoading, setWebcamsLoading] = useState(false);
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
    } catch { /* handled */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setWebcamsLoading(true);
    getPublicWebcamsAsync().then((cams) => {
      if (!cancelled) { setWebcams(cams); setWebcamsLoading(false); }
    }).catch(() => { if (!cancelled) setWebcamsLoading(false); });
    return () => { cancelled = true; };
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
      <div className="border-b border-amber/10 bg-surface px-4 py-3 shrink-0">
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

        <div className="flex items-center border border-amber/20 divide-x divide-amber/20">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono tracking-wider transition-colors',
                tab === key ? 'bg-amber/15 text-amber' : 'text-amber/30 hover:text-amber/50'
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
        {tab === 'cameras' && (
          <CamerasTab
            webcams={webcams}
            active={activeCamera}
            onSelect={setActiveCamera}
            apod={apod}
            epicImages={epicImages}
            webcamsLoading={webcamsLoading}
          />
        )}
        {tab === 'nasa' && <NasaTab events={nasaEvents} loading={loading} />}
        {tab === 'space' && <SpaceWeatherTab events={spaceWeather} loading={loading} />}
        {tab === 'fires' && <FiresTab hotspots={fireHotspots} loading={loading} />}
        {tab === 'neo' && <NeoTab objects={neos} loading={loading} />}
      </div>
    </div>
  );
}

/* ================================================================
   📷 CAMERAS TAB — Live mini-players in a grid, expand to analyze
   ================================================================ */
type CamRegion = 'ALL' | 'NA' | 'EU' | 'ASIA' | 'ME_AF' | 'SA' | 'AU' | 'SPACE';
type CamCategory = 'ALL' | 'city' | 'landmark' | 'airport' | 'traffic' | 'weather' | 'port';

const REGION_MAP: Record<string, CamRegion> = {
  US: 'NA', CA: 'NA', MX: 'NA',
  GB: 'EU', FR: 'EU', IT: 'EU', DE: 'EU', NL: 'EU', CZ: 'EU', IE: 'EU', GI: 'EU',
  JP: 'ASIA', KR: 'ASIA', SG: 'ASIA', TH: 'ASIA',
  AE: 'ME_AF', SA: 'ME_AF', IL: 'ME_AF', ZA: 'ME_AF',
  BR: 'SA', AR: 'SA',
  AU: 'AU',
  INTL: 'SPACE',
};

/** Resolve the best embed URL for a given cam */
function getPlayerUrl(cam: PublicWebcam): string {
  return cam.streamUrl || cam.embedUrl;
}

/** Format the REC timestamp for the HUD */
function recTimestamp(): string {
  const d = new Date();
  return `REC ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${d.toLocaleTimeString(undefined, { hour12: false, fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions)}`;
}

function CamerasTab({ webcams, active, onSelect, apod, epicImages, webcamsLoading }: {
  webcams: PublicWebcam[];
  active: PublicWebcam | null;
  onSelect: (cam: PublicWebcam | null) => void;
  apod: NasaAPOD | null;
  epicImages: EpicImage[];
  webcamsLoading: boolean;
}) {
  const [region, setRegion] = useState<CamRegion>('ALL');
  const [category, setCategory] = useState<CamCategory>('ALL');
  const [recTime, setRecTime] = useState(recTimestamp());

  useEffect(() => {
    const t = setInterval(() => setRecTime(recTimestamp()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = webcams.filter((c) => {
    if (region !== 'ALL' && (REGION_MAP[c.country] || 'NA') !== region) return false;
    if (category !== 'ALL' && c.category !== category) return false;
    return true;
  });

  const regionOpts: { key: CamRegion; label: string }[] = [
    { key: 'ALL', label: 'ALL REGIONS' },
    { key: 'NA', label: 'N. AMERICA' },
    { key: 'EU', label: 'EUROPE' },
    { key: 'ASIA', label: 'ASIA/PAC' },
    { key: 'ME_AF', label: 'ME / AFRICA' },
    { key: 'SA', label: 'S. AMERICA' },
    { key: 'AU', label: 'OCEANIA' },
    { key: 'SPACE', label: 'SPACE' },
  ];
  const catOpts: { key: CamCategory; label: string }[] = [
    { key: 'ALL', label: 'ALL' },
    { key: 'city', label: 'CITY' },
    { key: 'landmark', label: 'LANDMARK' },
    { key: 'airport', label: 'AIRPORT' },
    { key: 'traffic', label: 'TRAFFIC' },
    { key: 'weather', label: 'NATURE' },
    { key: 'port', label: 'PORT' },
  ];

  return (
    <div className="space-y-4">
      {/* Expanded analysis view — Palantir style */}
      {active && (
        <div className="border border-amber/30 bg-black animate-in fade-in duration-300">
          {/* Top HUD bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-amber/15 bg-surface/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-mono text-red-400 tracking-widest font-bold">● LIVE</span>
              </div>
              <span className="text-[11px] font-display text-amber tracking-wider text-glow-amber">{active.title}</span>
              <span className="text-[8px] font-mono text-amber/30">{active.location} · {active.source}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-mono text-tactical-green/60 tracking-wider">{recTime}</span>
              <div className="flex items-center gap-1 text-[8px] font-mono text-amber/40">
                <Eye className="h-3 w-3" />
                <span>FEED ACTIVE</span>
              </div>
              {active.latitude !== 0 && (
                <span className="text-[8px] font-mono text-amber/30">
                  <MapPin className="h-3 w-3 inline mr-0.5" />
                  {active.latitude.toFixed(4)}°, {active.longitude.toFixed(4)}°
                </span>
              )}
              <a
                href={active.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber/30 hover:text-amber text-[8px] font-mono flex items-center gap-1 border border-amber/20 px-2 py-0.5 hover:bg-amber/10 transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> SOURCE
              </a>
              <button
                onClick={() => onSelect(null)}
                className="text-amber/40 hover:text-amber p-1 border border-amber/20 hover:bg-amber/10 transition-colors"
                title="Close analysis view"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Main analysis player */}
          <div className="relative" style={{ height: 'calc(56.25vw * 0.5)', maxHeight: '480px', minHeight: '300px' }}>
            <iframe
              src={getPlayerUrl(active)}
              title={active.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
            {/* Corner reticle overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {/* TL corner */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-amber/40" />
              {/* TR corner */}
              <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-amber/40" />
              {/* BL corner */}
              <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-amber/40" />
              {/* BR corner */}
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-amber/40" />
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 border border-amber/15 rounded-full" />
                <div className="absolute top-1/2 left-0 w-full h-px bg-amber/10" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-amber/10" />
              </div>
              {/* Bottom HUD strip */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between px-4 pb-1.5">
                <div className="flex items-center gap-3 text-[7px] font-mono text-amber/40">
                  <span>ORB: {Math.floor(Math.random() * 50000).toLocaleString()}</span>
                  <span>PASS: {Math.floor(Math.random() * 200)}</span>
                  <span>DESC: {Math.floor(Math.random() * 200)}</span>
                </div>
                <div className="flex items-center gap-3 text-[7px] font-mono text-amber/40">
                  <span>SAT: {filtered.length}/{webcams.length}</span>
                  <span>· LINK: <span className="text-tactical-green">ACTIVE</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis metadata strip */}
          <div className="grid grid-cols-6 gap-px bg-amber/5 border-t border-amber/15">
            <MetaCell label="DESIGNATION" value={active.id.toUpperCase()} />
            <MetaCell label="CATEGORY" value={active.category.toUpperCase()} />
            <MetaCell label="COUNTRY" value={active.country || 'INTL'} />
            <MetaCell label="SOURCE" value={active.source.toUpperCase()} />
            <MetaCell label="STATUS" value="STREAMING" highlight />
            <MetaCell label="LAST UPD" value={new Date(active.lastUpdate).toLocaleTimeString()} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[8px] font-mono text-amber/30 tracking-widest mr-1">REGION</span>
        {regionOpts.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRegion(key)}
            className={clsx(
              'px-2 py-0.5 text-[7px] font-mono tracking-wider border transition-colors',
              region === key
                ? 'border-amber/40 text-amber bg-amber/15'
                : 'border-amber/10 text-amber/25 hover:text-amber/50'
            )}
          >
            {label}
          </button>
        ))}
        <span className="text-[8px] font-mono text-amber/30 tracking-widest ml-3 mr-1">TYPE</span>
        {catOpts.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={clsx(
              'px-2 py-0.5 text-[7px] font-mono tracking-wider border transition-colors',
              category === key
                ? 'border-tactical-green/40 text-tactical-green bg-tactical-green/15'
                : 'border-amber/10 text-amber/25 hover:text-amber/50'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Live mini-player grid */}
      <div>
        <h3 className="text-[10px] font-mono text-amber/40 tracking-wider mb-3 flex items-center gap-2">
          <Camera className="h-3 w-3" /> GLOBAL LIVE FEEDS ({filtered.length} of {webcams.length})
          {webcamsLoading && (
            <span className="text-[7px] text-tactical-green animate-pulse ml-2">⟳ FETCHING WINDY API…</span>
          )}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((cam) => (
            <MiniPlayer
              key={cam.id}
              cam={cam}
              isActive={active?.id === cam.id}
              onSelect={() => onSelect(cam)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[10px] font-mono text-amber/20">
            No cameras match the selected filters. Try adjusting region or type.
          </div>
        )}
      </div>

      {/* NASA EPIC */}
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
   📹 MINI PLAYER CARD — Each card is a live embedded stream
   ================================================================ */
function MiniPlayer({ cam, isActive, onSelect }: {
  cam: PublicWebcam;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [live, setLive] = useState(false);
  const [hovered, setHovered] = useState(false);

  /* Auto-play iframes for cams with a streamUrl (YouTube/Windy embeds).
     Non-embeddable sources (EarthCam etc.) show the thumbnail. */
  const canEmbed = !!cam.streamUrl;

  return (
    <div
      onMouseEnter={() => { setHovered(true); if (canEmbed) setLive(true); }}
      onMouseLeave={() => setHovered(false)}
      className={clsx(
        'border bg-black/80 transition-all duration-200 group relative',
        isActive ? 'border-amber/50 ring-1 ring-amber/30' : 'border-amber/15 hover:border-amber/30',
      )}
    >
      <div className="aspect-video relative overflow-hidden bg-gray-950">
        {/* Live iframe embed OR static thumbnail */}
        {live && canEmbed ? (
          <iframe
            src={cam.streamUrl + (cam.streamUrl!.includes('?') ? '&' : '?') + 'autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0'}
            title={cam.title}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-popups"
            loading="lazy"
          />
        ) : (
          <img
            src={cam.thumbnailUrl}
            alt={cam.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
            loading="lazy"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
            }}
          />
        )}

        {/* HUD overlays — always visible */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Status badge */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 border border-amber/10">
            <span className={clsx(
              'h-1.5 w-1.5 rounded-full',
              cam.status === 'active' ? 'bg-tactical-green animate-pulse' :
              cam.status === 'inactive' ? 'bg-red-500' : 'bg-amber animate-pulse'
            )} />
            <span className={clsx(
              'text-[7px] font-mono tracking-wider font-bold',
              cam.status === 'active' ? 'text-tactical-green' :
              cam.status === 'inactive' ? 'text-red-400' : 'text-amber'
            )}>
              {live && canEmbed ? '● LIVE' : cam.status === 'active' ? 'LIVE' : cam.status === 'inactive' ? 'OFFLINE' : 'LIVE'}
            </span>
          </div>

          {/* Category badge */}
          <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 border border-amber/10">
            <span className="text-[6px] font-mono text-amber/60 tracking-wider uppercase">{cam.category}</span>
          </div>

          {/* Corner brackets for analysis feel */}
          <div className="absolute top-0.5 left-0.5 w-3 h-3 border-l border-t border-amber/20" />
          <div className="absolute top-0.5 right-0.5 w-3 h-3 border-r border-t border-amber/20" />
          <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-l border-b border-amber/20" />
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-r border-b border-amber/20" />

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6">
            <div className="text-[9px] font-mono text-white/90 leading-tight">{cam.title}</div>
            <div className="text-[7px] font-mono text-white/40 mt-0.5">{cam.location} · {cam.source}</div>
          </div>
        </div>

        {/* Hover action overlay */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer z-10" onClick={onSelect}>
            <div className="bg-black/60 backdrop-blur-sm border border-amber/30 p-3 flex items-center gap-2 hover:bg-black/80 transition-colors">
              <Maximize2 className="h-4 w-4 text-amber" />
              <span className="text-[9px] font-mono text-amber tracking-wider">ANALYZE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Metadata cell for the analysis strip
   ================================================================ */
function MetaCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-surface/80 px-3 py-2">
      <div className="text-[7px] font-mono text-amber/25 tracking-widest">{label}</div>
      <div className={clsx(
        'text-[10px] font-mono mt-0.5',
        highlight ? 'text-tactical-green' : 'text-amber/70'
      )}>
        {value}
      </div>
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
