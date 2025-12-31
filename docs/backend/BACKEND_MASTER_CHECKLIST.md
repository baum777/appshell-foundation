# BACKEND_MASTER_CHECKLIST (Opus 4.5 one-pass)

Diese Liste ist **linear** und so geschrieben, dass Opus 4.5 den Backend-Stack in **einem Durchlauf** implementieren kann, ohne Fragen zu stellen.

**Hard rules**
- **Docs-only source-of-truth**: Verträge aus `docs/backend/CONTRACTS.md` dürfen nicht abweichen.
- **TypeScript-first**: keine `any`.
- **UI-safe**: keine UI/UX Änderung erfinden; nur Wiring/Integration.
- Alles, was nicht v1 ist, explizit mit `// BACKEND_TODO:` markieren.

---

## 0) Contract Gaps (müssen zuerst entschieden werden)

### 0.1 Gap: Journal Model Drift (Stub vs Service)
- **Goal**: UI-kompatibles Journal v1 liefern, ohne spätere “full journal” Implementierung zu blockieren.
- **Files to create/modify**:
  - `docs/backend/CONTRACTS.md` (bereits entschieden)
  - `backend/src/domain/journal/*`
  - `src/pages/Journal.tsx` (nur Wiring, keine UX-Änderung) `// BACKEND_TODO` falls später
- **Interfaces/schemas**:
  - `JournalEntry` minimal (siehe `CONTRACTS.md`)
  - optional future: `JournalEntryFull` (`// BACKEND_TODO`)
- **Edge cases**:
  - Deep link `?entry=` muss 404 sauber abbilden (API), UI darf “not found” anzeigen.
- **Acceptance criteria**:
  - Backend liefert minimalen Contract exakt.
  - Optionaler “full” mode ist nicht zwingend in v1.
- **Tests required**:
  - Integration: Journal CRUD + status transitions.
- **Done-when**:
  - `GET/POST/confirm/archive/restore/delete` funktionieren + Tests grün.

### 0.2 Gap: Oracle Model Drift (Fixtures vs UI)
- **Goal**: Oracle v1 exakt wie UI: title/summary/theme/isRead.
- **Files**:
  - `backend/src/domain/oracle/*`
- **Acceptance**:
  - `GET /api/oracle/daily` liefert `OracleDailyFeed` exakt.

### 0.3 Gap: Alerts Drift (stubs vs real alerts module)
- **Goal**: Alerts v1 folgt `src/components/alerts/types.ts`.
- **Acceptance**:
  - Backend uses `Alert` union schema aus `CONTRACTS.md`.

---

## 1) Foundations

### 1.1 Backend App Skeleton (Node + TS)
- **Goal**: lauffähiger Backend-Server mit `/api` Router.
- **Files to create/modify (exact)**:
  - `backend/package.json` (oder root `package.json` Scripts/Deps, Entscheidung einmalig)
  - `backend/tsconfig.json`
  - `backend/src/server.ts`
  - `backend/src/app.ts`
  - `backend/src/http/router.ts`
  - `backend/src/http/error.ts`
  - `backend/src/http/requestId.ts`
  - `backend/src/config/env.ts`
  - `backend/src/config/config.ts`
- **Interfaces/schemas**:
  - `ErrorResponse` (siehe `API_SPEC.md`)
  - `ApiResponse<T>` (siehe `API_SPEC.md`)
- **Edge cases**:
  - JSON parse errors → `400 INVALID_JSON`
  - unknown route → `404 NOT_FOUND`
- **Acceptance criteria**:
  - `GET /api/health` returns 200 with `x-request-id`.
  - Every response sets `x-request-id`.
- **Tests required**:
  - Unit: error mapping
  - Integration: health endpoint
- **Done-when**:
  - Server starts + endpoints respond + tests green.

### 1.2 Env Vars + Config Table
- **Goal**: deterministische Konfiguration über env.
- **Files**:
  - `backend/src/config/env.ts`
  - `.env.example` (append backend envs)
- **Interfaces/schemas**:

```ts
export interface BackendEnv {
  NODE_ENV: "development" | "test" | "production";
  BACKEND_PORT: number;
  API_BASE_PATH: "/api";
  DATABASE_URL: string; // sqlite:...
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
}
```

- **Configuration Table (verbindlich)**:

