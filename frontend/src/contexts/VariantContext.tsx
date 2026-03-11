import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getVariantMeta,
  parseVariant,
  VARIANTS,
  VARIANT_STORAGE_KEY,
  type SiteVariant,
  type VariantMeta,
} from '../config/variants';

interface VariantContextValue {
  variant: SiteVariant;
  variantMeta: VariantMeta;
  variants: VariantMeta[];
  setVariant: (next: SiteVariant) => void;
}

const VariantContext = createContext<VariantContextValue | null>(null);

function resolveInitialVariant(): SiteVariant {
  const storedRaw = localStorage.getItem(VARIANT_STORAGE_KEY);
  if (storedRaw) return parseVariant(storedRaw);
  return parseVariant(import.meta.env.VITE_SITE_VARIANT);
}

export function VariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<SiteVariant>(resolveInitialVariant);

  useEffect(() => {
    localStorage.setItem(VARIANT_STORAGE_KEY, variant);
    document.documentElement.setAttribute('data-variant', variant);
  }, [variant]);

  const value = useMemo<VariantContextValue>(() => ({
    variant,
    variantMeta: getVariantMeta(variant),
    variants: VARIANTS,
    setVariant,
  }), [variant]);

  return (
    <VariantContext.Provider value={value}>
      {children}
    </VariantContext.Provider>
  );
}

export function useVariant() {
  const ctx = useContext(VariantContext);
  if (!ctx) {
    throw new Error('useVariant must be used inside VariantProvider');
  }
  return ctx;
}
