/**
 * Demo data store — runs entirely in the browser (localStorage).
 * Provides seed signals, cases, rules, sources so every page has content
 * without needing a backend database.
 */
import type { Signal, Rule, Source, Case, Note, Analytics, GeoSignal, HeatmapEntry } from '../types';

const LS_KEY = 'osint-worldview-demo';

interface DemoStore {
  signals: Signal[];
  rules: Rule[];
  sources: Source[];
  cases: Case[];
  notes: Note[];
  _seeded: boolean;
}

/* ---- Persistence ---- */
function load(): DemoStore {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed._seeded) return parsed;
    }
  } catch { /* ignore */ }
  return seed();
}

function save(store: DemoStore) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch { /* ignore */ }
}

/* ---- Seed data ---- */
function seed(): DemoStore {
  const now = new Date();
  const ago = (h: number) => new Date(now.getTime() - h * 3600_000).toISOString();

  const signals: Signal[] = [
    { id: 1, title: 'Russian APT29 targets NATO supply chains', snippet: 'Advanced persistent threat group linked to SVR observed probing logistics networks across Eastern Europe.', url: 'https://threatpost.com', source: 'ThreatPost RSS', published_at: ago(2), fetched_at: ago(1), severity: 82, category: 'Cyber', status: 'New', case_id: null, latitude: 50.45, longitude: 30.52, location_name: 'Kyiv, Ukraine', country_code: 'UA', ai_summary: null },
    { id: 2, title: 'M7.1 earthquake off coast of Papua New Guinea', snippet: 'USGS reports strong earthquake at 10km depth. Tsunami warning issued for coastal regions.', url: 'https://earthquake.usgs.gov', source: 'USGS Feed', published_at: ago(4), fetched_at: ago(3), severity: 75, category: 'Natural Disaster', status: 'Escalated', case_id: 1, latitude: -5.5, longitude: 152.2, location_name: 'Papua New Guinea', country_code: 'PG', ai_summary: 'Significant seismic event with tsunami potential.' },
    { id: 3, title: 'Chinese military exercises near Taiwan Strait', snippet: 'PLA Navy conducts live-fire drills in waters east of Taiwan amid heightened cross-strait tensions.', url: 'https://reuters.com', source: 'Reuters Wire', published_at: ago(6), fetched_at: ago(5), severity: 90, category: 'Military', status: 'In Review', case_id: 2, latitude: 24.5, longitude: 121.0, location_name: 'Taiwan Strait', country_code: 'TW', ai_summary: null },
    { id: 4, title: 'LockBit ransomware targets healthcare sector', snippet: 'FBI advisory warns of renewed LockBit 4.0 campaign targeting US hospital networks.', url: 'https://cisa.gov', source: 'CISA Alerts', published_at: ago(8), fetched_at: ago(7), severity: 68, category: 'Cyber', status: 'New', case_id: null, latitude: 38.9, longitude: -77.04, location_name: 'Washington DC, US', country_code: 'US', ai_summary: null },
    { id: 5, title: 'Iranian uranium enrichment exceeds 60% threshold', snippet: 'IAEA report confirms enrichment levels approaching weapons-grade material at Natanz facility.', url: 'https://iaea.org', source: 'IAEA Reports', published_at: ago(12), fetched_at: ago(11), severity: 95, category: 'WMD', status: 'Escalated', case_id: 3, latitude: 33.72, longitude: 51.73, location_name: 'Natanz, Iran', country_code: 'IR', ai_summary: 'Critical proliferation concern — enrichment at near weapons-grade.' },
    { id: 6, title: 'North Korean missile test over Sea of Japan', snippet: 'DPRK launches intermediate-range ballistic missile. Japanese authorities issue J-Alert.', url: 'https://kcna.kp', source: 'KCNA Watch', published_at: ago(1), fetched_at: ago(0.5), severity: 88, category: 'Military', status: 'New', case_id: null, latitude: 39.0, longitude: 125.75, location_name: 'Pyongyang, DPRK', country_code: 'KP', ai_summary: null },
    { id: 7, title: 'Flood warning issued for Bangladesh delta region', snippet: 'Monsoon rainfall exceeds 300mm in 24hrs. 2.5 million at risk in Sylhet division.', url: 'https://reliefweb.int', source: 'ReliefWeb', published_at: ago(3), fetched_at: ago(2), severity: 52, category: 'Natural Disaster', status: 'In Review', case_id: null, latitude: 24.9, longitude: 91.87, location_name: 'Sylhet, Bangladesh', country_code: 'BD', ai_summary: null },
    { id: 8, title: 'Wagner Group mercenaries redeploy to Libya', snippet: 'Satellite imagery confirms movement of Wagner-linked equipment to eastern Libya bases.', url: 'https://janes.com', source: 'Janes Intel', published_at: ago(18), fetched_at: ago(17), severity: 61, category: 'Military', status: 'Dismissed', case_id: null, latitude: 32.9, longitude: 13.18, location_name: 'Tripoli, Libya', country_code: 'LY', ai_summary: null },
    { id: 9, title: 'SolarWinds-style supply chain compromise detected', snippet: 'Mandiant discovers backdoor in popular npm package affecting 14,000+ repositories.', url: 'https://mandiant.com', source: 'Mandiant Blog', published_at: ago(5), fetched_at: ago(4), severity: 78, category: 'Cyber', status: 'New', case_id: null, latitude: 37.39, longitude: -122.08, location_name: 'Mountain View, US', country_code: 'US', ai_summary: null },
    { id: 10, title: 'Houthi drone strikes on Red Sea shipping', snippet: 'Commercial vessel hit by UAV near Bab el-Mandeb strait. Insurance premiums surge 400%.', url: 'https://maritime-executive.com', source: 'Maritime Intel', published_at: ago(10), fetched_at: ago(9), severity: 72, category: 'Military', status: 'In Review', case_id: null, latitude: 12.8, longitude: 43.3, location_name: 'Bab el-Mandeb, Yemen', country_code: 'YE', ai_summary: null },
    { id: 11, title: 'EU imposes sanctions on Russian energy sector', snippet: 'New sanctions package targets LNG exports and oil shipping insurance networks.', url: 'https://ec.europa.eu', source: 'EU Council', published_at: ago(14), fetched_at: ago(13), severity: 45, category: 'Economic', status: 'Closed', case_id: null, latitude: 50.85, longitude: 4.35, location_name: 'Brussels, Belgium', country_code: 'BE', ai_summary: null },
    { id: 12, title: 'Deepfake propaganda campaign targets elections', snippet: 'AI-generated political disinformation detected across social platforms ahead of European elections.', url: 'https://europol.europa.eu', source: 'Europol Alert', published_at: ago(7), fetched_at: ago(6), severity: 58, category: 'Information Warfare', status: 'New', case_id: null, latitude: 52.37, longitude: 4.9, location_name: 'The Hague, Netherlands', country_code: 'NL', ai_summary: null },
    { id: 13, title: 'Volcanic eruption alert: Mount Ruang, Indonesia', snippet: 'PVMBG raises alert to highest level. Evacuations ordered within 6km radius.', url: 'https://volcano.si.edu', source: 'Smithsonian GVP', published_at: ago(0.5), fetched_at: ago(0.2), severity: 66, category: 'Natural Disaster', status: 'New', case_id: null, latitude: 2.3, longitude: 125.37, location_name: 'Sulawesi, Indonesia', country_code: 'ID', ai_summary: null },
    { id: 14, title: 'Chinese spy balloon detected over Pacific', snippet: 'NORAD tracking high-altitude surveillance balloon trajectory toward North American coast.', url: 'https://defense.gov', source: 'DoD Press', published_at: ago(20), fetched_at: ago(19), severity: 70, category: 'Surveillance', status: 'Closed', case_id: null, latitude: 35.0, longitude: -160.0, location_name: 'Pacific Ocean', country_code: null, ai_summary: null },
    { id: 15, title: 'Terrorist financing network disrupted in Turkey', snippet: 'Interpol-led operation seizes $47M in cryptocurrency linked to ISIS financing cells.', url: 'https://interpol.int', source: 'Interpol Red Notice', published_at: ago(16), fetched_at: ago(15), severity: 55, category: 'Terrorism', status: 'In Review', case_id: null, latitude: 41.01, longitude: 28.98, location_name: 'Istanbul, Turkey', country_code: 'TR', ai_summary: null },
  ];

  const rules: Rule[] = [
    { id: 1, name: 'Critical Cyber Threat', category: 'Cyber', severity: 80, keywords: 'APT,ransomware,zero-day,backdoor,RCE,exploit', allowlist: null, denylist: null, enabled: true },
    { id: 2, name: 'WMD Proliferation', category: 'WMD', severity: 90, keywords: 'nuclear,enrichment,weapons-grade,ICBM,biological,chemical', allowlist: null, denylist: null, enabled: true },
    { id: 3, name: 'Military Escalation', category: 'Military', severity: 70, keywords: 'military exercises,missile launch,troop deployment,live-fire,naval blockade', allowlist: null, denylist: null, enabled: true },
    { id: 4, name: 'Natural Disaster Alert', category: 'Natural Disaster', severity: 60, keywords: 'earthquake,tsunami,hurricane,typhoon,volcanic eruption,flood', allowlist: null, denylist: 'drill,exercise', enabled: true },
    { id: 5, name: 'Terrorism Watch', category: 'Terrorism', severity: 75, keywords: 'terrorist,IED,suicide bomber,hostage,mass casualty', allowlist: null, denylist: null, enabled: true },
    { id: 6, name: 'Information Warfare', category: 'Info Ops', severity: 50, keywords: 'deepfake,disinformation,propaganda,influence operation,troll farm', allowlist: null, denylist: null, enabled: true },
    { id: 7, name: 'Supply Chain Compromise', category: 'Cyber', severity: 85, keywords: 'supply chain,backdoor,npm,pypi,package compromise,SolarWinds', allowlist: null, denylist: null, enabled: true },
    { id: 8, name: 'Maritime Security', category: 'Military', severity: 65, keywords: 'piracy,drone strike,shipping lane,maritime,Houthi,Red Sea', allowlist: null, denylist: null, enabled: false },
  ];

  const sources: Source[] = [
    { id: 1, name: 'USGS Earthquake Feed', type: 'API', url: 'https://earthquake.usgs.gov/earthquakes/feed/', enabled: true },
    { id: 2, name: 'CISA Alerts', type: 'RSS', url: 'https://www.cisa.gov/news.xml', enabled: true },
    { id: 3, name: 'Reuters Wire', type: 'RSS', url: 'https://www.reuters.com/rssfeed/', enabled: true },
    { id: 4, name: 'ThreatPost', type: 'RSS', url: 'https://threatpost.com/feed/', enabled: true },
    { id: 5, name: 'ReliefWeb', type: 'API', url: 'https://api.reliefweb.int/v1/reports', enabled: true },
    { id: 6, name: 'Feodo Tracker', type: 'API', url: 'https://feodotracker.abuse.ch/', enabled: true },
    { id: 7, name: 'GDACS Disasters', type: 'RSS', url: 'https://www.gdacs.org/xml/rss.xml', enabled: true },
    { id: 8, name: 'IAEA Reports', type: 'Scraper', url: 'https://www.iaea.org/newscenter/', enabled: false },
  ];

  const cases: Case[] = [
    { id: 1, title: 'Pacific Ring Seismic Activity Cluster', status: 'Open', created_at: ago(48) },
    { id: 2, title: 'Taiwan Strait Escalation Monitoring', status: 'Open', created_at: ago(72) },
    { id: 3, title: 'Iran Nuclear Program Assessment', status: 'Open', created_at: ago(96) },
    { id: 4, title: 'Eastern Europe Cyber Campaign', status: 'In Progress', created_at: ago(120) },
    { id: 5, title: 'Red Sea Shipping Disruption', status: 'Closed', created_at: ago(240) },
  ];

  const notes: Note[] = [
    { id: 1, content: 'M7.1 event linked to broader plate movement pattern. Monitor for aftershocks.', signal_id: 2, case_id: 1, author_id: null, created_at: ago(40) },
    { id: 2, content: 'PLA exercises coincide with diplomatic tensions. Escalation ladder assessment needed.', signal_id: 3, case_id: 2, author_id: null, created_at: ago(60) },
    { id: 3, content: 'IAEA report confirms 60% enrichment. Cross-reference with satellite imagery.', signal_id: 5, case_id: 3, author_id: null, created_at: ago(80) },
  ];

  const store: DemoStore = { signals, rules, sources, cases, notes, _seeded: true };
  save(store);
  return store;
}

