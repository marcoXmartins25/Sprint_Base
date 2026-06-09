# SprintBase — Claude Context

## Project Overview

SprintBase is a full-stack sprint/task management SaaS with multi-tenancy, tiered plans (Free/Pro/Team), JWT auth, and PDF reporting.

## Package Manager

Always use **yarn** — never npm.

---

## 1. Architecture Overview

Multi-tenant SaaS. All data scoped to `company_id`. Frontend SPA calls backend REST API. Backend enforces tenancy and plan limits before touching DB.

**Type:** monolith (backend) + SPA (frontend)
**Entry points:** HTTP API on port 3000 (backend), Vite dev server port 5173 (frontend)
**External dependencies:** Resend (email), Neon/PostgreSQL (DB), Nixpacks/Railway (deploy)
**Deployment target:** Railway (Nixpacks) for backend; static host (Vercel/Netlify) for frontend

```
Browser
  → Vite proxy (/api, /uploads) [dev only]
  → Express (port 3000)
      → verifyToken middleware
      → attachCompany middleware (reads JWT → company_id, company_role)
      → role guards (requireOwner / requireOwnerOrAdmin)
      → route handlers
          → PostgreSQL (pg pool)
          → PDFKit (reports)
          → Multer (file uploads → disk)
          → Resend (email)
```

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Language | Node.js | 20.x (nixpacks) | No .nvmrc; use Node 20 LTS |
| Framework | Express | ^4.18.2 | REST API |
| Database | PostgreSQL | 14+ | 17 migrations |
| Auth | jsonwebtoken | ^9.0.3 | 7-day tokens, localStorage |
| Password | bcryptjs | ^3.0.3 | |
| Email | Resend SDK | ^6.12.3 | |
| PDF | PDFKit | ^0.15.0 | Sprint reports |
| File upload | Multer | ^1.4.5-lts.1 | avatars + logos, disk storage |
| DB client | pg | ^8.11.3 | connection pool |
| Frontend framework | React | ^18.2.0 | |
| Router | React Router | ^6.21.3 | |
| Build tool | Vite | ^5.0.12 | dev proxy + production build |
| CSS framework | Tailwind CSS | ^3.4.1 | |
| Testing | — | — | no test suite yet |
| CI/CD | — | — | manual deploy via Railway |
| Container | Nixpacks | — | `nixpacks.toml` |
| Monitoring | — | — | not configured |

**Runtime commands:**

### Backend (`backend/`)
```bash
yarn dev              # nodemon, port 3000
yarn migrate          # run pending SQL migrations
yarn seed             # seed database
yarn db:setup         # migrate + seed
yarn archive:sprints  # archive old sprints (cron)
```

### Frontend (`frontend/`)
```bash
yarn dev      # Vite dev server, port 5173
yarn build    # production build → dist/
yarn preview  # preview production build
```

---

## 3. Environment Variables

> Never put real values here. All vars below belong in `backend/.env`.

### App
```env
PORT=3000
APP_URL=http://localhost:5173
```

