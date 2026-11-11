# Software Requirements Specification (SRS)

**Project:** JnS Enterprise CRM and Public Website
**Document version:** 1.0
**Date:** 11 November 2026
**Status:** Baseline
**Prepared by:** Engineering

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification defines the functional and non-functional
requirements for the JnS Enterprise platform, comprising a public marketing website
(`jnscrm`) and a content/CRM API (`jnscrmbackend`). It is the reference for development,
testing, security review, and acceptance.

### 1.2 Scope

The system provides:

- A public, search-engine-optimised website with marketing pages, offices, events, and a
  blog.
- Public enquiry capture with optional forwarding to an external CRM.
- A protected administrative console for dashboard metrics, lead management, blog and
  event publishing, page inventory synchronisation, and user administration.
- Authentication and authorisation for staff roles.
- Security, audit, and operational controls appropriate for production use.

Out of scope: payment processing, applicant/student records, third-party CRM
implementation, and native mobile applications.

### 1.3 Definitions and Acronyms

| Term | Meaning |
|---|---|
| SRS | Software Requirements Specification |
| JWT | JSON Web Token |
| CSRF | Cross-Site Request Forgery |
| CSP | Content Security Policy |
| RBAC | Role-Based Access Control |
| ISR | Incremental Static Regeneration |
| CRM | Customer Relationship Management |
| Super Admin | Highest-privilege staff role |
| Manager | Standard staff role requiring approval |
| Lead | An enquiry submitted through a public form |

### 1.4 References

- OWASP Application Security Verification Standard (ASVS)
- OWASP Cross-Site Request Forgery Prevention Cheat Sheet
- NestJS 11 documentation
- Next.js 16 App Router documentation
- MySQL 8 / MariaDB reference manual

### 1.5 Document Overview

Section 2 describes the product context. Section 3 defines functional requirements.
Section 4 defines external interfaces. Section 5 defines non-functional requirements.
Section 6 defines data requirements. Section 7 defines acceptance criteria.
Section 8 provides requirement traceability. Section 9 lists the API catalogue.

---

## 2. Overall Description

### 2.1 Product Perspective

The platform is a two-tier web system. The Next.js frontend is the only origin the
browser interacts with; it proxies `/backend/*` to the NestJS API. This design keeps
cookies first-party, simplifies CSRF and CORS, and allows the public site to be
statically optimised while the administrative console remains dynamic.

### 2.2 Product Functions

1. Public content delivery (pages, blog, events, offices).
2. Enquiry capture and lead persistence.
3. Authentication, session refresh, logout, and account approval.
4. Dashboard reporting.
5. Lead lifecycle management.
6. Blog and blog-category management.
7. Event management.
8. Page inventory scanning and synchronisation.
9. User administration.
10. Audit logging, health monitoring, and rate limiting.

### 2.3 User Classes and Characteristics

| User class | Technical skill | Frequency | Privileges |
|---|---|---|---|
| Visitor | Low | Occasional | Public read, form submission |
| Manager | Medium | Daily | Dashboard, leads, blogs, events, page list |
| Super Admin | Medium/High | Daily/administrative | All Manager functions plus user management, destructive sync, approvals |
| Operator/DevOps | High | Continuous | Deployment, configuration, monitoring |
| External CRM | System | Event-driven | Receives forwarded leads |

### 2.4 Operating Environment

| Element | Requirement |
|---|---|
| Client | Modern evergreen browser with JavaScript enabled |
| Frontend runtime | Node.js 20+, Next.js 16 |
| Backend runtime | Node.js 20+, NestJS 11 |
| Database | MySQL 8 or MariaDB 10.5+ |
| Transport | HTTPS in production |
| Hosting | Any Node-capable platform; frontend and backend may be separate |

### 2.5 Design and Implementation Constraints

- The browser must use the frontend origin for API calls; direct cross-origin calls are
  restricted to the configured allow-list.
- Authentication tokens must remain in `HttpOnly` cookies and never be exposed to client
  JavaScript.
- All state-changing browser requests must carry a valid signed CSRF token, except
  explicitly exempt public endpoints.
- Registration endpoints must be disabled by default in production.
- The public site must continue to work without JavaScript for core content.
- Secrets and configuration must be provided through environment variables.

### 2.6 Assumptions and Dependencies