/* ---- Public API (mirrors backend endpoints) ---- */

let _store = load();

export function getSignals(params?: { status?: string; limit?: number; offset?: number }): Signal[] {
  let list = [..._store.signals];
  if (params?.status) list = list.filter(s => s.status === params.status);
  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? 100;
  return list.slice(offset, offset + limit);
}

export function createSignal(payload: { title: string; url: string; snippet?: string; source: string }): Signal {
  const id = Math.max(0, ..._store.signals.map(s => s.id)) + 1;
  const sig: Signal = {
    id, title: payload.title, snippet: payload.snippet ?? null, url: payload.url,
    source: payload.source, published_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(), severity: Math.floor(Math.random() * 60) + 20,
    category: 'Unclassified', status: 'New', case_id: null,
    latitude: null, longitude: null, location_name: null, country_code: null, ai_summary: null,
  };
  _store.signals.unshift(sig);
  save(_store);
  return sig;
}

export function updateSignal(id: number, patch: { status?: string; case_id?: number }): Signal | null {
  const sig = _store.signals.find(s => s.id === id);
  if (!sig) return null;
  if (patch.status) sig.status = patch.status;
  if (patch.case_id !== undefined) sig.case_id = patch.case_id;
  save(_store);
  return sig;
}

export function getRules(): Rule[] { return _store.rules; }

