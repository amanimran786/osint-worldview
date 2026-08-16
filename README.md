# WorldView

WorldView is an open-source dashboard for exploring global news, geospatial events, infrastructure, markets, and public safety signals in one interface.

**Production:** [osint-worldview-cyan.vercel.app](https://osint-worldview-cyan.vercel.app)

## Capabilities

- Interactive flat map and 3D globe views
- Search across dashboard panels, locations, and tracked signals
- Configurable conflict, weather, outage, infrastructure, aviation, maritime, and natural-event layers
- Regional news and intelligence panels
- Responsive desktop, tablet, and mobile layouts
- Optional local or user-configured AI providers
- Standalone settings and live-channel windows

Availability and freshness depend on each upstream public data source. The interface reports unavailable data instead of fabricating results.

The hosted site is a public-source research dashboard. It is not a case-management system and does not provide team identity, RBAC, evidence storage, or investigator audit trails.

## Local Development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` when using the repository's current development setup. Vite may select another port if that port is occupied.

## Verification

```bash
npm run typecheck:all
npm run test:data
npm run test:sidecar
npm run test:e2e:runtime
npx playwright test e2e/dashboard-ui.spec.ts
npm run build
npm run smoke:production
```

The browser regression suite covers desktop and mobile navigation, search, settings, map controls, responsive overflow, and prohibited promotional copy.

## Production

Vercel deploys `main` through the repository integration. The public production alias is:

```text
https://osint-worldview-cyan.vercel.app
```

The `worldview.app` domain is not currently connected to this Vercel project and should not be used as the application URL.

Production requires Redis, seed jobs, and the Railway relay to pass the checks in [docs/PRODUCTION_RUNBOOK.md](./docs/PRODUCTION_RUNBOOK.md). A successful static deployment alone is not a production-readiness result.

## Data And Attribution

WorldView combines public APIs and open datasets. Map attribution is shown in the map interface where required. Third-party licenses and source notices remain in the repository and must be preserved.

## Security

Do not commit credentials. Configure optional provider keys through local environment files or the desktop settings vault. See [SECURITY.md](./SECURITY.md) for vulnerability reporting.

## License

This repository is distributed under the [GNU Affero General Public License v3](./LICENSE).
