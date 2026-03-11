# Stack Alignment with `koala73/worldmonitor`

This repository does not share the same base architecture as `koala73/worldmonitor`.

- `worldmonitor`: single TypeScript app shell, edge/serverless API surface, multi-variant runtime.
- `osint-worldview`: React frontend + FastAPI backend + Celery workers.

Because of that mismatch, direct file replacement is a rewrite, not an upgrade.

## Adopted now

The frontend now follows the World Monitor multi-variant runtime model:

- Variant model: `world`, `tech`, `finance`, `commodity`, `happy`
- Persisted variant selection in local storage
- Runtime variant metadata wired into app shell
- Variant-aware branding in sidebar/header/dashboard/map views
- Command palette (`Cmd/Ctrl+K`) for route and variant switching
- Map layer quick presets (Strategic, Climate, Cyber, Full Spectrum)
- Variant-specific layer defaults and preset packs
- Adaptive map-layer refresh loop with hidden-tab throttle and backoff

The upstream repository is vendored locally for capability-port work:

- `integrations/worldmonitor-koala73/`

## Files added for this adoption

- `frontend/src/config/variants.ts`
- `frontend/src/contexts/VariantContext.tsx`
- `frontend/src/components/CommandPalette.tsx`

## Next alignment phases

1. Add per-variant feed bundles and panel defaults.
2. Port worldmonitor aggregation/cache patterns into FastAPI service modules.
3. Add typed service contracts for domain APIs (market, seismology, climate, conflict, maritime).
4. Introduce local-LLM fallback chain for AI summary/deduction flows.