| Env | Required | Default | Example | Notes |
|---|---:|---|---|---|
| `NODE_ENV` | yes | `"development"` | `production` | steuert logging/caching defaults |
| `BACKEND_PORT` | yes | `3000` | `3000` | Backend listen port |
| `API_BASE_PATH` | yes | `"/api"` | `/api` | muss mit Frontend BaseURL matchen |
| `DATABASE_URL` | yes | `sqlite:./.data/tradeapp.sqlite` | `sqlite:./.data/tradeapp.sqlite` | SQLite file path |
| `LOG_LEVEL` | yes | `"info"` | `debug` | structured logs |

- **Acceptance criteria**:
  - Missing required envs → startup fails with clear message.
- **Tests required**:
  - Unit: env parsing.
- **Done-when**:
  - Config loads in dev/test.

### 1.3 Logging + Request IDs
- **Goal**: structured logs with request correlation.
- **Files**:
  - `backend/src/observability/logger.ts`
  - `backend/src/http/requestId.ts`
- **Acceptance criteria**:
  - every log line includes `requestId` when in request scope.
- **Tests required**:
  - Unit: requestId propagation.
- **Done-when**:
  - Logs show request id for API calls.

### 1.4 Rate Limiting & Caching Policy
- **Goal**: route-level rate limiting + cache headers per `API_SPEC.md`.
- **Files**:
  - `backend/src/http/rateLimit.ts`
  - `backend/src/http/cacheHeaders.ts`
- **Acceptance criteria**:
  - Oracle daily sets cache headers as specified.
  - TA endpoint rate-limited.
- **Tests required**:
  - Integration: header assertions.
- **Done-when**:
  - Verified in integration tests.

---

## 2) Data Stores

### 2.1 SQLite + Migrations
- **Goal**: DB schema und Migrations laufen idempotent.
- **Files**:
  - `backend/migrations/0001_init.sql`
  - `backend/migrations/0002_indexes.sql`
  - `backend/src/db/sqlite.ts`
  - `backend/src/db/migrate.ts`
- **Edge cases**:
  - Start on empty DB vs existing DB
- **Acceptance criteria**:
  - On startup, migrations applied once; safe to rerun.
- **Tests required**:
  - Integration: spin up with temp DB.
- **Done-when**:
  - tables exist + CRUD persists.

---

## 3) Journal

### 3.1 Implement Journal Routes
- **Goal**: `/api/journal*` endpoints gemäß `API_SPEC.md`.
- **Files**:
  - `backend/src/routes/journal.ts`
  - `backend/src/domain/journal/repo.ts`
  - `backend/src/domain/journal/types.ts`
- **Interfaces/schemas**:
  - `JournalEntry`, `JournalConfirmPayload`, etc. (siehe `CONTRACTS.md`)
- **Edge cases**:
  - confirm archived → 409
  - archive already archived → 200 idempotent
- **Acceptance criteria**:
  - list supports `view` alias, returns correct status subset.
  - deep-link fetch by id works (404 with correct schema).
- **Tests required**:
  - Integration: full Journal flow.
- **Done-when**:
  - All journal endpoints pass integration tests.

---

## 4) Alerts (Core + Advanced)

### 4.1 Alerts CRUD API
- **Goal**: create/list/update/delete/cancel per `API_SPEC.md`.
- **Files**:
  - `backend/src/routes/alerts.ts`
  - `backend/src/domain/alerts/types.ts`
  - `backend/src/domain/alerts/repo.ts`
- **Interfaces/schemas**:
  - `Alert` union (siehe `CONTRACTS.md`)
- **Edge cases**:
  - PATCH enabled toggles also status correctly
- **Acceptance criteria**:
  - Stored alert reads back identical to created shape.
- **Tests required**:
  - Integration: create each type + toggle pause + cancel watch.
- **Done-when**:
  - CRUD + list filter works.

### 4.2 Alert Event Log
- **Goal**: persist and query `AlertEmitted[]` for SW dedupe/history.
- **Files**:
  - `backend/src/domain/alerts/eventsRepo.ts`
  - `backend/src/routes/alertEvents.ts` (oder in alerts route)
- **Acceptance criteria**:
  - `GET /api/alerts/events?since=` returns events sorted by occurredAt asc.
- **Tests required**:
  - Integration: insert events and query.
- **Done-when**:
  - Works + retention cleanup job scheduled.

### 4.3 TWO_STAGE_CONFIRMED Engine (2-of-3)
- **Goal**: stage machine INITIAL → WATCHING → CONFIRMED → EXPIRED/CANCELLED.
- **Files**:
  - `backend/src/domain/alerts/twoStageMachine.ts`
  - `backend/src/domain/alerts/evaluator.ts`
- **Edge cases**:
  - expiry before confirmation
  - one-shot confirmed
  - cooldown minutes honored
