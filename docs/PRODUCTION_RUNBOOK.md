# Production Runbook

## Release Gate

Run the repository gate before promotion:

```bash
npm ci
npm run typecheck:all
npm run test:data
npm run test:sidecar
npm run build
npx playwright test e2e/dashboard-ui.spec.ts
```

The same checks run in `.github/workflows/web-quality.yml`.

## Required Hosted Services

The public application shell can render without provider credentials, but the
investigation data plane is not ready without these production dependencies:

| Dependency | Required variables | Readiness evidence |
| --- | --- | --- |
| Upstash Redis | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Compact health is not `REDIS_DOWN`; fast and slow bootstrap return populated data |
| Railway relay | `WS_RELAY_URL`, `RELAY_SHARED_SECRET`, `RELAY_AUTH_HEADER` | Relay `/health` is reachable; military-flight and Telegram probes return 200 |
| Telegram poller | `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_SESSION`, `TELEGRAM_CHANNEL_SET` | Relay health reports Telegram enabled with a recent poll |
| Desktop API access | `WORLDMONITOR_VALID_KEYS` | Desktop cloud requests reject missing and invalid keys |
| Cache administration | `CACHE_PURGE_SECRET` | Secret differs from `RELAY_SHARED_SECRET`; unauthorized purge returns 401 |

Provider-specific credentials in `.env.example` are required only for the panels
that consume those providers.

## Seed Jobs

Schedule the seed scripts listed in `docs/architecture/ARCHITECTURE.md` on Railway
or an equivalent scheduler. Every seed runtime must use the same production Redis
credentials as Vercel. Run each job once after initial configuration and after a
cache migration.

Check seed freshness with an authenticated request:

```bash
curl -fsS \
  -H "User-Agent: WorldView-Operator/1.0" \
  -H "X-WorldView-Key: $WORLDVIEW_API_KEY" \
  https://osint-worldview-cyan.vercel.app/api/seed-health
```

A `degraded` result returns HTTP 503 and blocks approval.

## Production Verification

After Vercel reports a successful production deployment, run:

```bash
npm run smoke:production
```

The smoke test requires:

- root HTML and security headers
- a working version endpoint
- health status `HEALTHY` or `WARNING`
- populated fast and slow bootstrap tiers
- working military-flight and Telegram endpoints

The smoke test retries while Vercel promotes the alias. Do not approve a release
based only on the root page returning HTTP 200.

## Team Access

This repository does not implement user identity or RBAC. For a team-private
deployment, enable Vercel Deployment Protection or an equivalent identity layer
before sharing the URL. Do not store restricted evidence, case notes, or personal
data in WorldView until server-side authorization and audit logging are implemented.

## Rollback

1. Promote the last known-good Vercel deployment or revert the release commit.
2. Leave Redis data intact unless a schema or key migration is the incident cause.
3. Disable `JARVIS_OSINT_API_ENABLED` if Jarvis authorization or quotas are uncertain.
4. Re-run `npm run smoke:production` against the restored production alias.
