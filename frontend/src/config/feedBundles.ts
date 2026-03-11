import type { SiteVariant } from './variants';

export interface FeedBundle {
  gdeltQuery: string;
  gdeltMaxRecords: number;
  cyberLimit: number;
  includeRansomware: boolean;
  includeCountryThreats: boolean;
  includeSpaceWeather: boolean;
  includeNasa: boolean;
}

export const FEED_BUNDLES: Record<SiteVariant, FeedBundle> = {
  world: {
    gdeltQuery: 'conflict OR crisis OR attack OR sanctions OR military',
    gdeltMaxRecords: 50,
    cyberLimit: 100,
    includeRansomware: true,
    includeCountryThreats: true,
    includeSpaceWeather: true,
    includeNasa: true,
  },
  tech: {
    gdeltQuery: 'cyber OR ai OR startup OR breach OR vulnerability',
    gdeltMaxRecords: 60,
    cyberLimit: 150,
    includeRansomware: true,
    includeCountryThreats: true,
    includeSpaceWeather: true,
    includeNasa: false,
  },
  finance: {
    gdeltQuery: 'market OR inflation OR rates OR sanctions OR trade',
    gdeltMaxRecords: 60,
    cyberLimit: 80,
    includeRansomware: true,
    includeCountryThreats: true,
    includeSpaceWeather: false,
    includeNasa: false,
  },
  commodity: {
    gdeltQuery: 'oil OR gas OR mining OR supply chain OR shipping',
    gdeltMaxRecords: 60,
    cyberLimit: 70,
    includeRansomware: false,
    includeCountryThreats: true,
    includeSpaceWeather: false,
    includeNasa: false,
  },
  happy: {
    gdeltQuery: 'breakthrough OR innovation OR recovery OR climate progress',
    gdeltMaxRecords: 45,
    cyberLimit: 30,
    includeRansomware: false,
    includeCountryThreats: false,
    includeSpaceWeather: true,
    includeNasa: true,
  },
};