- **Acceptance criteria**:
  - Given deterministic indicator signals, engine emits correct `AlertEmitted`.
- **Tests required**:
  - Unit: state machine transitions
  - Integration: evaluator tick produces events
- **Done-when**:
  - Tests match golden fixtures.

### 4.4 DEAD_TOKEN_AWAKENING_V2 Engine
- **Goal**: deadness gating + 3-stage session with max 12h.
- **Files**:
  - `backend/src/domain/alerts/deadTokenMachine.ts`
  - `backend/src/domain/alerts/deadTokenDetector.ts`
- **Acceptance criteria**:
  - emits stage events exactly once per stage
  - session ends at 12h max
- **Tests required**:
  - Unit + Integration with fixed clock
- **Done-when**:
  - Golden scenarios green.

---

## 5) Oracle

### 5.1 Daily Feed Endpoint
- **Goal**: `GET /api/oracle/daily` returns `OracleDailyFeed` with pinned takeaway.
- **Files**:
  - `backend/src/routes/oracle.ts`
  - `backend/src/domain/oracle/generator.ts` (stubbed deterministic daily generator)
  - `backend/src/domain/oracle/repo.ts`
- **Edge cases**:
  - date param invalid → 400
- **Acceptance criteria**:
  - pinned id is always `"today-takeaway"`
  - caching headers correct
- **Tests required**:
  - Integration: daily feed + date override
- **Done-when**:
  - Endpoint returns stable daily payload.

### 5.2 Read/Unread Persistence
- **Goal**: `PUT /api/oracle/read-state` + bulk endpoint.
- **Files**:
  - `backend/src/domain/oracle/readStateRepo.ts`
- **Acceptance criteria**:
  - read toggles persist and reflect on next `/daily`.
- **Tests required**:
  - Integration: toggle read + reload.
- **Done-when**:
  - read state works for insights + `today-takeaway`.

---

## 6) Chart TA (stub now)

### 6.1 TA Endpoint
- **Goal**: deterministic `TAReport` from `POST /api/chart/ta`.
- **Files**:
  - `backend/src/routes/ta.ts`
  - `backend/src/domain/ta/taGenerator.ts`
  - `backend/src/domain/ta/cacheRepo.ts`
- **Edge cases**:
  - missing market/timeframe → 400
- **Acceptance criteria**:
  - same input + same date bucket → same response JSON.
- **Tests required**:
  - Unit + Integration.
- **Done-when**:
  - deterministic tests green.

---

## 7) Service Worker Integration (contracts only)

### 7.1 SW Implementation
- **Goal**: SW can poll alerts/oracle and show deduped notifications.
- **Files** (exact, siehe `SW_SPEC.md`):
  - `src/sw/service-worker.ts`
  - `src/sw/sw-contracts.ts`
  - `src/sw/sw-storage.ts`
  - `src/sw/sw-scheduler.ts`
  - `src/sw/sw-alerts.ts`
  - `src/sw/sw-oracle.ts`
  - `src/main.tsx`
  - `vite.config.ts`
- **Acceptance criteria**:
  - SW persists dedupe state in IDB
  - no duplicate notifications for same event
- **Tests required**:
  - Unit (SW storage helpers) + optional E2E (manual)
- **Done-when**:
  - SW builds and registers without breaking UI.

---

## 8) Frontend Wiring (no redesign)

### 8.1 Replace Stub Hooks with API-backed Services (UI-safe)
- **Goal**: UI liest/schreibt Journal/Alerts/Oracle über `/api` statt stubs/localStorage.
- **Files**:
  - `src/pages/Journal.tsx` (replace `useJournalStub`)
  - `src/pages/Alerts.tsx` + `src/components/alerts/useAlertsStore.ts` (persist + load via API)
  - `src/pages/Oracle.tsx` (fetch daily feed + read-state)
- **Edge cases**:
  - Backend down → UI error states müssen weiterhin funktionieren (existing error banners)
- **Acceptance criteria**:
  - keine UI-Layout Änderungen
  - page state flows (“loading/error/ready”) bleiben erhalten
- **Tests required**:
  - Playwright smoke tests (existing) + neue backend e2e tests (siehe `TEST_PLAN.md`)
- **Done-when**:
  - existing Playwright tests still pass; backend e2e tests pass when enabled.

---

## 9) Acceptance Gates (final)

**Must pass**:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run test:e2e`
- `npm run test:backend`

**Plus**:
- API contracts in `docs/backend/*` eingehalten (Schemas, errors, caching headers).

