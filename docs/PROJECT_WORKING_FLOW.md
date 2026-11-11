# JnS Enterprise CRM - Project Working Flow

**Document version:** 1.0
**Date:** 11 November 2026
**Audience:** Developers, DevOps, QA, and system administrators

---

## 1. High-Level Architecture

```
                          ┌────────────────────────────────────────────┐
                          │                End users                   │
                          │  Visitors / Managers / Super Admins        │
                          └───────────────────┬────────────────────────┘
                                              │ HTTPS
                          ┌───────────────────▼────────────────────────┐
                          │        Next.js frontend (jnscrm)           │
                          │  App Router, React Server Components       │
                          │  proxy.ts: CSP + auth redirects            │
                          │  /backend/* rewrite to NestJS              │
                          └───────────┬───────────────────┬────────────┘
                                      │                   │
                       Static/ISR pages          /backend proxy
                                      │                   │
                          ┌───────────▼───────────────────▼────────────┐
                          │        NestJS API (jnscrmbackend)          │
                          │  Guards: JWT + Roles + Throttler           │
                          │  CSRF, Helmet, validation, error filter    │
                          └───────────────────┬────────────────────────┘
                                              │ mysql2 pool
                          ┌───────────────────▼────────────────────────┐
                          │                MySQL / MariaDB             │
                          │ users, leads, blogs, blog_categories,      │
                          │ events, pages, revoked_tokens, audit_logs  │
                          └────────────────────────────────────────────┘
```

### 1.1 Key design decisions

- **Single origin for the browser.** The frontend proxies `/backend/*` to the API, so
  authentication cookies are first-party. `SameSite=Lax` (production) is sufficient and
  no cross-site cookie is required.
- **Cookie-based sessions.** Access and refresh tokens are `HttpOnly`, `Secure` in
  production, and never exposed to JavaScript.
- **Defence in depth.** Edge redirect (fast UX) + API JWT/role enforcement (authoritative).
- **Static-first marketing site.** Content pages are prerendered; only data-dependent
  pages are dynamic/ISR.
- **Out-of-band integrations.** Lead CRM forwarding never blocks the public form.

---

## 2. Request Lifecycle

### 2.1 Public page request

1. Browser requests a page (for example `/blog`).
2. `src/proxy.ts` runs first:
   - Decides whether the route is protected.
   - For protected routes, checks the `token` cookie existence/expiry and redirects to
     `/protection/login` when needed.
   - Adds the `Content-Security-Policy` header to the response.
3. Next.js serves a statically prerendered page, or renders a server component.
4. Server components that need data call the backend with an absolute URL from
   `src/lib/serverApi.ts` (`BACKEND_URL`).
5. Response headers from `next.config.ts` add COOP, CORP, HSTS (production),
   permissions policy, and no-store/noindex on `/protection/*`.

### 2.2 Browser API request

1. Client code calls `apiFetch()` in `src/lib/api.ts`.
2. For state-changing methods, `apiFetch` obtains a CSRF token:
   - Reads the `csrf_token` cookie if present, otherwise calls `/backend/csrf-token`.
   - Sends the token in the `X-CSRF-Token` header.
3. Next.js rewrites `/backend/*` to the NestJS API.
4. Browser sends the `token`, `refresh_token`, and `csrf_token` cookies (same origin).
5. If the API returns `403` for CSRF expiry, `apiFetch` fetches a fresh token and retries
   once. If the API returns `401` (expired access token), it calls
   `/backend/auth/refresh` and retries the original request once.

### 2.3 API request pipeline (NestJS)

1. **Helmet** sets security headers and an API CSP.
2. **CORS** validates the `Origin` against `FRONTEND_URLS` (browser cross-origin calls).
3. **Cookie parser** populates `req.cookies`.
4. **CSRF middleware** (state-changing methods only):
   - Rejects `Sec-Fetch-Site: cross-site`.
   - Rejects origins outside the allow-list.
   - For non-exempt paths, verifies that the cookie and header tokens match and that the
     HMAC signature is valid.