- A MySQL-compatible database is available and reachable from the API.
- TLS termination is provided by the hosting platform or reverse proxy.
- The external CRM, when enabled, accepts HTTP POST JSON with optional bearer auth.
- GitHub API access is available for the page scanner.
- Email delivery, if required in future, will be provided by an external service.

---

## 3. Functional Requirements

Requirement identifiers use the form `FR-<area>-<number>`.

### 3.1 Public Content

| ID | Requirement |
|---|---|
| FR-PUB-01 | The system shall render predefined marketing, office, and service pages. |
| FR-PUB-02 | The system shall return a 404 status for unknown routes. |
| FR-PUB-03 | The system shall expose only published blog posts through public endpoints. |
| FR-PUB-04 | The system shall expose only events with `Live` status through public endpoints. |
| FR-PUB-05 | The system shall provide canonical metadata, Open Graph tags, `robots.txt`, and `sitemap.xml`. |
| FR-PUB-06 | Public content shall remain available when the backend is temporarily unavailable, except for data-dependent sections. |

### 3.2 Enquiry Capture

| ID | Requirement |
|---|---|
| FR-LEAD-01 | The system shall accept public enquiries without authentication. |
| FR-LEAD-02 | The system shall sanitize all submitted text before storage. |
| FR-LEAD-03 | The system shall persist each enquiry with form type, payload, source URL, status, and timestamp. |
| FR-LEAD-04 | The system shall never block the enquiry response on external CRM availability. |
| FR-LEAD-05 | When a CRM URL is configured, the system shall forward the lead asynchronously with bounded retries, a timeout, and protocol validation. |
| FR-LEAD-06 | CRM failures shall be logged and shall not invalidate the stored lead. |

### 3.3 Authentication and Session Management

| ID | Requirement |
|---|---|
| FR-AUTH-01 | The system shall authenticate users with email and password. |
| FR-AUTH-02 | The system shall store passwords using bcrypt with a cost factor of at least 12. |
| FR-AUTH-03 | The system shall issue a short-lived access token and a longer-lived refresh token in `HttpOnly` cookies. |
| FR-AUTH-04 | The system shall support refresh-token rotation and revoke the presented token on refresh. |
| FR-AUTH-05 | The system shall persist revoked refresh tokens so revocation survives process restarts. |
| FR-AUTH-06 | The system shall lock an account temporarily after repeated failed logins keyed by IP and email. |
| FR-AUTH-07 | The system shall require an approved status before issuing sessions. |
| FR-AUTH-08 | The system shall provide logout that revokes the refresh token and clears cookies. |
| FR-AUTH-09 | The system shall reject expired or tampered tokens. |

### 3.4 Registration and User Administration

| ID | Requirement |
|---|---|
| FR-USER-01 | The system shall gate registration by role using explicit feature flags. |
| FR-USER-02 | Registration shall be disabled by default in production. |
| FR-USER-03 | Registration shall validate a role-specific secret key in constant time. |
| FR-USER-04 | Super Admin registration may be restricted to an approved email domain. |
| FR-USER-05 | Manager accounts shall be created with `pending` status and require Super Admin approval. |
| FR-USER-06 | Super Admins shall list users, list pending manager requests, approve or reject requests, and delete users. |
| FR-USER-07 | The system shall prevent deletion of the last Super Admin. |
| FR-USER-08 | User changes shall invalidate cached authorisation data. |

### 3.5 Lead Management

| ID | Requirement |
|---|---|
| FR-LEAD-10 | Authorised staff shall list leads with pagination and filtering. |
| FR-LEAD-11 | The system shall clamp page size to a safe maximum. |
| FR-LEAD-12 | Authorised staff shall update lead status. |
| FR-LEAD-13 | Authorised staff shall delete leads. |
| FR-LEAD-14 | Status changes and deletions shall be audited. |

### 3.6 Blog Management

| ID | Requirement |
|---|---|
| FR-BLOG-01 | Authorised staff shall create, read, update, delete, and publish blog posts. |
| FR-BLOG-02 | The system shall sanitize blog HTML on save and on the client before submission. |
| FR-BLOG-03 | The system shall generate unique slugs. |
| FR-BLOG-04 | The system shall manage blog categories. |
| FR-BLOG-05 | Public blog endpoints shall paginate and return only published content. |

### 3.7 Event Management

