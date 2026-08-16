# Security Audit

Date: 2026-08-15

Status: Production approval withheld pending hosted-service and access-control verification.

## Scope

This audit covers the repository, its Vercel edge routes, browser application,
desktop integration boundaries, release workflows, and public production probes.
It is not a penetration test of Vercel, Railway, Upstash, Jarvis, or upstream
data providers.

## Verified Controls

- No committed secret values were detected in the tracked worktree.
- Environment files are ignored while `.env.example` remains tracked.
- Production defines CSP, HSTS, frame, referrer, permissions, and MIME-sniffing headers.
- RSS requests use a domain allowlist and external HTML is sanitized at high-risk render points.
- Desktop cloud fallback requires configured API keys.
- The hosted Jarvis OSINT proxy is disabled by default and requires an explicit API key when enabled.
- Cache purge uses a dedicated secret and protects durable keys on explicit and pattern paths.
- Privileged rate limits can fail closed when their Redis dependency is unavailable.
- Pull requests and `main` run type checks, unit/data tests, API tests, a production build, and focused browser tests.

## Open Production Blocks

### Hosted identity and roles

The repository does not implement user sessions, team membership, role-based
authorization, or investigator audit trails. CORS, Origin, Referer, and user-agent
checks are request filters, not authentication.

The public deployment is suitable only for public-source browsing. Enable Vercel
Deployment Protection or another identity provider before treating it as a
team-private investigation system. Do not store case notes, personal data, or
restricted evidence in the application.

### Data-plane dependencies

The production Redis and Railway relay were not configured at audit time.
Bootstrap, military-flight, Telegram, and seed-health probes therefore failed.
Production approval requires the environment and seed checks in
`docs/PRODUCTION_RUNBOOK.md` to pass.

### Detailed health access

`/api/health?compact=1` is a public liveness/readiness signal. Detailed health
requires a configured WorldView API key. Detailed records must not include secret
values or raw provider errors.

### CSP hardening

The current CSP permits broad HTTPS/WSS connections and inline styles because the
dashboard integrates many public data and media sources. Narrowing those origins
requires an observed CSP report-only rollout so required sources are not broken.

## Release Decision

Code changes may merge only after the Web Quality Gate passes. A deployment is
operationally ready only when Production Readiness Smoke reports `ready` and the
compact health endpoint reports `HEALTHY` or an explicitly reviewed `WARNING`.

No document or CI result should describe WorldView as secure, production-ready,
or bug-free without a dated test run and live dependency probes.
