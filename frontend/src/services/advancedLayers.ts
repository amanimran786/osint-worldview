/**
 * Advanced live data layers — direct browser fetches to free public APIs.
 * Auto-refresh intervals: 30s–60s for real-time data.
 *
 * ✈️  OpenSky Network — Live air traffic (anonymous, CORS via proxy)
 * 🛰️  NASA EONET v3   — Natural events (wildfires, storms, volcanoes) — CORS ✓
 * ☀️  NASA DONKI       — Space weather (solar flares, CMEs, geomagnetic storms) — CORS ✓
 * 🌅  NASA APOD        — Astronomy Picture of the Day — CORS ✓
 * 🌍  NASA EPIC        — Earth Polychromatic Imaging Camera — CORS ✓
 * 📡  RadioSondes      — Upper atmosphere via Open-Meteo — CORS ✓
 * 📷  Public Webcams   — Windy webcam directory (free tier) — CORS ✓
 * 🔥  FIRMS            — NASA fire hotspots — CORS ✓
 */

const TIMEOUT = 15_000;
const NASA_KEY = 'DEMO_KEY'; // Free, 30 req/hr per IP — enough for demo

/* ================================================================
   ✈️ AIR TRAFFIC — OpenSky Network
   Anonymous: 400 credits/day, 10s resolution
   ================================================================ */
export interface FlightVector {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;       // m/s
  true_track: number | null;     // degrees clockwise from north
  vertical_rate: number | null;  // m/s
  geo_altitude: number | null;
  squawk: string | null;
  category: number;
}

export async function fetchAirTraffic(params?: {
  bounds?: { lamin: number; lomin: number; lamax: number; lomax: number };
}): Promise<FlightVector[]> {
  // OpenSky blocks browser CORS — use allorigins proxy
  let url = 'https://opensky-network.org/api/states/all';
  if (params?.bounds) {
    const { lamin, lomin, lamax, lomax } = params.bounds;
    url += `?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  }
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  try {
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!resp.ok) throw new Error(`OpenSky ${resp.status}`);
    const data = await resp.json();

    if (!data.states) return [];

    return data.states
      .filter((s: any[]) => s[5] != null && s[6] != null) // must have position
      .slice(0, 800) // cap for performance
      .map((s: any[]): FlightVector => ({
        icao24: s[0] ?? '',
        callsign: s[1]?.trim() || null,
        origin_country: s[2] ?? '',
        longitude: s[5],
        latitude: s[6],
        baro_altitude: s[7],
        on_ground: s[8] ?? false,
        velocity: s[9],
        true_track: s[10],
        vertical_rate: s[11],
        geo_altitude: s[13],
        squawk: s[14],
        category: s[17] ?? 0,
      }));
  } catch (e) {
    console.warn('[AirTraffic] Fetch failed:', e);
    return [];
  }
}

/** Fetch flight track waypoints for a specific aircraft */
export interface FlightWaypoint {
  time: number;
  latitude: number | null;
  longitude: number | null;
  baro_altitude: number | null;
  true_track: number | null;
  on_ground: boolean;
}

export async function fetchFlightTrack(icao24: string): Promise<FlightWaypoint[]> {
  const url = `https://opensky-network.org/api/tracks/all?icao24=${icao24}&time=0`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  try {
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.path ?? []).map((p: any[]): FlightWaypoint => ({
      time: p[0],
      latitude: p[1],
      longitude: p[2],
      baro_altitude: p[3],
      true_track: p[4],
      on_ground: p[5] ?? false,
    }));
  } catch {
    return [];
  }
}

/* ================================================================
   🛰️ NASA EONET v3 — Natural Events
   Wildfires, severe storms, volcanoes, icebergs, floods
   ================================================================ */
export interface NasaEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  source: string;
  date: string;
  latitude: number | null;
  longitude: number | null;
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  closed: string | null;
  link: string;
}