5. **Body parsers** enforce `BODY_LIMIT`.
6. **ValidationPipe** whitens DTOs, rejects unknown properties, and transforms types.
7. **ThrottlerGuard** applies global rate limits; route-level `@Throttle` adds stricter
   limits to sensitive endpoints.
8. **JwtAuthGuard / RolesGuard** authenticate and authorise protected routes.
9. Controller calls the service; services use the `mysql2` pool.
10. **AllExceptionsFilter** converts failures to a sanitized JSON envelope:
    `{ statusCode, message, timestamp, path }`.

---

## 3. User Roles and Access

| Role | Registration | Capabilities |
|---|---|---|
| Visitor | Not applicable | Browse public pages, read published blogs, view live events, submit enquiry forms |
| Manager | Self-request with manager secret; requires Super Admin approval | Dashboard, leads, blogs, events, page list |
| Super Admin | Gated registration (flag + secret + optional email domain) | Everything, plus user management, manager approval, destructive page sync |

Authorisation rules:

- `JwtAuthGuard` validates the `token` cookie and confirms the user still exists and is
  approved, with a short-lived in-memory cache.
- `RolesGuard` enforces `@Roles(...)` metadata.
- Super Admin deletion is blocked when only one Super Admin remains.
- Manager approval/rejection only affects `Manager` accounts in `pending` status.

---

## 4. Functional Flows

### 4.1 Visitor: browse and read content

1. Visitor opens a marketing route (for example `/study-in-uk`, `/offices/...`).
2. Prerendered content is served; `proxy.ts` adds CSP, `next.config.ts` adds headers.
3. On `/blog`, the server component fetches `GET /blogs/public?limit=100`. Only
   `status = published` rows are returned; other statuses are never exposed.
4. On `/blog/[slug]`, the server component fetches `GET /blogs/public/:slug`. A missing or
   unpublished slug results in a 404.
5. On `/events`, the public endpoint `GET /events/public` returns only `Live` events.
6. Unknown dynamic routes (`/[...slug]`) call `notFound()` instead of rendering a soft 404.

### 4.2 Visitor: submit an enquiry (lead)

1. The visitor completes a form (contact, consultation, agent registration, etc.).
2. Client `POST /backend/leads` with the form payload. CSRF is exempt for this endpoint
   because the form is public.
3. `LeadsService.create()`:
   - Sanitizes every string field (removes HTML).
   - Inserts the lead into MySQL and receives the new ID.
   - If `CRM_API_URL` is not configured, returns `Lead saved successfully`.
   - If configured, returns immediately with `CRM sync queued`, then forwards to the CRM
     asynchronously with retries (5-second timeout per attempt, exponential backoff, only
     `http`/`https` allowed). Failures are logged; the stored lead remains valid.
4. The API response is sanitized by the global exception filter if anything fails.

### 4.3 Authentication: login

1. User opens `/protection/login`. `proxy.ts` redirects authenticated users to the
   dashboard.
2. Frontend calls `POST /backend/auth/login` (CSRF-exempt, throttled to 10/minute).
3. API checks the `ip|email` lockout state, verifies the bcrypt hash (cost 12), and
   requires `status = approved`.
4. API sets:
   - `token` cookie: JWT access token, 15 minutes, `HttpOnly`.
   - `refresh_token` cookie: JWT refresh token, 7 days, `HttpOnly`.
5. Audit event `login` is recorded.
6. Redirect to `/protection/dashboard`.

### 4.4 Authentication: refresh and logout

**Refresh**
1. `apiFetch` receives `401` and calls `POST /backend/auth/refresh`.
2. API verifies the refresh token signature and user status, checks the revocation store,
   revokes the presented token (rotation), and issues a new access + refresh pair.
3. The original request is retried once.

**Logout**
1. `POST /backend/auth/logout` with the CSRF token.
2. API revokes the refresh token durably and clears both cookies.
3. Audit event `logout` is recorded.

### 4.5 Manager registration and approval

1. A prospective manager submits `POST /auth/register-manager` with the manager secret.
2. Registration is rejected if `ALLOW_MANAGER_REGISTRATION` is false (default in
   production) or the secret is invalid.
3. The account is created with `role = Manager`, `status = pending`.
4. Super Admin views `GET /auth/pending-requests` and calls
   `PATCH /auth/requests` with `approve` or `reject`.