export function createRule(r: Omit<Rule, 'id'>): Rule {
  const id = Math.max(0, ..._store.rules.map(r => r.id)) + 1;
  const rule = { ...r, id };
  _store.rules.push(rule);
  save(_store);
  return rule;
}

export function deleteRule(id: number): void {
  _store.rules = _store.rules.filter(r => r.id !== id);
  save(_store);
}

export function getSources(): Source[] { return _store.sources; }

export function createSource(s: Omit<Source, 'id'>): Source {
  const id = Math.max(0, ..._store.sources.map(s => s.id)) + 1;
  const src = { ...s, id };
  _store.sources.push(src);
  save(_store);
  return src;
}

export function getCases(params?: { status?: string }): Case[] {
  let list = [..._store.cases];
  if (params?.status) list = list.filter(c => c.status === params.status);
  return list;
}

export function createCase(title: string): Case {
  const id = Math.max(0, ..._store.cases.map(c => c.id)) + 1;
  const c: Case = { id, title, status: 'Open', created_at: new Date().toISOString() };
  _store.cases.push(c);
  save(_store);
  return c;
}

export function getNotes(caseId: number): Note[] {
  return _store.notes.filter(n => n.case_id === caseId);
}

export function addNote(caseId: number, content: string): Note {
  const id = Math.max(0, ..._store.notes.map(n => n.id)) + 1;
  const note: Note = { id, content, signal_id: null, case_id: caseId, author_id: null, created_at: new Date().toISOString() };
  _store.notes.push(note);
  save(_store);
  return note;
}