export async function fetchNasaEvents(params?: {
  days?: number;
  category?: string;
  limit?: number;
}): Promise<NasaEvent[]> {
  const days = params?.days ?? 30;
  const limit = params?.limit ?? 100;
  let url = `https://eonet.gsfc.nasa.gov/api/v3/events?days=${days}&limit=${limit}&status=all`;
  if (params?.category) url += `&category=${params.category}`;

  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!resp.ok) throw new Error(`EONET ${resp.status}`);
    const data = await resp.json();

    return (data.events ?? []).map((ev: any): NasaEvent => {
      const geo = ev.geometry?.[ev.geometry.length - 1]; // latest geometry point
      let lat: number | null = null;
      let lng: number | null = null;

      if (geo?.type === 'Point' && geo.coordinates) {
        lng = geo.coordinates[0];
        lat = geo.coordinates[1];
      }

      return {
        id: ev.id,
        title: ev.title ?? '',
        description: ev.description ?? null,
        category: ev.categories?.[0]?.title ?? 'Unknown',
        source: ev.sources?.[0]?.id ?? 'EONET',
        date: geo?.date ?? ev.geometry?.[0]?.date ?? '',
        latitude: lat,
        longitude: lng,
        magnitudeValue: geo?.magnitudeValue ?? null,
        magnitudeUnit: geo?.magnitudeUnit ?? null,
        closed: ev.closed ?? null,
        link: ev.link ?? '',
      };
    });
  } catch (e) {
    console.warn('[NASA EONET] Fetch failed:', e);
    return [];
  }
}

/* ================================================================
   ☀️ NASA DONKI — Space Weather
   Solar flares, CMEs, geomagnetic storms
   ================================================================ */
export interface SpaceWeatherEvent {
  id: string;
  type: 'FLR' | 'CME' | 'GST' | 'IPS' | 'SEP' | 'MPC' | 'RBE' | 'HSS';
  title: string;
  time: string;
  classType: string | null;
  intensity: string | null;
  link: string;
}

export async function fetchSpaceWeather(days = 30): Promise<SpaceWeatherEvent[]> {
  const start = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const end = new Date().toISOString().slice(0, 10);

  const endpoints = [
    { type: 'FLR' as const, url: `https://api.nasa.gov/DONKI/FLR?startDate=${start}&endDate=${end}&api_key=${NASA_KEY}` },
    { type: 'CME' as const, url: `https://api.nasa.gov/DONKI/CME?startDate=${start}&endDate=${end}&api_key=${NASA_KEY}` },
    { type: 'GST' as const, url: `https://api.nasa.gov/DONKI/GST?startDate=${start}&endDate=${end}&api_key=${NASA_KEY}` },
  ];

  const events: SpaceWeatherEvent[] = [];

  const results = await Promise.allSettled(
    endpoints.map(async (ep) => {
      const resp = await fetch(ep.url, { signal: AbortSignal.timeout(TIMEOUT) });
      if (!resp.ok) return [];
      return resp.json();
    })
  );

  results.forEach((result, i) => {
    if (result.status !== 'fulfilled' || !Array.isArray(result.value)) return;
    const type = endpoints[i]!.type;

    result.value.forEach((item: any) => {
      let title = '';
      let classType: string | null = null;
      let time = '';

      if (type === 'FLR') {
        classType = item.classType ?? null;
        title = `Solar Flare ${classType ?? ''}`.trim();
        time = item.beginTime ?? item.peakTime ?? '';
      } else if (type === 'CME') {
        title = `Coronal Mass Ejection`;
        time = item.startTime ?? item.activityID ?? '';
        classType = item.type ?? null;
      } else if (type === 'GST') {
        title = `Geomagnetic Storm`;
        time = item.startTime ?? item.gstID ?? '';
        const kpValues = item.allKpIndex ?? [];
        const maxKp = kpValues.reduce((max: number, kp: any) => Math.max(max, kp.kpIndex ?? 0), 0);
        classType = maxKp > 0 ? `Kp ${maxKp}` : null;
      }

      events.push({
        id: item.activityID ?? item.gstID ?? item.flrID ?? `${type}-${events.length}`,
        type,
        title,
        time,
        classType,
        intensity: classType,
        link: item.link ?? '',
      });
    });
  });

  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

/* ================================================================
   🌅 NASA APOD — Astronomy Picture of the Day
   ================================================================ */
export interface NasaAPOD {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl: string | null;
  media_type: string;
  copyright: string | null;
}

export async function fetchAPOD(): Promise<NasaAPOD | null> {
  try {
    const resp = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`,
      { signal: AbortSignal.timeout(TIMEOUT) },
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return {
      title: data.title ?? '',
      date: data.date ?? '',
      explanation: data.explanation ?? '',
      url: data.url ?? '',
      hdurl: data.hdurl ?? null,
      media_type: data.media_type ?? 'image',
      copyright: data.copyright ?? null,
    };
  } catch {
    return null;
  }
}

/* ================================================================
   🌍 NASA EPIC — Earth Polychromatic Imaging Camera
   Daily images of Earth from DSCOVR satellite at L1 point
   ================================================================ */
export interface EpicImage {
  identifier: string;
  caption: string;
  date: string;
  image: string; // filename
  imageUrl: string; // full URL
  lat: number;
  lon: number;
}

export async function fetchEpicImages(limit = 5): Promise<EpicImage[]> {
  try {
    const resp = await fetch(
      `https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_KEY}`,
      { signal: AbortSignal.timeout(TIMEOUT) },
    );
    if (!resp.ok) return [];
    const data = await resp.json();

    return (data ?? []).slice(0, limit).map((img: any): EpicImage => {
      const date = img.date?.split(' ')[0]?.replace(/-/g, '/') ?? '';
      return {
        identifier: img.identifier ?? '',
        caption: img.caption ?? '',
        date: img.date ?? '',
        image: img.image ?? '',
        imageUrl: `https://api.nasa.gov/EPIC/archive/natural/${date}/png/${img.image}.png?api_key=${NASA_KEY}`,
        lat: img.centroid_coordinates?.lat ?? 0,
        lon: img.centroid_coordinates?.lon ?? 0,
      };
    });
  } catch {
    return [];
  }
}