| ID | Requirement |
|---|---|
| FR-EVT-01 | Authorised staff shall list, create, update, and delete events. |
| FR-EVT-02 | The system shall expose only live events publicly. |
| FR-EVT-03 | Event input shall be sanitized. |

### 3.8 Page Inventory

| ID | Requirement |
|---|---|
| FR-PAGE-01 | Authorised staff shall list the page inventory. |
| FR-PAGE-02 | Super Admins shall scan the configured GitHub repository for routes. |
| FR-PAGE-03 | The system shall report inserts, updates, and would-be removals before acting. |
| FR-PAGE-04 | Destructive synchronisation shall require both `removeMissing` and `confirmDestructive` and at least one scanned page. |
| FR-PAGE-05 | Scanner failures shall not cause destructive changes. |

### 3.9 Dashboard and Reporting

| ID | Requirement |
|---|---|
| FR-DASH-01 | The dashboard shall report total leads, unread leads, pages, blogs, approved users, and pending managers. |
| FR-DASH-02 | The dashboard shall report recent unread leads and recent pages. |
| FR-DASH-03 | Dashboard data shall be restricted to authorised staff. |

### 3.10 Security Controls

| ID | Requirement |
|---|---|
| FR-SEC-01 | The system shall validate and sign CSRF tokens and compare them in constant time. |
| FR-SEC-02 | The system shall reject cross-site state-changing requests. |
| FR-SEC-03 | The system shall enforce an Origin allow-list for cross-origin requests. |
| FR-SEC-04 | The system shall apply HTTP security headers including CSP, HSTS in production, frame denial, and MIME sniffing prevention. |
| FR-SEC-05 | The system shall validate all request payloads with whitelisting and reject unknown fields. |
| FR-SEC-06 | The system shall sanitize error responses to avoid leaking internal details. |
| FR-SEC-07 | The system shall rate-limit global and sensitive endpoints. |
| FR-SEC-08 | The system shall record an audit event for privileged and destructive actions. |

### 3.11 Health and Operations

| ID | Requirement |
|---|---|
| FR-OPS-01 | The system shall expose an unauthenticated health endpoint. |
| FR-OPS-02 | The health endpoint shall return 503 when the database is unavailable. |
| FR-OPS-03 | The system shall read all configuration from environment variables and fail fast on invalid configuration. |
| FR-OPS-04 | The system shall reject placeholder or weak secrets. |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

- **Public site**: responsive pages, navigation, forms, blog, events, office locator.
- **Login**: email/password form with error feedback.
- **Dashboard**: metric cards, lead table with filters and export, blog/event/page management, user approval.
- **Accessibility**: semantic HTML, keyboard-operable controls, labelled inputs.

### 4.2 API Interfaces

- JSON over HTTPS.
- Authentication via `token` and `refresh_token` cookies.
- CSRF via `X-CSRF-Token` header for state-changing requests.
- Common error envelope: `{ "statusCode": number, "message": string|string[], "timestamp": string, "path": string }`.
- Pagination responses include `total`, `totalPages`, and `currentPage` where applicable.

### 4.3 Software Interfaces

| Interface | Protocol | Direction |
|---|---|---|
| MySQL | TCP (TLS optional) | Outbound |
| External CRM | HTTP/HTTPS POST | Outbound |
| GitHub API | HTTPS | Outbound |
| Browser | HTTPS | Inbound |

### 4.4 Communication Interfaces

- HTTPS with modern TLS.
- Cookies: `Secure` and `SameSite=Lax` in production; `SameSite=Strict` in development.
- HSTS with a one-year max-age in production.

---

## 5. Non-Functional Requirements

### 5.1 Security

| ID | Requirement |
|---|---|
| NFR-SEC-01 | Passwords shall never be stored or logged in plaintext. |
| NFR-SEC-02 | Secrets shall be at least 32 characters and unique per purpose. |
| NFR-SEC-03 | Session cookies shall be `HttpOnly`; production cookies shall be `Secure`. |
| NFR-SEC-04 | The system shall mitigate CSRF, XSS, clickjacking, MIME sniffing, and credential stuffing. |
| NFR-SEC-05 | Public HTML content shall be sanitized on input and output boundaries. |
| NFR-SEC-06 | Privileged actions shall be attributable through audit logs. |
| NFR-SEC-07 | Dependencies shall be monitored for vulnerabilities on a weekly cadence. |

