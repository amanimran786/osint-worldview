/**
 * Live data layer fetchers — call public APIs directly from the browser.
 *
 * ✅ USGS Earthquakes — full CORS support
 * ✅ Open-Meteo Weather — full CORS support
 * ✅ GDACS Disasters — proxied via allorigins to bypass CORS
 * ✅ Cyber Threats — generated from deterministic seed data (abuse.ch blocks CORS)
 */
import type {
  EarthquakeFeature,
  WeatherData,
  CyberThreat,
  DisasterEvent,
} from '../types';

const TIMEOUT = 12_000;

/* ================================================================
   EARTHQUAKES — USGS (CORS ✓)
   ================================================================ */
const USGS_URLS: Record<string, string> = {
  hour: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
  day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
  month: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson',
};

export async function fetchEarthquakesDirect(params?: {
  min_magnitude?: number;
  period?: 'hour' | 'day' | 'week' | 'month';
}): Promise<EarthquakeFeature[]> {
  const minMag = params?.min_magnitude ?? 2.5;
  const period = params?.period ?? 'day';
  const url = USGS_URLS[period] ?? USGS_URLS['day']!;

  try {
    const resp = await fetch(url!, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!resp.ok) throw new Error(`USGS ${resp.status}`);
    const data = await resp.json();

    return (data.features ?? [])
      .map((feat: any) => {
        const props = feat.properties ?? {};
        const coords = feat.geometry?.coordinates ?? [0, 0, 0];
        const mag = props.mag ?? 0;
        if (mag < minMag) return null;
        return {
          id: feat.id,
          title: props.title ?? '',
          magnitude: Math.round(mag * 10) / 10,
          latitude: coords[1],
          longitude: coords[0],
          depth_km: coords.length > 2 ? Math.round(coords[2] * 10) / 10 : 0,
          time: props.time,
          url: props.url,
          tsunami: props.tsunami ?? 0,
          severity: mag >= 7 ? 'critical' : mag >= 5.5 ? 'high' : mag >= 4 ? 'medium' : 'low',
        };
      })
      .filter(Boolean) as EarthquakeFeature[];
  } catch (e) {
    console.warn('[Earthquakes] Fetch failed:', e);
    return [];
  }
}

/* ================================================================
   WEATHER — Open-Meteo (CORS ✓)
   ================================================================ */
const CITIES: readonly [string, number, number][] = [
  ['Washington DC', 38.90, -77.04], ['New York', 40.71, -74.01],
  ['London', 51.51, -0.13], ['Paris', 48.86, 2.35],
  ['Moscow', 55.76, 37.62], ['Beijing', 39.90, 116.40],
  ['Tokyo', 35.68, 139.69], ['Seoul', 37.57, 126.98],
  ['Tehran', 35.69, 51.39], ['Tel Aviv', 32.09, 34.78],
  ['Dubai', 25.20, 55.27], ['Mumbai', 19.08, 72.88],
  ['Sydney', -33.87, 151.21], ['Taipei', 25.03, 121.57],
  ['Kyiv', 50.45, 30.52], ['Berlin', 52.52, 13.41],
  ['São Paulo', -23.55, -46.63], ['Lagos', 6.52, 3.38],
  ['Singapore', 1.35, 103.82], ['Austin', 30.27, -97.74],
];

function weatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 49) return 'Fog';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 84) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function weatherSeverity(code: number): string {
  if (code >= 95) return 'critical';
  if (code >= 80) return 'high';
  if (code >= 60) return 'medium';
  return 'low';
}

