import type { DataLayerKey } from '../types';
import type { SiteVariant } from './variants';

export interface MapPreset {
  key: string;
  label: string;
  layers: DataLayerKey[];
}

export const VARIANT_DEFAULT_LAYERS: Record<SiteVariant, DataLayerKey[]> = {
  world: ['signals', 'earthquakes', 'weather', 'disasters', 'flights', 'gdeltNews', 'maritime'],
  tech: ['signals', 'cyber', 'gdeltNews', 'ransomware', 'countryThreats', 'flights'],
  finance: ['signals', 'gdeltNews', 'countryThreats', 'ransomware', 'maritime', 'weather'],
  commodity: ['signals', 'disasters', 'fires', 'weather', 'maritime', 'countryThreats'],
  happy: ['signals', 'nasaEvents', 'spaceWeather', 'earthquakes', 'weather', 'fires'],
};

export const MAP_PRESETS_BY_VARIANT: Record<SiteVariant, MapPreset[]> = {
  world: [
    { key: 'strategic', label: 'Strategic', layers: ['signals', 'flights', 'maritime', 'countryThreats'] },
    { key: 'climate', label: 'Climate', layers: ['signals', 'earthquakes', 'weather', 'disasters', 'fires', 'spaceWeather'] },
    { key: 'crisis', label: 'Crisis', layers: ['signals', 'gdeltNews', 'countryThreats', 'disasters', 'ransomware'] },
    { key: 'full', label: 'Full Spectrum', layers: ['signals', 'earthquakes', 'weather', 'disasters', 'flights', 'nasaEvents', 'fires', 'spaceWeather', 'gdeltNews', 'countryThreats', 'ransomware', 'maritime'] },
  ],
  tech: [
    { key: 'cyber-ops', label: 'Cyber Ops', layers: ['signals', 'cyber', 'ransomware', 'gdeltNews'] },
    { key: 'infra', label: 'Infra', layers: ['signals', 'countryThreats', 'weather', 'disasters'] },
    { key: 'mobility', label: 'Mobility', layers: ['signals', 'flights', 'maritime'] },
  ],
  finance: [
    { key: 'risk', label: 'Risk Radar', layers: ['signals', 'countryThreats', 'gdeltNews', 'ransomware'] },
    { key: 'logistics', label: 'Logistics', layers: ['signals', 'maritime', 'flights', 'weather'] },
    { key: 'macro', label: 'Macro Pulse', layers: ['signals', 'gdeltNews', 'earthquakes', 'disasters'] },
  ],
  commodity: [
    { key: 'energy', label: 'Energy', layers: ['signals', 'weather', 'disasters', 'maritime'] },
    { key: 'supply', label: 'Supply Chain', layers: ['signals', 'maritime', 'flights', 'countryThreats'] },
    { key: 'hazards', label: 'Hazards', layers: ['signals', 'fires', 'earthquakes', 'weather', 'disasters'] },
  ],
  happy: [
    { key: 'recovery', label: 'Recovery', layers: ['signals', 'nasaEvents', 'weather', 'spaceWeather'] },
    { key: 'nature', label: 'Nature', layers: ['signals', 'fires', 'earthquakes', 'weather'] },
    { key: 'science', label: 'Science', layers: ['signals', 'nasaEvents', 'spaceWeather', 'gdeltNews'] },
  ],
};