### 5.2 Performance

| ID | Requirement |
|---|---|
| NFR-PERF-01 | Public content pages should be served from static or ISR caches. |
| NFR-PERF-02 | Typical API read requests should complete within 500 ms at the 95th percentile under normal load. |
| NFR-PERF-03 | Lead creation shall return without waiting for external CRM processing. |
| NFR-PERF-04 | Database queries used by lists and dashboards shall be indexed. |

### 5.3 Reliability and Availability

| ID | Requirement |
|---|---|
| NFR-REL-01 | External integration failure shall not corrupt or lose stored data. |
| NFR-REL-02 | Audit failure shall not fail the primary operation. |
| NFR-REL-03 | Database failure shall be observable via the health endpoint. |
| NFR-REL-04 | Session revocation shall survive process restarts. |
| NFR-REL-05 | The system should target 99.9% monthly availability for public content. |

### 5.4 Maintainability

| ID | Requirement |
|---|---|
| NFR-MNT-01 | Code shall pass lint, type checking, unit tests, and e2e tests in CI. |
| NFR-MNT-02 | Configuration shall be environment-driven with a documented template. |
| NFR-MNT-03 | Database changes shall be delivered as idempotent migrations. |
| NFR-MNT-04 | Modules shall be separated by domain (auth, leads, blogs, events, pages, dashboard, audit, health). |

### 5.5 Usability and Accessibility

| ID | Requirement |
|---|---|
| NFR-UX-01 | Forms shall provide clear validation feedback without exposing internals. |
| NFR-UX-02 | The interface shall be usable on mobile, tablet, and desktop. |
| NFR-UX-03 | Core public content shall be readable without JavaScript. |

### 5.6 Compliance and Privacy

| ID | Requirement |
|---|---|
| NFR-CMP-01 | Only necessary personal data shall be collected from enquiries. |
| NFR-CMP-02 | Access to personal data shall be limited to authorised staff. |
| NFR-CMP-03 | Audit records shall be retained according to organisational policy. |
| NFR-CMP-04 | Data in transit shall be encrypted in production. |

### 5.7 Scalability and Portability

| ID | Requirement |
|---|---|
| NFR-SCL-01 | The API shall be stateless except for cached authorisation and revocation data. |
| NFR-SCL-02 | The frontend and backend shall be independently deployable. |
| NFR-SCL-03 | The system shall run on any Node.js 20+ host with a MySQL-compatible database. |

---

## 6. Data Requirements

### 6.1 Logical Entities

| Entity | Key attributes | Notes |
|---|---|---|
| `users` | `id`, `full_name`, `email`, `password`, `role`, `status`, `created_at` | Roles: `Super-Admin`, `Manager`; statuses include `pending`, `approved` |
| `leads` | `id`, `form_type`, `form_data`, `source_url`, `status`, `created_at` | `form_data` is JSON; statuses include `Unread`, `Read` |
| `blogs` | `id`, `title`, `slug`, `category_id`, `cover_image`, `content`, `status`, `author_name`, `author_role`, `created_at`, `updated_at` | Public only when `status = published` |
| `blog_categories` | `id`, `name` | Referenced by blogs |
| `events` | `id`, `event_name`, `day_and_date`, `event_time`, `venue`, `cover_image`, `target_page`, `event_status`, `created_at`, `updated_at` | Public only when `event_status = Live` |
| `pages` | `id`, `page_title`, `slug`, `parent_page`, `status`, `publish_date`, `created_at` | Inventory of site routes |
| `revoked_tokens` | `token_hash`, `expires_at`, `created_at` | SHA-256 hash; primary key on hash |
| `audit_logs` | `id`, `actor_id`, `actor_email`, `actor_role`, `action`, `entity`, `entity_id`, `metadata`, `ip_address`, `created_at` | Append-only |

### 6.2 Data Integrity Rules

- Email addresses shall be unique per user.
- Blog slugs shall be unique.
- Tokens shall be stored only as hashes.
- Foreign-key-like relationships (for example `blogs.category_id`) shall tolerate missing
  related rows where join semantics allow.
- Indexes shall support lead status/date, form type, blog status/date, slugs, and user
  email/status/role queries.

### 6.3 Retention

- Leads: retained per business policy; deletion is auditable.
- Audit logs: retained per security policy; append-only.
- Revoked tokens: retained until expiry.