5. Approval updates status to `approved` (audit event `manager_approved`); rejection
   deletes the request (audit event `manager_rejected`).
6. The user cache is invalidated so the change is visible immediately.

### 4.6 Dashboard and lead management

1. Dashboard loads summary metrics from `GET /dashboard/summary` (leads, unread leads,
   pages, blogs, approved users, pending managers) and recent activity.
2. Lead list loads via `GET /leads` with pagination/filtering; page size is clamped.
3. Manager/Super Admin can:
   - Change status with `PATCH /leads/:id/status` (audit `lead_status_updated`).
   - Delete with `DELETE /leads/:id` (audit `lead_deleted`).
4. All calls use `apiFetch`, so expiry is handled transparently.

### 4.7 Blog management and publishing

1. Manager/Super Admin uses `admin/blogs` endpoints (JWT + role guard, 10 requests/minute).
2. Create/update actions sanitize HTML on the server and generate unique slugs.
3. Status changes are performed with `PATCH /admin/blogs/:id/status`.
4. Public consumers can only see `published` posts through `blogs/public`.
5. Frontend `blogService` also sanitizes content before sending, using the shared
   `@/lib/sanitize` configuration.

### 4.8 Event management

1. Admin endpoints under `admin/events` (JWT + role guard, 10 requests/minute) provide
   list, create, update, and delete.
2. The public endpoint `GET /events/public` returns only `Live` events.
3. The frontend renders the event list and detail pages from that public data.

### 4.9 Page scanner and synchronisation

1. Super Admin triggers `POST /admin/pages/scan` (5 requests/minute).
2. The service calls the GitHub API for the configured repository and reads the recursive
   tree under `jnscrm/src/app/`.
3. Detected routes are compared with the `pages` table and reported as inserts, updates,
   and would-be removals.
4. Removal only runs when the request explicitly sets both `removeMissing = true` and
   `confirmDestructive = true`, and at least one page was scanned. This prevents an API
   or credential failure from wiping the page catalogue.
5. `POST /admin/pages/save` persists manual edits; corrupted or failed GitHub calls return
   a controlled error instead of partial destructive changes.

### 4.10 Health monitoring

1. Monitoring calls `GET /health`.
2. The controller runs `SELECT 1`.
3. Success returns `{ status: "ok", database: "up", uptime, timestamp }`.
4. Database failure returns HTTP 503 with `{ status: "unhealthy", database: "down" }`,
   suitable for load-balancer and uptime checks.

---

## 5. Security Controls Flow

| Layer | Control | Where |
|---|---|---|
| Edge | CSP, protected-route redirects | `jnscrm/src/proxy.ts` |
| HTTP headers | HSTS (prod), COOP, CORP, frame denial, referrer policy | `next.config.ts`, Helmet |
| CSRF | Signed double-submit cookie + header, Origin and fetch-site checks | `jnscrmbackend/src/main.ts` |
| Authentication | JWT in HttpOnly cookies, 15-minute access token, 7-day refresh | `auth.controller.ts` |
| Revocation | Durable `revoked_tokens` table, SHA-256 hashes, TTL cleanup | `auth.service.ts` |
| Brute force | Per-`ip|email` lockout and endpoint throttles | `auth.service.ts`, controllers |
| Input safety | DTO validation, whitelisting, HTML sanitisation | `ValidationPipe`, services |
| Authorisation | Role guard and approval checks | `jwt-auth.guard.ts`, `roles.guard.ts` |
| Error safety | Sanitized responses, internal logging | `all-exceptions.filter.ts` |
| Audit | Append-only privileged-action trail | `audit.service.ts` |

---

## 6. Data Flow Summary

```
Enquiry form ──► /backend/leads ──► sanitize ──► INSERT leads ──► (async) CRM webhook
Login ──► /backend/auth/login ──► bcrypt + status check ──► set cookies ──► audit
Refresh ──► /backend/auth/refresh ──► revoke old ──► issue new pair
Blog admin ──► sanitize + slug ──► blogs table ──► public API (published only) ──► frontend
Pages scan ──► GitHub API ──► diff ──► optional confirmed deletes ──► pages table
Health check ──► SELECT 1 ──► 200/503
```

