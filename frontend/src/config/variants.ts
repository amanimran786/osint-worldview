export type SiteVariant = 'world' | 'tech' | 'finance' | 'commodity' | 'happy';

export interface VariantMeta {
  id: SiteVariant;
  name: string;
  shortName: string;
  tagline: string;
  accentClass: string;
  focus: string;
}

export const VARIANTS: VariantMeta[] = [
  {
    id: 'world',
    name: 'World Monitor',
    shortName: 'WORLD',
    tagline: 'Geopolitics, conflicts, strategic posture',
    accentClass: 'text-amber',
    focus: 'Global security and threat intelligence',
  },
  {
    id: 'tech',
    name: 'Tech Monitor',
    shortName: 'TECH',
    tagline: 'AI labs, startups, cyber operations',
    accentClass: 'text-cyan-400',
    focus: 'Technology ecosystem and cyber dynamics',
  },
  {
    id: 'finance',
    name: 'Finance Monitor',
    shortName: 'FINANCE',
    tagline: 'Markets, macro signals, policy risk',
    accentClass: 'text-emerald-400',
    focus: 'Cross-market movements and risk sentiment',
  },
  {
    id: 'commodity',
    name: 'Commodity Monitor',
    shortName: 'COMMODITY',
    tagline: 'Energy, metals, supply chain chokepoints',
    accentClass: 'text-orange-400',
    focus: 'Resource flow and infrastructure exposure',
  },
  {
    id: 'happy',
    name: 'Happy Monitor',
    shortName: 'HAPPY',
    tagline: 'Positive breakthroughs and resilience',
    accentClass: 'text-yellow-300',
    focus: 'Uplifting signals, innovation, recovery',
  },
];

const VARIANT_BY_ID = new Map(VARIANTS.map((v) => [v.id, v]));
export const VARIANT_STORAGE_KEY = 'wv-site-variant';

export function parseVariant(input?: string | null): SiteVariant {
  if (!input) return 'world';
  return VARIANT_BY_ID.has(input as SiteVariant) ? (input as SiteVariant) : 'world';
}

export function getVariantMeta(variant: SiteVariant): VariantMeta {
  const fromMap = VARIANT_BY_ID.get(variant);
  if (fromMap) return fromMap;
  return VARIANTS[0] as VariantMeta;
}