---

## 7. Acceptance Criteria

| Area | Acceptance criterion |
|---|---|
| Build | Both projects compile and build cleanly. |
| Lint/type | Lint and type checks pass in CI. |
| Unit tests | All backend unit tests pass. |
| E2E tests | All backend e2e tests pass (excluding documented skips). |
| Public content | Marketing pages, blog, and events render; unknown routes return 404. |
| Public API | Blog endpoints return published content only; events return live only. |
| Enquiry | A public form submission stores a sanitized lead; CRM failure does not fail the request. |
| Auth | Login, refresh, rotation, logout, lockout, and approval checks behave as specified. |
| RBAC | Managers cannot perform Super Admin actions; last Super Admin cannot be deleted. |
| CSRF | State-changing requests without a valid token are rejected; exempt endpoints work. |
| Headers | CSP, HSTS (production), frame denial, and no-store on protected routes are present. |
| Audit | Privileged actions create audit records. |
| Health | `/health` returns 200 with a reachable database and 503 without it. |
| Database | The hardening migration applies idempotently and creates all required objects. |

---

## 8. Traceability Matrix

| Business need | Requirements |
|---|---|
| Attract and inform visitors | FR-PUB-01…06, NFR-PERF-01, NFR-UX-01…03 |
| Capture enquiries reliably | FR-LEAD-01…06, NFR-REL-01, NFR-PERF-03 |
| Protect staff accounts | FR-AUTH-01…09, FR-USER-01…08, NFR-SEC-01…07 |
| Manage content | FR-BLOG-01…05, FR-EVT-01…03, FR-PAGE-01…05 |
| Operate with visibility | FR-DASH-01…03, FR-OPS-01…04, NFR-REL-03 |
| Meet security obligations | FR-SEC-01…08, NFR-SEC-01…07, NFR-CMP-01…04 |
| Deliver safely | NFR-MNT-01…04, FR-OPS-03…04 |

---

## 9. Appendix: API Catalogue

### 9.1 Public

| Method | Path | Description |
|---|---|---|
| GET | `/` | Service identity |
| GET | `/health` | Database-backed health probe |
| GET | `/csrf-token` | Issue a signed CSRF token |
| POST | `/leads` | Submit an enquiry |
| GET | `/blogs/public` | List published blogs (paginated) |
| GET | `/blogs/public/:slug` | Read one published blog |
| GET | `/events/public` | List live events |

### 9.2 Authentication

| Method | Path | Access |
|---|---|---|
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Refresh cookie |
| POST | `/auth/logout` | Authenticated (cookie) |
| POST | `/auth/register-super-admin` | Gated |
| POST | `/auth/register-manager` | Gated |
| GET | `/auth/me` | Authenticated |
| GET | `/auth/users` | Super Admin |
| GET | `/auth/pending-requests` | Super Admin |
| PATCH | `/auth/requests` | Super Admin |
| DELETE | `/auth/delete-user` | Super Admin |

### 9.3 Leads and Dashboard

| Method | Path | Access |
|---|---|---|
| GET | `/leads` | Manager, Super Admin |
| GET | `/leads/form-types` | Manager, Super Admin |
| PATCH | `/leads/:id/status` | Manager, Super Admin |
| DELETE | `/leads/:id` | Manager, Super Admin |
| GET | `/dashboard/summary` | Manager, Super Admin |

### 9.4 Blogs (administration)

| Method | Path | Access |
|---|---|---|
| GET/POST | `/admin/blogs` | Manager, Super Admin |
| PUT/PATCH/DELETE | `/admin/blogs/:id` | Manager, Super Admin |
| GET/POST | `/admin/blogs/categories` | Manager, Super Admin |
| PUT/DELETE | `/admin/blogs/categories/:id` | Manager, Super Admin |

### 9.5 Events (administration)

| Method | Path | Access |
|---|---|---|
| GET/POST | `/admin/events` | Manager, Super Admin |
| PUT/DELETE | `/admin/events` | Manager, Super Admin |

### 9.6 Pages

| Method | Path | Access |
|---|---|---|
| GET | `/admin/pages` | Manager, Super Admin |
| POST | `/admin/pages/scan` | Super Admin |
| POST | `/admin/pages/save` | Super Admin |

---

*End of document.*