### Database (local)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sprint_tracker
DB_USER=postgres
DB_PASSWORD=<your-password>
```

### Database (production — overrides individual DB_* vars)
```env
DATABASE_URL=postgres://user:pass@host:5432/sprint_tracker?sslmode=require
```

### Auth
```env
JWT_SECRET=<generate-strong-random-string>
```

### Email
```env
RESEND_API_KEY=re_<your-key>
```

### Frontend

No env vars. API calls use relative path `/api` (proxied by Vite in dev, direct in prod).

---

## 4. Directory Structure

```
Sprint_Base/
├── backend/
│   ├── migrations/          # 001_→017_ SQL files — add new, never edit existing
│   ├── scripts/
│   │   ├── migrate.js       # migration runner
│   │   ├── seed.js          # seed data
│   │   └── archiveSprints.js  # cron: archive sprints > 6 months
│   ├── seeders/             # sample data
│   ├── uploads/             # runtime: avatars + logos (ephemeral on Railway)
│   └── src/
│       ├── routes/
│       │   ├── auth.js      # POST /login, GET /verify
│       │   ├── sprints.js   # CRUD sprints
│       │   ├── tasks.js     # CRUD tasks
│       │   ├── reports.js   # PDF report + plan download
│       │   ├── plan.js      # GET/PUT plan on company
│       │   ├── branding.js  # logo + primary color (Team plan)
│       │   ├── companies.js # register company + owner
│       │   ├── team.js      # invite, list, update, remove members
│       │   ├── invites.js   # invite token acceptance (public)
│       │   └── users.js     # admin: create/delete/role users
│       ├── db.js            # pg connection pool
│       ├── index.js         # Express entry: route registration, static /uploads
│       ├── emailService.js  # Resend: welcome + invite emails
│       ├── pdf.js           # PDFKit: report + plan generation
│       ├── planLimits.js    # plan enforcement, HTTP 402 on limit breach
│       ├── companyMiddleware.js  # verifyToken + attachCompany
│       └── adminMiddleware.js   # checkAdmin (global admin role)
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── RegisterCompany.jsx
│       │   ├── Dashboard.jsx
│       │   ├── SprintDetail.jsx
│       │   ├── Team.jsx
│       │   ├── Company.jsx
│       │   ├── Profile.jsx
│       │   ├── Admin.jsx
│       │   ├── Pricing.jsx
│       │   ├── Docs.jsx
│       │   └── AcceptInvite.jsx
│       ├── components/
│       │   ├── AppLayout.jsx
│       │   ├── SprintCard.jsx
│       │   ├── SprintForm.jsx
│       │   ├── TaskForm.jsx
│       │   ├── UpgradeModal.jsx
│       │   ├── Avatar.jsx
│       │   └── Logo.jsx
│       ├── App.jsx              # router + ProtectedRoute
│       ├── main.jsx
│       ├── api.js               # centralized fetch client
│       ├── LanguageContext.jsx  # EN/PT i18n
│       └── index.css
├── nixpacks.toml            # deployment: Node 20, migrate + start
├── CLAUDE.md
└── README.md
```

**Naming conventions:**
- Route files: noun (singular), e.g. `team.js`, `sprint.js`
- React pages: `NounPage` or just `Noun.jsx` (current convention)
- React components: `PascalCase.jsx`
- DB migration files: `NNN_description.sql` (sequential, never edited)

---

## 5. Services, Jobs & Models

### DB Tables

| Table | Key Columns | Notes |
|-------|------------|-------|
| `companies` | `id, name, email, logo_url, primary_color, plan, plan_expires_at` | One per tenant |
| `users` | `id, email, password_hash, name, avatar_url, role, company_id, company_role` | `role`: global; `company_role`: within tenant |
| `sprints` | `id, title, start_date, end_date, company_id, archived_at` | `archived_at IS NULL` = active |
| `tasks` | `id, sprint_id, company_id, title, status, priority, assigned_to, hours, week, deliverable*, definition_of_done*, dependencies*, risk*` | `*` = Pro+ fields |
| `invites` | `id, company_id, email, token, role, invited_by, expires_at, accepted_at` | Token one-use |
| `migrations` | `id, name, executed_at` | Prevents re-runs |

### Plan Limits (`backend/src/planLimits.js`)

| Limit | Free | Pro | Team |
|-------|------|-----|------|
| Active sprints | 2 | ∞ | ∞ |
| Tasks/sprint | 20 | ∞ | ∞ |
| Team members | 3 | 10 | ∞ |
| Extra task fields | ✗ | ✓ | ✓ |
| History | 6 months | 6 months | ∞ |
| Custom branding | ✗ | ✗ | ✓ |
| PDF watermark | ✓ | ✗ | ✗ |

Exceeding any limit → HTTP 402; frontend shows `<UpgradeModal>`.

### Scheduled Tasks

| Task | Command | Schedule | Description |
|------|---------|----------|-------------|
| Sprint archival | `yarn archive:sprints` | External cron required | Archives sprints > 6 months (Free/Pro). Team plan excluded. |

> **Note:** Cron not yet automated. Needs Railway cron trigger or GitHub Actions.

---

## 6. Common Hurdles & Solutions

### H01 — Migrations not running on deploy
**Problem:** Backend starts but schema is missing or outdated.
**Root cause:** `nixpacks.toml` runs `npm run migrate` but uses npm, not yarn. Or `DATABASE_URL` not set.
**Solution:**
```bash
# Verify env var set on Railway
DATABASE_URL=postgres://...?sslmode=require
# Run manually if needed
cd backend && yarn migrate
```
**Prevention:** Always check Railway env vars after adding a new migration.

---

### H02 — Uploads lost after redeploy on Railway
**Problem:** Avatars and logos disappear after deployment.
**Root cause:** Railway filesystem is ephemeral; `backend/uploads/` is wiped on redeploy.
**Solution:** Move to S3 or Railway persistent volumes. Currently no fix implemented — known limitation.
**Prevention:** Do not rely on local disk for production file storage.

---

### H03 — JWT token rejected / 401 on all requests
**Problem:** All API calls return 401 after login.
**Root cause:** `JWT_SECRET` mismatch between token sign and verify, or env var missing.
**Solution:**
```bash
# Check backend/.env
JWT_SECRET=<same-value-used-to-sign>
# Logout + login again to get fresh token
```
**Prevention:** Use a single `JWT_SECRET` env var, never hardcode.

---

### H04 — Plan limits enforced incorrectly after upgrade
**Problem:** User upgraded plan but still hits 402 limit errors.
**Root cause:** `plan_expires_at` in past → `planLimits.js` silently downgrades to free.
**Solution:**
```sql
UPDATE companies SET plan = 'pro', plan_expires_at = NULL WHERE id = <id>;
```
**Prevention:** Ensure plan expiry is set to future date or NULL on upgrade.

---

### H05 — Email not sent (invite / welcome)
**Problem:** User created or invited but receives no email.
**Root cause:** `RESEND_API_KEY` missing or invalid. Email errors are caught and logged, not thrown.
**Solution:**
```bash
# Check backend/.env
RESEND_API_KEY=re_...
# Check backend logs for "Email error:" entries
```
**Prevention:** Test email in staging before production deploys.

---

### H06 — PDF download fails (401 in browser)
**Problem:** Clicking PDF link returns 401.
**Root cause:** Browser `<a href>` can't send `Authorization` header. Token must be query param.
**Solution:** PDF URLs must use `?token=<jwt>` pattern. See `reports.js` and `api.js`.
**Prevention:** Always use `loadProtectedImage()` / query-param token for browser-initiated downloads.

---

### H07 — CORS errors in production
**Problem:** Frontend calls to backend blocked by CORS.
**Root cause:** `app.use(cors())` allows all origins in dev. In production, if frontend is on a different domain, ensure CORS is still open or add `CORS_ORIGIN` env var.
**Solution:**
```js
// index.js — add origin whitelist
app.use(cors({ origin: process.env.APP_URL }));
```
**Prevention:** Set `APP_URL` correctly in production env.

---

### H08 — `attachCompany` fails, req.companyId undefined
**Problem:** Routes return 500 or wrong data.
**Root cause:** Token missing `company_id` claim, or middleware order wrong in `index.js`.
**Solution:** Verify `verifyToken` runs before `attachCompany` on all protected routes. Re-login to get fresh token.
**Prevention:** Do not reorder middleware. New routes must use `companyMiddleware` chain.

---

### H09 — Admin middleware always fails
**Problem:** Admin routes return 403 for actual admins.
**Root cause:** `adminMiddleware.js` reads `req.user?.id` but `verifyToken` sets `req.userId` (no `.user` wrapper). Fallback to `1` masks the issue.
**Solution:**
```js
// adminMiddleware.js — fix property name
const userId = req.userId; // not req.user?.id
```
**Prevention:** Keep middleware property names consistent: `req.userId`, `req.companyId`, `req.companyRole`.

---

### H10 — Seed fails with duplicate key
**Problem:** `yarn seed` throws unique constraint violation.
**Root cause:** Seed data already exists from previous run.
**Solution:**
```bash
# Truncate tables first (dev only)
psql -d sprint_tracker -c "TRUNCATE companies, users, sprints, tasks CASCADE;"
yarn seed
```
**Prevention:** Seed script should use `ON CONFLICT DO NOTHING`.

---

### H11 — Task extra fields (deliverable, etc.) not saving
**Problem:** Pro/Team users can't save deliverable, definition_of_done, dependencies, risk fields.
**Root cause:** Plan check failing, or fields not included in `tasks.js` UPDATE query.
**Solution:** Verify `companies.plan = 'pro'` or `'team'` in DB. Check `tasks.js` update handler includes all extra fields.
**Prevention:** Run full plan check when adding new plan-gated fields.

---

### H12 — Sprint archival removes too much history
**Problem:** Active sprints archived unexpectedly.
**Root cause:** `archiveSprints.js` uses `end_date < NOW() - interval '6 months'`; timezone mismatch can shift boundary.
**Solution:** Run script manually and verify output before scheduling.
**Prevention:** Add `DRY_RUN=true` mode to script before full automation.

---

## 7. Design Patterns

### P01 — Multi-Tenancy via Middleware
**Where used:** `backend/src/companyMiddleware.js`
**Why:** All data scoped to `company_id`; enforced once in middleware, not in every handler.
**Example:** `attachCompany` reads JWT → sets `req.companyId`, `req.companyRole` on every protected request.

---

### P02 — Middleware Chain (auth → tenancy → role)
**Where used:** `backend/src/index.js` route registration
**Why:** Composable access control; each layer has one responsibility.
**Example:** `router.use(verifyToken, attachCompany); router.delete('/:id', requireOwner(), handler)`

---

### P03 — Centralized API Client
**Where used:** `frontend/src/api.js`
**Why:** Single place for auth header injection, base URL, and error handling.
**Example:** `api.getSprints()` → `fetchApi('/api/sprints')` → injects `Authorization: Bearer <token>`

---

### P04 — Plan Limit Enforcement (Strategy-like)
**Where used:** `backend/src/planLimits.js`
**Why:** Plan logic centralized; route handlers call `checkSprintLimit()` etc. and get 402 or proceed.
**Example:** `await checkSprintLimit(companyId, plan)` — throws HTTP 402 if limit exceeded.

---

### P05 — Token-in-Query-Param for Browser Downloads
**Where used:** `backend/src/routes/reports.js`, `frontend/src/api.js`
**Why:** Browsers can't send `Authorization` headers on `<a href>` / `<img src>` — query param workaround.
**Example:** `GET /api/sprints/:id/report?token=<jwt>`

---

### P06 — Protected Image Loading
**Where used:** `frontend/src/api.js` → `loadProtectedImage()`
**Why:** Avatar/logo URLs require auth; raw `<img src>` would fail.
**Example:** `loadProtectedImage(url)` → fetch with Bearer token → creates blob URL.

---

### P07 — React Context for i18n
**Where used:** `frontend/src/LanguageContext.jsx`
**Why:** EN/PT switching without external library.
**Example:** `const { t } = useLanguage(); t('dashboard.title')`

---

### P08 — Invite Token Flow
**Where used:** `backend/src/routes/invites.js`, `backend/src/emailService.js`
**Why:** Secure user onboarding without pre-creating accounts.
**Example:** Owner invites email → Resend sends link with UUID token → `/accept-invite/:token` → user created + linked to company.

---

### P09 — Cascade Delete for Tenant Cleanup
**Where used:** All FK constraints in migrations
**Why:** Deleting a company removes all its data atomically; no orphan records.
**Example:** `ON DELETE CASCADE` on `company_id` in `users`, `sprints`, `tasks`, `invites`.

---

### P10 — Sequential SQL Migrations
**Where used:** `backend/migrations/`, `backend/scripts/migrate.js`
**Why:** Reproducible schema evolution; tracking table prevents double-runs.
**Example:** `001_init.sql` → `017_*.sql`; never edit existing files, always add new numbered file.

---

### P11 — PDF Streaming Response
**Where used:** `backend/src/pdf.js`, `backend/src/routes/reports.js`
**Why:** PDFKit pipes directly to `res`; no temp file needed.
**Example:** `doc.pipe(res); doc.end();` — browser receives PDF stream inline.

---

### P12 — Role-Based Access Control (RBAC)
**Where used:** `backend/src/companyMiddleware.js`
**Why:** Two-level roles: global (`role`: user/admin) + company-scoped (`company_role`: owner/admin/member).
**Example:** `requireOwnerOrAdmin()` checks `req.companyRole`; `checkAdmin()` checks `req.role`.

---

### P13 — Plan Expiry Auto-Downgrade
**Where used:** `backend/src/planLimits.js`
**Why:** No payment processor integrated; expiry enforced by timestamp check.
**Example:** `plan_expires_at < NOW()` → treat as free plan silently.

---

### P14 — Proxy-Forwarded API in Dev
**Where used:** `frontend/vite.config.js`
**Why:** Frontend served on :5173, backend on :3000 — proxy avoids CORS in dev.
**Example:** `proxy: { '/api': 'http://localhost:3000', '/uploads': 'http://localhost:3000' }`

---

## 8. Weekly Pipeline & Schedule

> All times `Europe/Lisbon` (WET/WEST).

| Day | Time | Task | System | Owner |
|-----|------|------|--------|-------|
| Daily | TBD | Archive old sprints | `yarn archive:sprints` | **NOT YET AUTOMATED** |

**Maintenance windows:** Off-hours (after 22:00 WET)
**Blackout periods:** During active sprint reviews (user-defined)

> Sprint archival cron is documented but not yet scheduled. Needs Railway cron job or GitHub Actions workflow.

---

## 9. Post-Implementation Checklist

Run after every feature, fix, or refactor before marking done.

### Code
- [ ] No unused imports or variables
- [ ] No hardcoded values — env vars used
- [ ] No secrets in code
- [ ] Input validated at system boundaries
- [ ] Realistic error cases handled only
- [ ] No N+1 queries introduced

### Database
- [ ] New migration file added (`NNN_description.sql`), existing files untouched
- [ ] Indexes added for new query patterns
- [ ] No breaking schema changes without transition plan
- [ ] Seeders updated if needed

### Tests
- [ ] Unit tests written first (TDD)
- [ ] Feature/integration test for new endpoint or flow
- [ ] Existing tests still pass
- [ ] Edge cases covered

### Security
- [ ] Auth/authorization checked on new routes (`verifyToken` + `attachCompany`)
- [ ] User input sanitized (parameterized queries — no string interpolation)
- [ ] No new SQL injection surface
- [ ] No new XSS surface (if frontend touched)
- [ ] Plan limit check added for new plan-gated features

### Performance
- [ ] No expensive ops in request cycle (PDF gen is OK; move heavy jobs to queue if needed)
- [ ] Assets built and optimized (if frontend changed)

### Observability
- [ ] Relevant actions logged at appropriate level
- [ ] New cron jobs added to pipeline table (Section 8)

### Deployment
- [ ] `backend/.env` example updated with new vars
- [ ] This `CLAUDE.md` updated (tables, patterns, hurdles)
- [ ] `nixpacks.toml` unchanged unless deploy process changes

---

## 10. Claude Behavior (Project Overrides)

```
# Commands Claude can run without asking:
yarn dev, yarn migrate, yarn seed, yarn db:setup, yarn build, yarn preview

# Commands that always require confirmation:
- Any git commit, push, or destructive git operation
- yarn archive:sprints (touches production data)
- Any direct DB query on production
- Deleting files outside of node_modules
```

**Global overrides in effect:**
- Always use **yarn**, never npm
- TDD: write tests before implementation
- Never commit — user commits manually