---

## 7. Environments and Configuration

### 7.1 Backend variables (essential)

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | HTTP port (default 4000) |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | MySQL connection |
| `DATABASE_SSL`, `DATABASE_SSL_REJECT_UNAUTHORIZED` | TLS to the database |
| `JWT_SECRET`, `CSRF_SECRET` | Independent secrets, at least 32 characters |
| `FRONTEND_URLS` | Comma-separated CORS/CSRF allow-list; HTTPS required in production |
| `ALLOW_SUPER_ADMIN_REGISTRATION`, `ALLOW_MANAGER_REGISTRATION` | Registration gates (default false in production) |
| `SUPER_ADMIN_SECRET_KEY`, `MANAGER_SECRET_KEY` | Required only when the matching flag is true |
| `SUPER_ADMIN_EMAIL_DOMAIN` | Optional domain restriction for Super Admin sign-up |
| `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN` | Page scanner |
| `CRM_API_URL`, `CRM_API_TOKEN` | Optional lead webhook |
| `THROTTLE_TTL_MS`, `THROTTLE_LIMIT` | Global rate limit |
| `BODY_LIMIT` | Request body size limit |
| `TRUST_PROXY` | Express trust-proxy setting (`0` when not behind a proxy) |
| `REQUEST_TIMEOUT_MS`, `HEADERS_TIMEOUT_MS`, `KEEP_ALIVE_TIMEOUT_MS` | Server timeouts |

### 7.2 Frontend variables

| Variable | Purpose | Default |
|---|---|---|
| `BACKEND_URL` | Absolute URL used by server components and the rewrite | Production: `https://jnscrmbackend.vercel.app`; development: `http://localhost:4000` |
| `SITE_URL` | Canonical site URL for metadata, sitemap, robots | `https://jnsedu.com` |

---

## 8. Build, Test, and Release Flow

```
Developer push / PR
        │
        ▼
GitHub Actions
  ├─ backend: npm ci → lint → tsc → unit → e2e → nest build
  └─ frontend: npm ci → lint → tsc → next build
        │
        ▼
Deploy frontend (Next.js hosting) + backend (Node host)
        │
        ▼
Apply DB migration (one time per environment)
        │
        ▼
Smoke test: /, /blog, /events, /health, login, dashboard
```

Local commands:

```bash
# Backend
cd jnscrmbackend
npm run lint
npx tsc --noEmit -p tsconfig.json
npm test
npm run test:e2e
npm run build

# Frontend
cd jnscrm
npm run lint
npx tsc --noEmit
npm run build
```

---

## 9. Failure and Recovery Behaviour

| Failure | Behaviour |
|---|---|
| Backend unavailable | Server components render without data where handled; public forms return error to the user; monitoring flags `/health` |
| Database unavailable | `/health` returns 503; data endpoints return sanitized 5xx |
| CRM webhook failure | Lead is stored; retries occur in the background; failure is logged; no user-facing error |
| Refresh token reuse | Token is revoked and refresh fails; user must log in again |
| Audit insert failure | Logged as a warning; the original operation still succeeds |
| GitHub API failure during page scan | Controlled error; no destructive change occurs |
| Missing revocation table | In-memory revocation remains active for the process lifetime |
| CSRF token expiry | Client fetches a fresh token and retries once |
| Access token expiry | Client refreshes and retries once |

---

## 10. Operational Runbook

1. **First deployment**
   - Provision MySQL and create the database.
   - Apply `jnscrmbackend/db/migrations/001_hardening.sql`.
   - Set backend and frontend environment variables.
   - Deploy backend, then frontend.
   - Create the first Super Admin via the gated registration endpoint, then disable the
     registration flag.
2. **Routine**
   - Monitor `/health` and error logs.
   - Review `audit_logs` for privileged actions.
   - Rotate secrets on schedule and after any suspected exposure.
3. **Incident**
   - Revoke sessions by clearing `revoked_tokens` policy or rotating `JWT_SECRET`
     (which invalidates all sessions).
   - Disable registration flags.
   - Preserve audit logs before remediation.
