# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SprintBase is a full-stack sprint/task management SaaS with multi-tenancy, tiered plans (Free/Pro/Team), JWT auth, and PDF reporting.

## Package Manager

Always use **yarn** — never npm.

## Development Commands

### Backend (`backend/`)
```bash
yarn dev          # Start with nodemon (port 3000)
yarn migrate      # Run pending SQL migrations
yarn seed         # Seed database with initial data
yarn db:setup     # migrations + seed in one step
yarn archive:sprints  # Archive old sprints (cron job)
```

### Frontend (`frontend/`)
```bash
yarn dev      # Vite dev server (port 5173)
yarn build    # Production build
yarn preview  # Preview production build
```

### Database setup
PostgreSQL 14+ required. Create a `.env` in `backend/` based on this:
```
PORT=####
DB_HOST=localhost
DB_PORT=####
DB_NAME=sprint_tracker
DB_USER=####
DB_PASSWORD=####
RESEND_API_KEY=...
APP_URL=http://localhost:""""
```

## Architecture

### Stack
- **Frontend**: React 18, React Router 6, Tailwind CSS 3, Vite 5
- **Backend**: Node.js, Express 
- **Database**: PostgreSQL (17 SQL migrations)
- **Auth**: JWT (7-day tokens, stored in `localStorage`)
- **Other**: PDFKit (reports), Multer (uploads), Resend (email)

### Request Flow
Vite proxies `/api` and `/uploads` from port ######## in dev. Frontend uses a centralized API client (`frontend/src/api.js`) that injects `Authorization: Bearer <token>` on every request.

### Multi-tenancy
All data is scoped to `company_id`. The `attachCompany` middleware (`backend/src/companyMiddleware.js`) reads the JWT, attaches `company_id` and `company_role` to `req`, and enforces tenant isolation. Cascading deletes on `company_id` keep orphan data from accumulating.

### Auth & Authorization
- `verifyToken` middleware protects all `/api` routes
- `requireOwnerOrAdmin()` / `requireOwner()` check `company_role` (owner/admin/member)
- PDF download uses token via query param (`?token=...`) because browsers can't send headers on `<a>` clicks

### Plan System (Free / Pro / Team)
- Plan stored in `companies.plan`; limits enforced in `backend/src/planLimits.js`
- Free: 2 active sprints, 20 tasks/sprint, 6-month history
- Pro: unlimited sprints/tasks, extra task fields (deliverable, definition_of_done, dependencies, risk), 6-month history
- Team: all Pro + unlimited users + custom branding (logo, primary color) + unlimited history
- Exceeding limits returns HTTP 402; frontend shows `<UpgradeModal>`
- PDF watermark "SPRINTBASE FREE" applied for free plan in `backend/src/pdf.js`

### File Uploads
- Multer writes to `backend/uploads/` (served as static but auth-gated via `/uploads/:file`)
- Avatars: `avatar_<timestamp><ext>`, max 2MB
- Logos: `logo_<timestamp><ext>`, max 2MB
- Frontend loads protected images via `loadProtectedImage()` helper in `api.js`

### Database Migrations
Migrations live in `backend/migrations/` as numbered SQL files (`001_` → `017_`). A tracking table prevents re-runs. Always add a new numbered file; never edit existing ones.

### i18n
`frontend/src/LanguageContext.jsx` provides EN/PT switching via React context. All user-facing strings should be added there, not hardcoded in components.

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/index.js` | Express entry point, route registration |
| `backend/src/db.js` | PostgreSQL connection pool |
| `backend/src/planLimits.js` | Plan tier enforcement |
| `backend/src/companyMiddleware.js` | Multi-tenancy + role checks |
| `backend/src/pdf.js` | PDF report generation |
| `frontend/src/api.js` | Centralized fetch client, all endpoints |
| `frontend/src/App.jsx` | Router setup, ProtectedRoute |
| `frontend/src/LanguageContext.jsx` | EN/PT translations |
