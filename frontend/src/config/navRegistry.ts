import type { SiteVariant } from './variants';

export interface NavItem {
  to: string;
  label: string;
  variants: SiteVariant[];
}

const ALL: SiteVariant[] = ['world', 'tech', 'finance', 'commodity', 'happy'];

export const NAV_REGISTRY: NavItem[] = [
  { to: '/', label: 'Dashboard', variants: ALL },
  { to: '/signals', label: 'Signals', variants: ALL },
  { to: '/map', label: 'World View', variants: ALL },
  { to: '/analytics', label: 'Analytics', variants: ALL },
  { to: '/cases', label: 'Cases', variants: ALL },
  { to: '/rules', label: 'Rules', variants: ALL },
  { to: '/sources', label: 'Sources', variants: ALL },
  { to: '/scanner', label: 'Scanner', variants: ['world', 'tech', 'finance', 'commodity'] },
  { to: '/surveillance', label: 'Surveillance', variants: ['world', 'tech', 'commodity', 'happy'] },
  { to: '/airspace', label: 'Airspace', variants: ['world', 'finance', 'commodity'] },
  { to: '/maritime', label: 'Maritime', variants: ['world', 'finance', 'commodity'] },
  { to: '/god-mode', label: '4D God Mode', variants: ['world', 'tech'] },
  { to: '/osint-bible', label: 'OSINT Bible', variants: ['world', 'tech'] },
  { to: '/settings', label: 'Settings', variants: ALL },
];

export function getNavForVariant(variant: SiteVariant) {
  return NAV_REGISTRY.filter((item) => item.variants.includes(variant));
}