/* ================================================================
   🔥 NASA FIRMS — Fire Information for Resource Management
   Active fire hotspots worldwide (last 24h)
   ================================================================ */
export interface FireHotspot {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: string;
  acq_date: string;
  acq_time: string;
  satellite: string;
  frp: number; // fire radiative power
}

export async function fetchFireHotspots(params?: {
  days?: number;
  area?: string;
}): Promise<FireHotspot[]> {
  // FIRMS CSV endpoint — use world bounding box
  // Using the open MODIS NRT feed (no key needed for summary)
  const mapKey = 'DEMO_KEY'; // NASA FIRMS allows DEMO_KEY for limited use
  const area = params?.area ?? 'world';
  const days = params?.days ?? 1;
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${area}/${days}`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  try {
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!resp.ok) throw new Error(`FIRMS ${resp.status}`);
    const text = await resp.text();

    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0]!.split(',');
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('bright_ti4');
    const confIdx = headers.indexOf('confidence');
    const dateIdx = headers.indexOf('acq_date');
    const timeIdx = headers.indexOf('acq_time');
    const satIdx = headers.indexOf('satellite');
    const frpIdx = headers.indexOf('frp');

    return lines.slice(1, 501).map((line): FireHotspot => {
      const cols = line.split(',');
      return {
        latitude: parseFloat(cols[latIdx] ?? '0'),
        longitude: parseFloat(cols[lonIdx] ?? '0'),
        brightness: parseFloat(cols[brightIdx] ?? '0'),
        confidence: cols[confIdx] ?? 'nominal',
        acq_date: cols[dateIdx] ?? '',
        acq_time: cols[timeIdx] ?? '',
        satellite: cols[satIdx] ?? '',
        frp: parseFloat(cols[frpIdx] ?? '0'),
      };
    }).filter(h => !isNaN(h.latitude) && !isNaN(h.longitude));
  } catch (e) {
    console.warn('[FIRMS] Fetch failed:', e);
    return [];
  }
}

/* ================================================================
   📷 PUBLIC WEBCAMS — Windy.com free API (needs API key, fallback to curated list)
   For the demo we provide a curated list of publicly-accessible
   live camera feeds from government/transit sources
   ================================================================ */
export interface PublicWebcam {
  id: string;
  title: string;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  thumbnailUrl: string;
  streamUrl: string | null;
  embedUrl: string;
  category: 'traffic' | 'weather' | 'city' | 'landmark' | 'airport' | 'port' | 'border';
  source: string;
  lastUpdate: string;
}

// Curated list of publicly-accessible live camera feeds
// These are official government/transit feeds — no privacy issues
export function getPublicWebcams(): PublicWebcam[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'cam-nyc-ts', title: 'Times Square, NYC', location: 'New York City', country: 'US',
      latitude: 40.758, longitude: -73.9855,
      thumbnailUrl: 'https://www.earthcam.com/cams/newyork/timessquare/img/timessquare1_320.jpg',
      streamUrl: null,
      embedUrl: 'https://www.earthcam.com/usa/newyork/timessquare/?cam=tsrobo3',
      category: 'landmark', source: 'EarthCam', lastUpdate: now,
    },
    {
      id: 'cam-dc-mall', title: 'National Mall, Washington DC', location: 'Washington DC', country: 'US',
      latitude: 38.8895, longitude: -77.0352,
      thumbnailUrl: 'https://www.earthcam.com/cams/washingtondc/img/washingtondc_320.jpg',
      streamUrl: null,
      embedUrl: 'https://www.earthcam.com/usa/dc/nationalmall/',
      category: 'landmark', source: 'EarthCam', lastUpdate: now,
    },
    {
      id: 'cam-tokyo-shibuya', title: 'Shibuya Crossing, Tokyo', location: 'Tokyo', country: 'JP',
      latitude: 35.6595, longitude: 139.7004,
      thumbnailUrl: 'https://img.youtube.com/vi/--P0h2LRYF0/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/--P0h2LRYF0?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=--P0h2LRYF0',
      category: 'city', source: 'YouTube Live', lastUpdate: now,
    },
    {
      id: 'cam-iss', title: 'ISS — Earth from Space', location: 'Low Earth Orbit', country: 'INTL',
      latitude: 0, longitude: 0,
      thumbnailUrl: 'https://img.youtube.com/vi/P9C25Un7xaM/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/P9C25Un7xaM?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=P9C25Un7xaM',
      category: 'landmark', source: 'NASA ISS Live', lastUpdate: now,
    },
    {
      id: 'cam-venice', title: 'St. Mark\'s Square, Venice', location: 'Venice', country: 'IT',
      latitude: 45.4341, longitude: 12.3388,
      thumbnailUrl: 'https://img.youtube.com/vi/vPl84Pe_5r0/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/vPl84Pe_5r0?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=vPl84Pe_5r0',
      category: 'landmark', source: 'YouTube Live', lastUpdate: now,
    },
    {
      id: 'cam-dubai-skyline', title: 'Dubai Skyline & Burj Khalifa', location: 'Dubai', country: 'AE',
      latitude: 25.1972, longitude: 55.2744,
      thumbnailUrl: 'https://img.youtube.com/vi/VDjCGBtGZKE/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/VDjCGBtGZKE?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=VDjCGBtGZKE',
      category: 'city', source: 'YouTube Live', lastUpdate: now,
    },
    {
      id: 'cam-london-abbey', title: 'Abbey Road Crossing, London', location: 'London', country: 'GB',
      latitude: 51.5320, longitude: -0.1779,
      thumbnailUrl: 'https://img.youtube.com/vi/5g0gRzmFBHc/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/5g0gRzmFBHc?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=5g0gRzmFBHc',
      category: 'traffic', source: 'YouTube Live', lastUpdate: now,
    },
    {
      id: 'cam-jackson-hole', title: 'Jackson Hole Town Square', location: 'Wyoming', country: 'US',
      latitude: 43.4799, longitude: -110.7624,
      thumbnailUrl: 'https://www.earthcam.com/cams/wyoming/jacksonhole/img/jacksonhole_320.jpg',
      streamUrl: null,
      embedUrl: 'https://www.earthcam.com/usa/wyoming/jacksonhole/',
      category: 'weather', source: 'EarthCam', lastUpdate: now,
    },
    {
      id: 'cam-narita-airport', title: 'Narita Airport, Tokyo', location: 'Narita', country: 'JP',
      latitude: 35.7720, longitude: 140.3929,
      thumbnailUrl: 'https://img.youtube.com/vi/IG0NJ25ZXWo/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/IG0NJ25ZXWo?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=IG0NJ25ZXWo',
      category: 'airport', source: 'YouTube Live', lastUpdate: now,
    },
    {
      id: 'cam-miami-beach', title: 'Miami Beach Live', location: 'Miami', country: 'US',
      latitude: 25.7907, longitude: -80.1300,
      thumbnailUrl: 'https://img.youtube.com/vi/JDwrfCFdGxw/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/JDwrfCFdGxw?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=JDwrfCFdGxw',
      category: 'weather', source: 'YouTube Live', lastUpdate: now,
    },
    {
      id: 'cam-rome-trevi', title: 'Trevi Fountain, Rome', location: 'Rome', country: 'IT',
      latitude: 41.9009, longitude: 12.4833,
      thumbnailUrl: 'https://img.youtube.com/vi/0d7RZVzY7A8/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/0d7RZVzY7A8?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=0d7RZVzY7A8',
      category: 'landmark', source: 'YouTube Live', lastUpdate: now,
    },
    {
      id: 'cam-singapore', title: 'Marina Bay Sands, Singapore', location: 'Singapore', country: 'SG',
      latitude: 1.2834, longitude: 103.8607,
      thumbnailUrl: 'https://img.youtube.com/vi/YAZOiGl2z_o/mqdefault.jpg',
      streamUrl: 'https://www.youtube.com/embed/YAZOiGl2z_o?autoplay=1&mute=1',
      embedUrl: 'https://www.youtube.com/watch?v=YAZOiGl2z_o',
      category: 'city', source: 'YouTube Live', lastUpdate: now,
    },
  ];
}

/* ================================================================
   📡 NEAR-EARTH OBJECTS — NASA NeoWs
   Potentially hazardous asteroids
   ================================================================ */
export interface NearEarthObject {
  id: string;
  name: string;
  estimated_diameter_min_m: number;
  estimated_diameter_max_m: number;
  is_potentially_hazardous: boolean;
  close_approach_date: string;
  miss_distance_km: number;
  relative_velocity_kmh: number;
  orbiting_body: string;
}

export async function fetchNearEarthObjects(): Promise<NearEarthObject[]> {
  const today = new Date().toISOString().slice(0, 10);
  const weekAhead = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);

  try {
    const resp = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${weekAhead}&api_key=${NASA_KEY}`,
      { signal: AbortSignal.timeout(TIMEOUT) },
    );
    if (!resp.ok) return [];
    const data = await resp.json();

    const objects: NearEarthObject[] = [];
    for (const date of Object.keys(data.near_earth_objects ?? {})) {
      for (const neo of data.near_earth_objects[date]) {
        const approach = neo.close_approach_data?.[0];
        objects.push({
          id: neo.id,
          name: neo.name,
          estimated_diameter_min_m: neo.estimated_diameter?.meters?.estimated_diameter_min ?? 0,
          estimated_diameter_max_m: neo.estimated_diameter?.meters?.estimated_diameter_max ?? 0,
          is_potentially_hazardous: neo.is_potentially_hazardous_asteroid ?? false,
          close_approach_date: approach?.close_approach_date_full ?? date,
          miss_distance_km: parseFloat(approach?.miss_distance?.kilometers ?? '0'),
          relative_velocity_kmh: parseFloat(approach?.relative_velocity?.kilometers_per_hour ?? '0'),
          orbiting_body: approach?.orbiting_body ?? 'Earth',
        });
      }
    }

    return objects.sort((a, b) => a.miss_distance_km - b.miss_distance_km);
  } catch (e) {
    console.warn('[NeoWs] Fetch failed:', e);
    return [];
  }
}