export async function fetchWeatherDirect(): Promise<WeatherData[]> {
  const lats = CITIES.map(c => c[1]).join(',');
  const lons = CITIES.map(c => c[2]).join(',');

  try {
    const resp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`,
      { signal: AbortSignal.timeout(TIMEOUT) },
    );
    if (!resp.ok) throw new Error(`Open-Meteo ${resp.status}`);
    const data = await resp.json();

    const entries = Array.isArray(data) ? data : [data];
    return entries.map((entry: any, i: number) => {
      const current = entry.current ?? {};
      const code = current.weather_code ?? 0;
      return {
        city: CITIES[i]?.[0] ?? 'Unknown',
        latitude: CITIES[i]?.[1] ?? 0,
        longitude: CITIES[i]?.[2] ?? 0,
        temperature_c: current.temperature_2m,
        wind_speed_kmh: current.wind_speed_10m,
        condition: weatherCondition(code),
        severity: weatherSeverity(code),
      };
    });
  } catch (e) {
    console.warn('[Weather] Fetch failed:', e);
    return [];
  }
}

/* ================================================================
   CYBER THREATS — deterministic seed data
   (abuse.ch doesn't support CORS — we generate realistic IOC data)
   ================================================================ */
const COUNTRY_COORDS: Record<string, [number, number]> = {
  US: [39.8, -98.5], GB: [54.0, -2.0], DE: [51.2, 10.4],
  FR: [46.6, 2.2], NL: [52.1, 5.3], RU: [61.5, 105.3],
  CN: [35.9, 104.2], JP: [36.2, 138.3], KR: [35.9, 127.8],
  IN: [20.6, 79.0], BR: [-14.2, -51.9], AU: [-25.3, 133.8],
  CA: [56.1, -106.3], ZA: [-30.6, 22.9], SG: [1.35, 103.8],
  UA: [48.4, 31.2], PL: [51.9, 19.1], IT: [41.9, 12.6],
  ES: [40.5, -3.7], SE: [60.1, 18.6], TR: [39.0, 35.2],
  ID: [-0.8, 113.9], MX: [23.6, -102.6], AR: [-38.4, -63.6],
};

const MALWARE_NAMES = [
  'Emotet', 'TrickBot', 'Dridex', 'QakBot', 'BazarLoader',
  'IcedID', 'Bumblebee', 'Cobalt Strike', 'SystemBC', 'Pikabot',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export async function fetchCyberThreatsDirect(params?: {
  limit?: number;
}): Promise<CyberThreat[]> {
  const limit = params?.limit ?? 50;
  const countries = Object.keys(COUNTRY_COORDS);
  // Use today's date as seed so data refreshes daily but stays consistent within a day
  const daySeed = Math.floor(Date.now() / 86_400_000);
  const rand = seededRandom(daySeed);

  const threats: CyberThreat[] = [];
  for (let i = 0; i < limit; i++) {
    const country = countries[Math.floor(rand() * countries.length)]!;
    const coords = COUNTRY_COORDS[country]!;
    const latOff = (rand() - 0.5) * 4;
    const lngOff = (rand() - 0.5) * 4;

    threats.push({
      ip: `${Math.floor(rand() * 223) + 1}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}`,
      port: [443, 8443, 4443, 447, 8080, 9443][Math.floor(rand() * 6)]!,
      status: rand() > 0.3 ? 'online' : 'offline',
      malware: MALWARE_NAMES[Math.floor(rand() * MALWARE_NAMES.length)]!,
      first_seen: new Date(Date.now() - Math.floor(rand() * 30) * 86_400_000).toISOString().slice(0, 10),
      last_online: rand() > 0.4 ? new Date(Date.now() - Math.floor(rand() * 3) * 86_400_000).toISOString().slice(0, 10) : null,
      country,
      latitude: Math.round((coords[0] + latOff) * 10000) / 10000,
      longitude: Math.round((coords[1] + lngOff) * 10000) / 10000,
    });
  }
  return threats;
}

/* ================================================================
   DISASTERS — GDACS via CORS proxy
   ================================================================ */
export async function fetchDisastersDirect(): Promise<DisasterEvent[]> {
  // Use allorigins.win as a CORS proxy for GDACS RSS
  const gdacsUrl = 'https://www.gdacs.org/xml/rss.xml';
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(gdacsUrl)}`;

  try {
    const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!resp.ok) throw new Error(`GDACS proxy ${resp.status}`);
    const xml = await resp.text();

    const items = xml.split('<item>').slice(1);
    return items.slice(0, 50).map((item) => {
      const tag = (name: string) => {
        const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
        return m?.[1]?.trim() ?? '';
      };

      let latitude: number | null = null;
      let longitude: number | null = null;

      // georss:point
      const point = tag('georss:point') || tag('geo:point');
      if (point) {
        const parts = point.split(/\s+/);
        if (parts.length === 2) {
          latitude = parseFloat(parts[0]!);
          longitude = parseFloat(parts[1]!);
          if (isNaN(latitude)) latitude = null;
          if (isNaN(longitude)) longitude = null;
        }
      }
      // geo:lat / geo:long fallback
      if (latitude === null) {
        const gLat = tag('geo:lat');
        const gLon = tag('geo:long');
        if (gLat && gLon) {
          latitude = parseFloat(gLat);
          longitude = parseFloat(gLon);
          if (isNaN(latitude)) latitude = null;
          if (isNaN(longitude)) longitude = null;
        }
      }

      return {
        title: tag('title').replace(/<!\[CDATA\[|\]\]>/g, ''),
        description: tag('description').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').slice(0, 300),
        link: tag('link'),
        published: tag('pubDate'),
        latitude,
        longitude,
      } satisfies DisasterEvent;
    });
  } catch (e) {
    console.warn('[Disasters] Fetch failed:', e);
    return [];
  }
}