export function getAnalytics(_days = 30): Analytics {
  const signals = _store.signals;
  const now = new Date();

  // Generate time series
  const buckets: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400_000);
    buckets.push({
      date: d.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 8) + (i < 5 ? 3 : 1),
    });
  }

  const sevDist = {
    low: signals.filter(s => s.severity < 15).length,
    medium: signals.filter(s => s.severity >= 15 && s.severity < 35).length,
    high: signals.filter(s => s.severity >= 35 && s.severity < 60).length,
    critical: signals.filter(s => s.severity >= 60).length,
  };

  const srcMap = new Map<string, number>();
  signals.forEach(s => srcMap.set(s.source, (srcMap.get(s.source) ?? 0) + 1));
  const topSources = [...srcMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  const catMap = new Map<string, number>();
  signals.forEach(s => { if (s.category) catMap.set(s.category, (catMap.get(s.category) ?? 0) + 1); });
  const topCategories = [...catMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total_signals: signals.length,
    new_signals: signals.filter(s => s.status === 'New').length,
    critical_signals: signals.filter(s => s.severity >= 60).length,
    open_cases: _store.cases.filter(c => c.status !== 'Closed').length,
    signals_over_time: buckets,
    severity_distribution: sevDist,
    top_sources: topSources,
    top_categories: topCategories,
  };
}

export function getGeoSignals(params?: { limit?: number }): GeoSignal[] {
  return _store.signals
    .filter(s => s.latitude !== null && s.longitude !== null)
    .slice(0, params?.limit ?? 500)
    .map(s => ({
      id: s.id, title: s.title, severity: s.severity, status: s.status,
      source: s.source, latitude: s.latitude, longitude: s.longitude,
      location_name: s.location_name, country_code: s.country_code,
    }));
}

export function getHeatmap(): HeatmapEntry[] {
  const map = new Map<string, { count: number; totalSev: number }>();
  _store.signals.forEach(s => {
    if (!s.country_code) return;
    const entry = map.get(s.country_code) ?? { count: 0, totalSev: 0 };
    entry.count++;
    entry.totalSev += s.severity;
    map.set(s.country_code, entry);
  });
  return [...map.entries()].map(([cc, v]) => ({
    country_code: cc,
    count: v.count,
    avg_severity: Math.round(v.totalSev / v.count),
  }));
}

export function searchSignals(params: { q: string; limit?: number }): Signal[] {
  const q = params.q.toLowerCase();
  return _store.signals
    .filter(s => s.title.toLowerCase().includes(q) || (s.snippet?.toLowerCase().includes(q)))
    .slice(0, params.limit ?? 15);
}

/** Reset store to fresh seed data */
export function resetDemoData() {
  localStorage.removeItem(LS_KEY);
  _store = seed();
}