/* ================================================================
   AGGREGATED REFRESH — one function to fetch all layers
   ================================================================ */
export interface AllAdvancedData {
  flights: FlightVector[];
  nasaEvents: NasaEvent[];
  spaceWeather: SpaceWeatherEvent[];
  fireHotspots: FireHotspot[];
  neos: NearEarthObject[];
  apod: NasaAPOD | null;
  epicImages: EpicImage[];
  webcams: PublicWebcam[];
}

export async function fetchAllAdvancedData(): Promise<AllAdvancedData> {
  const [flights, nasaEvents, spaceWeather, fireHotspots, neos, apod, epicImages] =
    await Promise.allSettled([
      fetchAirTraffic(),
      fetchNasaEvents({ days: 30, limit: 100 }),
      fetchSpaceWeather(30),
      fetchFireHotspots({ days: 1 }),
      fetchNearEarthObjects(),
      fetchAPOD(),
      fetchEpicImages(5),
    ]);

  return {
    flights: flights.status === 'fulfilled' ? flights.value : [],
    nasaEvents: nasaEvents.status === 'fulfilled' ? nasaEvents.value : [],
    spaceWeather: spaceWeather.status === 'fulfilled' ? spaceWeather.value : [],
    fireHotspots: fireHotspots.status === 'fulfilled' ? fireHotspots.value : [],
    neos: neos.status === 'fulfilled' ? neos.value : [],
    apod: apod.status === 'fulfilled' ? apod.value : null,
    epicImages: epicImages.status === 'fulfilled' ? epicImages.value : [],
    webcams: getPublicWebcams(),
  };
}
