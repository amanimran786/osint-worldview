export const SITE_VARIANT: string = (() => {
  if (typeof window === 'undefined') return import.meta.env.VITE_VARIANT || 'full';

  const variants = new Set(['tech', 'full', 'finance', 'happy', 'commodity']);
  const requested = new URLSearchParams(location.search).get('variant');
  if (requested && variants.has(requested)) return requested;

  const isTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
  if (isTauri) {
    const stored = localStorage.getItem('worldview-variant');
    if (stored && variants.has(stored)) return stored;
    return import.meta.env.VITE_VARIANT || 'full';
  }

  const h = location.hostname;
  if (h.startsWith('tech.')) return 'tech';
  if (h.startsWith('finance.')) return 'finance';
  if (h.startsWith('happy.')) return 'happy';
  if (h.startsWith('commodity.')) return 'commodity';

  const stored = localStorage.getItem('worldview-variant');
  if (stored && variants.has(stored)) return stored;

  return import.meta.env.VITE_VARIANT || 'full';
})();
