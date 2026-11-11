# JnS Enterprise CRM - Brief Project Report

**Document version:** 1.0
**Date:** 11 November 2026
**Prepared by:** Engineering (hardening and documentation pass)
**Repositories covered:** `jnscrm` (public website + admin console), `jnscrmbackend` (REST API)

---

## 1. Purpose

This report summarizes the architecture of the JnS Enterprise platform, the work completed
during the security and reliability hardening pass, the verification evidence, and the
operational actions that remain before production release.

## 2. System Overview

The platform consists of two independently deployable applications:

| Component | Technology | Responsibility |
|---|---|---|
| `jnscrm` | Next.js 16.3.4 (App Router), React 19, Tailwind CSS v4 | Public marketing site, blog/event pages, enquiry forms, protected admin console, CSP and edge routing |
| `jnscrmbackend` | NestJS 11, Express, MySQL (`mysql2` pool), JWT, bcrypt, Helmet | Authentication, lead intake, CMS (blogs/events/pages), dashboard statistics, audit trail, health probe |

The browser always talks to the frontend origin under `/backend/*`. Next.js rewrites that
prefix to the NestJS service, which keeps cookies first-party and removes cross-origin
credential handling from the browser.

```
Browser ──HTTPS──► Next.js (proxy.ts + /backend rewrite) ──HTTPS──► NestJS ──► MySQL
                          │
                          └── Static/ISR pages, CSP, auth redirects
```

## 3. Delivered Work (Hardening Pass)

### 3.1 Backend

- **Configuration**: strict environment validation, placeholder/weak-secret rejection,
  minimum secret lengths, production HTTPS enforcement for `FRONTEND_URLS`, and
  registration secrets validated only when their feature flags are enabled.
- **Transport and cookies**: Helmet with an API-specific CSP, explicit CORS allow-list,
  `trust proxy` parsing that honours `0`, `cookie-parser`, HTTP server timeouts, and
  `x-powered-by` disabled.
- **CSRF**: HMAC-SHA256 signed double-submit tokens, constant-time comparison,
  `Sec-Fetch-Site: cross-site` rejection, Origin allow-list, and CSRF-exempt public
  endpoints. Exemptions: `/leads`, `/auth/login`, `/auth/register-super-admin`,
  `/auth/register-manager`.
- **Authentication**: registration gated by role with secure-by-default production
  behaviour, bcrypt cost 12, per-`ip|email` login lockout, access-token rotation,
  durable refresh-token revocation (`revoked_tokens` with in-memory fallback), and
  audit events for privileged actions.
- **Authorisation**: JWT guard plus role guard (`Super-Admin`, `Manager`), with cached
  user lookups, approval-status checks, and last-super-admin protection.
- **Error handling**: global exception filter that logs detail internally and returns a
  sanitized JSON envelope.
- **Leads**: non-blocking CRM synchronization with bounded retries, protocol validation
  and timeout; the public form no longer depends on the third party.
- **Content APIs**: published-only public blog endpoints; public events limited to
  `Live` status; page scanner requires explicit destructive confirmation.
- **Observability**: `/health` performs a database probe and returns 503 on failure.
- **Audit**: append-only `audit_logs` writer that never breaks the primary request.
- **Database**: idempotent migration adding `revoked_tokens`, `audit_logs`, and query
  indexes.

### 3.2 Frontend

- Removed all direct MySQL access from the Next.js app; server components now consume
  the public backend API.
- Added `src/lib/serverApi.ts` for absolute server-side backend URLs.
- Added a CSP and authentication redirect layer in `src/proxy.ts`, with a policy that
  works with statically prerendered pages.
- Added hardened response headers (COOP, CORP, DNS prefetch, cross-domain policies,
  HSTS in production, `no-store`/`noindex` for protected routes).
- Added automatic access-token refresh and CSRF-token retry in `src/lib/api.ts`;
  dashboard and admin calls use it uniformly.
- Reused the shared HTML sanitizer for blog content.
- Added SEO metadata, a real 404 for unknown dynamic pages, `robots.ts`, and
  `sitemap.ts`.

### 3.3 Delivery and Repository Hygiene

- GitHub Actions CI for both projects (lint, typecheck, unit and e2e tests, builds).
- Dependabot configuration for npm and GitHub Actions.
- Untracked the TypeScript incremental build artifact and added it to `.gitignore`.
- Replaced `.env.example` with placeholders and regenerated strong local secrets.

## 4. Verification Evidence

| Check | Result |
|---|---|
| Backend `tsc --noEmit` | Pass |
| Backend `oxlint` | Pass |
| Backend `nest build` | Pass |
| Backend unit tests | 20 / 20 pass |
| Backend e2e tests | 11 pass, 1 pre-existing skip |
| Frontend `tsc --noEmit` | Pass |
| Frontend ESLint | Pass |
| Frontend production build | Pass (37 routes, proxy active) |

## 5. Residual Risks and Required Operations

| Item | Owner | Action |
|---|---|---|
| Migration not applied | DBA / DevOps | Run `db/migrations/001_hardening.sql` |
| Secrets previously committed | Security | Rotate credentials and purge Git history |
| Production configuration | DevOps | Set `FRONTEND_URLS` (https), `BACKEND_URL`, `SITE_URL`, strong `JWT_SECRET`/`CSRF_SECRET` |
| Uncommitted new files | Engineering | Commit all tracked changes and new files (`src/audit`, `src/dashboard`, `src/health`, `src/common`, `db`, `src/lib/api.ts`, `src/lib/serverApi.ts`, new pages) |
| CSP trade-off | Security | `script-src` uses `'unsafe-inline'` to support statically prerendered pages; nonce CSP would require fully dynamic rendering |

## 6. Conclusion

All planned code-level hardening tasks are complete and verified. The platform is ready
for staged deployment once the operational items in Section 5 are executed.
