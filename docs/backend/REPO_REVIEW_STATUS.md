### docs/backend/REPO_REVIEW_STATUS.md

### 1) Executive Summary

Dieses Repo enthält **mehrere parallele Backend-Implementierungen** und ein Frontend mit **offline-first Bausteinen**. Der Ist-Zustand ist funktionsreich (Journal/Alerts/Oracle/TA/Reasoning/Pulse), aber **driftet** in zentralen Punkten vom „Journal + Backend readiness“-Zielbild ab:

- **Auth/JWT ist nicht robust end-to-end**: `api/` nutzt aktuell explizit einen unsicheren Stub („Bearer token == userId“), `backend/` hat eine JWT-Implementierung, aber **Env/Deps wirken inkonsistent** (hohes Risiko, dass es nicht sauber baut/läuft).
- **Journal ist implementiert, aber Contract-Drift**: Status-Casing (uppercase vs lowercase), Idempotency-Key Handling und Frontend-/Backend-Modelle divergieren.
- **Frozen OnchainContext Snapshots** (price/liquidity/volume/holders/transfers) sind **nicht persistent angebunden**; Provider-Integration (Moralis/DexPaprika) ist **nur teilweise** und nicht im Journal-Writes-Pfad.
- **Offline-first im Frontend** ist vorhanden (IndexedDB + SW + Queues), aber **Journal nutzt aktuell Stub-Daten** statt Backend.

Wichtig: Die Workspace-Snapshot-Ansicht enthält **keine `.git` Metadaten** (Dot-Dirs werden nicht gelistet; `.git/HEAD` nicht auffindbar). Daher kann ich **Default-Branch/HEAD-Commit und „deprecated branch“-Historie nicht faktisch belegen**.

---

### 2) Current State Inventory (what exists)

#### 2.1 Repo Layout / Workspaces

- **pnpm Monorepo**: `pnpm-workspace.yaml` (Packages: `apps/*`, `backend`, `api`)
- **Frontend (Vite/React)**: Root `src/` + `vite.config.ts`
- **Serverless Backend (Vercel)**: `api/` (Vercel Functions)
- **Node Backend (SQLite, HTTP Router)**: `backend/`
- **Separater Alerts-Service (Express + Postgres, Railway)**: `apps/backend-alerts/`

#### 2.2 Tooling / Scripts (Root)

- **Package manager**: `pnpm@10.17.1` (`package.json`)
- **Dev**
  - `pnpm dev` (Vite)
  - `pnpm dev:backend` → `pnpm -C apps/backend-alerts dev`
  - `pnpm dev:all` (concurrently Frontend + backend-alerts)
- **Tests**
  - `pnpm test:e2e` (Playwright)
  - `pnpm test:api` → `npm run --prefix api test` (Vitest)
  - `pnpm test:backend` → `npm run --prefix backend test` (Vitest)
- **Lint/Typecheck**
  - `pnpm lint`
  - `pnpm lint:api`, `pnpm lint:backend`

#### 2.3 CI / Workflows

- **Keine Workflows gefunden**: `.github/workflows/**` ist im Workspace-Snapshot leer.
- **Drift-Hinweis**: Root `README.md` behauptet Workflows (`.github/workflows/ci.yml` etc.), die **hier nicht vorhanden** sind.

#### 2.4 Deploy/Runtime Config Files

- **Vercel**: `vercel.json` (rewrites `/api/*` → Vercel Functions; Cron `/api/cron/oracle-daily`)
- **Railway**:
  - Root `railway.toml` verweist auf `backend/` Docker deploy
  - `apps/backend-alerts/railway.toml` vorhanden
- **Docker**: `backend/Dockerfile`, `backend/docker-compose.yml`

#### 2.5 Default branch & HEAD commit

- **Unknown**: Im Workspace sind keine Git-Refs/`.git/HEAD` auffindbar, daher kann ich Default-Branch und aktuellen HEAD-Commit **nicht belegen**.

---

### 3) Completed Work (by area)

> „Completed“ bedeutet hier: **Code existiert** + hat klaren Zweck + es gibt oft Tests. Das ist **keine Aussage**, dass es production-ready ist.

#### 3.A Auth & Security (Ist-Stand)

- **Serverless `api/`**
  - **Request Auth**: `api/_lib/handler.ts` extrahiert `userId` aus `Authorization: Bearer <token>` und nutzt den Token-String direkt als UserID.
  - **Expliziter TODO**: `// BACKEND_TODO: Implement proper JWT validation` in `api/_lib/handler.ts`.
  - **Stabilität**: Experimental/Unsicher (Auth-Shortcut).
  - **Tests**: Keine Auth-spezifischen Tests ersichtlich (es gibt Domain- und API-Tests, aber keine JWT-Verification-Tests).

- **Node `backend/`**
  - **JWT-Modul vorhanden**: `backend/src/lib/auth/jwt.ts` (`verifyToken`, `signToken`), Unit-Test: `backend/tests/unit/auth.spec.ts`.
  - **Routing-Integration**: `backend/src/http/router.ts` nutzt `verifyToken()`; wenn invalid/fehlend → `userId='anon'`.
  - **Stabilität**: Partial (sichtbare Inkonsistenzen, siehe Risiken unten).

- **Alerts Service `apps/backend-alerts/`**
  - **Auth**: einfacher API Key `Authorization: Bearer <API_KEY>` via `apps/backend-alerts/src/auth/authMiddleware.ts`.
  - **Stabilität**: Stable (für „shared secret“ Pattern), aber **kein JWT**.

#### 3.B Journal Backend (Ist-Stand)

Es existieren **zwei** Journal-Backends:

- **Serverless `api/` Journal (KV-basiert)**
  - **Routes**
    - `GET/POST /api/journal`: `api/journal/index.ts`
    - `GET/DELETE /api/journal/:id`: `api/journal/[id].ts`
    - `POST /api/journal/:id/confirm`: `api/journal/[id]/confirm.ts`
    - `POST /api/journal/:id/archive`: `api/journal/[id]/archive.ts`
    - `POST /api/journal/:id/restore`: `api/journal/[id]/restore.ts`
  - **Persistence**: KV abstraction mit Memory-Fallback:
    - KV keys/TTL: `api/_lib/kv/types.ts`
    - Store impl: `api/_lib/kv/index.ts`, `api/_lib/kv/vercel-store.ts`, `api/_lib/kv/memory-store.ts`
    - Journal Domain Repo: `api/_lib/domain/journal/repo.ts`
  - **Multitenancy**: enforced auf Domain-Ebene (`assertUserId`), userId-scoped keys.
  - **Tests**
    - Integration: `api/tests/integration/journal.spec.ts`
    - Unit: `api/tests/unit/journal-service.spec.ts`

- **Node `backend/` Journal (SQLite-basiert)**
  - **Routes**
    - Registriert in `backend/src/app.ts`:
      - `GET /api/journal`, `GET /api/journal/:id`, `POST /api/journal`,
      - `POST /api/journal/:id/confirm`, `/archive`, `/restore`,
      - `DELETE /api/journal/:id`
    - Handler: `backend/src/routes/journal.ts`
  - **Persistence**: SQLite
    - Migration: `backend/migrations/0003_journal_multitenancy.sql` (v2 Tabellen: `journal_entries_v2`, `journal_confirmations_v2`, `journal_archives_v2`)
    - Repo: `backend/src/domain/journal/repo.ts`
  - **Tests**
    - Integration: `backend/tests/integration/journal.spec.ts`
    - Unit: `backend/tests/unit/journal-service.spec.ts`

#### 3.C Alerts / Events / Push (Ist-Stand)

Hier existieren **drei** Ebenen:

- **Serverless `api/` Alerts (KV + Domain State Machines + Evaluator)**
  - **CRUD Routes**: `api/alerts/index.ts`, `api/alerts/[id].ts`, `api/alerts/[id]/cancel-watch.ts`
  - **Evaluation Route**: `POST /api/alerts/evaluate` in `api/alerts/evaluate.ts`
    - Nutzt derzeit deterministic stub providers: `api/_lib/domain/alerts/evaluator.ts`
  - **Events Route**: `api/alerts/events.ts` (wirkt wie Proxy zu Railway Alerts Service via `api/_lib/alertsProxy.ts`)
  - **SSE Stream**: `api/alerts/stream.ts` (Proxy)
  - **Push**: `api/alerts/push/*`, `api/alerts/vapidPublicKey.ts`
  - **State Machines**:
    - Two-stage: `api/_lib/domain/alerts/two-stage-machine.ts`
    - Dead token: `api/_lib/domain/alerts/dead-token-machine.ts`
  - **Tests**: `api/tests/integration/alerts.spec.ts`, `api/tests/unit/state-machines.spec.ts`

- **Node `backend/` Alerts (SQLite)**
  - **CRUD Routes**: `backend/src/routes/alerts.ts` via `backend/src/app.ts`:
    - `GET/POST /api/alerts`, `GET/PATCH/DELETE /api/alerts/:id`, `POST /api/alerts/:id/cancel-watch`
    - `GET /api/alerts/events`
  - **Persistence**: SQLite
    - Repo: `backend/src/domain/alerts/repo.ts`
    - Events repo: `backend/src/domain/alerts/eventsRepo.ts`
  - **Tests**: `backend/tests/integration/alerts.spec.ts`

- **Dedicated Alerts Service `apps/backend-alerts/` (Express + DB + Watcher)**
  - **Entry**: `apps/backend-alerts/src/index.ts`
  - **Routes**: `apps/backend-alerts/src/routes/*` (alerts, events, push, stream, health)
  - **Evaluator/Watcher**: `apps/backend-alerts/src/services/watcher.ts`, `apps/backend-alerts/src/services/evaluator.ts` (Providers aktuell: `apps/backend-alerts/src/services/providers/mockProvider.ts`)
  - **Auth**: API_KEY middleware (`apps/backend-alerts/src/auth/authMiddleware.ts`)
  - **Stabilität**: Partial (funktionsfähig als Service, aber Provider sind mock; nicht JWT)

#### 3.D Oracle (Daily Feed + Read State)

- **Serverless `api/`**
  - Routes: `api/oracle/daily.ts`, `api/oracle/read-state.ts`, `api/oracle/read-state/bulk.ts`
  - Domain: `api/_lib/domain/oracle/*`
  - Persistence: KV (snapshot + per-user read flags)
  - Tests: `api/tests/integration/oracle.spec.ts`

- **Node `backend/`**
  - Routes: `backend/src/routes/oracle.ts`
  - Domain: `backend/src/domain/oracle/*`
  - Persistence: SQLite (`oracle_daily_v1`, `oracle_read_state_v1` in migrations; Nutzung in `backend/src/domain/oracle/repo.ts`)
  - Tests: `backend/tests/integration/oracle.spec.ts`

#### 3.E Chart TA (Deterministic Stub + Cache)

- **Serverless `api/`**: `api/chart/ta.ts` → `api/_lib/domain/ta/*` (KV-cache)
- **Node `backend/`**: `backend/src/routes/ta.ts` → `backend/src/domain/ta/*` (SQLite cache: `backend/src/domain/ta/cacheRepo.ts`)
- **Tests**: `api/tests/integration/ta.spec.ts`, `backend/tests/integration/ta.spec.ts`

#### 3.F Reasoning / Grok Pulse / Usage

- **Serverless `api/` Reasoning**
  - Routes: `api/reasoning/*`
  - Engine/LLM Router: `api/_lib/reasoning/*`
  - Tests: `api/tests/integration/llm-routing.spec.ts`
- **Node `backend/` Reasoning**
  - Routes: `backend/src/routes/reasoning/*` (registriert in `backend/src/app.ts`)
- **Pulse**
  - `api/` Pulse ist ein LLM-basiertes Narrative-Modul: `api/_lib/domain/pulse/*`, Routes `api/grok-pulse/*`
  - `backend/` Grok Pulse ist ein anderes Modul mit Snapshot/History/Quota und minimaler Market-Data-Anreicherung: `backend/src/domain/grokPulse/*`, Routes `backend/src/routes/grokPulse.ts`
- **Usage Summary**
  - `api/usage/summary.ts`, `backend/src/routes/usage.ts`

---

### 4) In-Progress / Partial / Unmerged Work (if detectable)

#### 4.1 Sichtbarer „Partial“/TODO im Code (faktisch)

- **JWT in `api/` ist TODO**: `api/_lib/handler.ts` (Auth Shortcut).
- **`backend/` JWT wirkt inkonsistent zur Env-/Deps-Lage**:
  - `backend/src/lib/auth/jwt.ts` erwartet `JWT_SECRET` aus `backend/src/config/env.ts`, aber das Env-Schema definiert es nicht.
  - `backend/package.json` listet `jsonwebtoken` nicht als Dependency, obwohl `backend/src/lib/auth/jwt.ts` und `backend/tests/unit/auth.spec.ts` es importieren.
- **Journal Contract Drift**:
  - `docs/backend/API_SPEC.md` und `docs/backend/CONTRACTS.md` erwarten `status: "pending"|"confirmed"|"archived"` (lowercase),
    während Domain-Modelle in `api/_lib/domain/journal/types.ts` und `backend/src/domain/journal/types.ts` uppercase Status führen (`PENDING|CONFIRMED|ARCHIVED`).
- **Frontend Journal nutzt Stub**:
  - `src/pages/Journal.tsx` nutzt `useJournalStub` (`src/stubs/hooks`) statt Backend.
  - OnchainContext ist als frozen Contract vorhanden (`src/types/journal.ts`), aber Backend speichert/serviert es nicht.

#### 4.2 Deprecated-Branch / Unmerged Commits

- **Nicht möglich zu verifizieren**: Im Workspace-Snapshot ist keine Git-Historie/Branch-Refs zugänglich. Ich kann daher keine „unmerged work“ aus einer deprecateten Branch faktisch zusammenfassen, ohne zu raten.

---

### 5) Gaps & Missing Requirements (vs intended requirements)

#### 5.1 MUST-HAVES (Backend)

1) Robust JWT verification end-to-end  
- ❌ **Missing**
  - `api/`: Auth ist explizit unsicher (`api/_lib/handler.ts`).
  - `backend/`: JWT Code existiert (`backend/src/lib/auth/jwt.ts`), aber Env/Deps sind aktuell nicht konsistent (`backend/src/config/env.ts`, `backend/package.json`).

2) Journal endpoints aligned with contract (status + timestamps)  
- ⚠️ **Partial**
  - Endpoints existieren in `api/journal/*` und `backend/src/routes/journal.ts`.
  - **Status-Casing drift** (Domain uppercase vs Contract lowercase).
  - `backend` liest Idempotency-Key aus Query (`backend/src/routes/journal.ts`), Spec nennt Header `Idempotency-Key`.

3) Frozen OnchainContext snapshot persistence on journal entry creation  
- ❌ **Missing**
  - Frontend Contract: `src/types/journal.ts` definiert `OnchainContextV1` (priceUsd/liquidityUsd/holders/transfers24h etc.)
  - Kein Journal-Persistenzpfad speichert/serviert diese Felder in `api/_lib/domain/journal/repo.ts` oder `backend/src/domain/journal/repo.ts`.

4) Non-blocking enrichment (offline-first writes must not fail if providers are down)  
- ❌ **Missing (als Feature)**  
  - Es gibt keine Enrichment-Pipeline im Journal-Create-Pfad; damit kann auch nichts „non-blocking“ sein.
  - Alerts-Evaluator in `api/` nutzt aktuell deterministic stub providers (`api/_lib/domain/alerts/evaluator.ts`), nicht echte Provider-Fallbacks.

5) Clean tests for auth + journal routes + snapshot behavior  
- ⚠️ **Partial**
  - Journal hat Tests (api + backend): `api/tests/.../journal.spec.ts`, `backend/tests/.../journal.spec.ts`
  - Auth hat nur `backend/tests/unit/auth.spec.ts` (und ist fragil wegen `jsonwebtoken`/Env)
  - Snapshot behavior (OnchainContext persist) **keine Tests**, da Feature fehlt.

6) Env validation and test env defaults (JWT_SECRET etc.)  
- ❌ **Missing**
  - `api/_lib/env.ts` validiert nicht (nur simple getter).
  - `backend/src/config/env.ts` validiert zwar via zod, aber enthält aktuell nicht die Keys, die `backend/src/config/config.ts` und `backend/src/lib/auth/jwt.ts` erwarten.

#### 5.2 MUST-HAVES (Frontend, if in repo)

1) Journal IA supports Timeline/Inbox/Learn  
- ✅ **Done (UI scaffold)**
  - `src/pages/Journal.tsx`, `src/components/journal/JournalTimelineView.tsx`, `JournalInboxView.tsx`, `JournalLearnView.tsx`, `JournalModeToggle.tsx`

2) Pending is background layer; confirm/quickflip is 1-tap  
- ✅ **Done (UI behavior)**
  - Inbox: `src/components/journal/JournalInboxView.tsx` (confirm/archive shortcuts)
  - Review overlay: `src/components/journal/JournalReviewOverlay` (referenziert in `src/pages/Journal.tsx`)

3) Manual diary composer is progressive disclosure  
- ⚠️ **Partial**
  - `JournalCreateDialog` existiert (genutzt in `src/pages/Journal.tsx`), aber Datenfluss ist Stub/Local.

4) Learn view is coach-style (no dashboards)  
- ⚠️ **Partial**
  - `src/components/journal/JournalLearnView.tsx` ist aktuell Stub-Daten/Scaffold.

5) Offline states + queued writes visible  
- ⚠️ **Partial**
  - Sync Badge/Queue UI: `src/pages/Journal.tsx` + `src/components/journal/JournalSyncBadge`
  - Queue existiert, aber Journal-Queue Verarbeitung ist no-op: `src/services/journal/journalQueue.ts`
  - Separater allgemeiner Sync-Service (IndexedDB) existiert: `src/services/sync/sync.service.ts` (wirkt nicht mit JournalStub integriert).

---

### 6) Risks / Drift / Tech Debt

- **Mehrfach-Backends mit Overlap**: `api/` vs `backend/` vs `apps/backend-alerts/` implementieren ähnliche Domänen (Alerts, Journal, Oracle, Pulse) unterschiedlich. Hohe Gefahr, dass Frontend gegen „falsches“ Backend integriert.
- **Auth Drift / Security Risk**:
  - `api/_lib/handler.ts`: unsicherer Auth Shortcut (token==userId).
  - `apps/backend-alerts/`: API_KEY statt JWT.
  - `backend/`: JWT modul vorhanden, aber Env/Deps inkonsistent → potenziell „false sense of security“.
- **Contract Drift (Journal Status + Shapes)**:
  - Contract expects lowercase; Domains oft uppercase (`api/_lib/domain/journal/types.ts`, `backend/src/domain/journal/types.ts`).
  - Frontend hat zwei konkurrierende Journal-Modelle:
    - Frozen v1 Contract: `src/types/journal.ts`
    - „Trading journal“ Service Model: `src/services/trading/journal.service.ts` (nicht deckungsgleich mit API_SPEC v1)
- **Env/Config Inkonsistenzen (backend)**:
  - `backend/src/config/env.ts` vs `backend/src/config/config.ts` (erwartete Keys wie `DATABASE_URL`, `BACKEND_PORT`, `LOG_LEVEL` vs definierte Keys wie `PORT`, `DATABASE_PATH`).
- **Provider Integration unvollständig**:
  - DexPaprika/Moralis werden im `backend/` GrokPulse nur minimal genutzt (`backend/src/domain/grokPulse/sources.ts`), nicht für Journal `OnchainContextV1`.
  - `api/_lib/kv/types.ts` nennt provider caches (candles/holders), aber es fehlt die echte Provider-Anbindung in Domain.
- **CI Drift**: README behauptet GitHub Actions, aber keine Workflows im Snapshot → unklar, was tatsächlich in CI ausgeführt wird.
- **Tests nicht verifiziert**: Es gibt Vitest/Playwright Setup, aber ohne Ausführung ist pass/fail unbekannt; zusätzlich gibt es harte Indizien für Build/Test-Brüche (Deps/Env Drift).

---

### 7) Recommended Next Steps (prioritized, minimal completion steps)

> Ziel: Auf einem sauberen Branch weiterarbeiten, ohne Fortschritt zu verlieren. Keine Redesigns – nur „contract back to green“.

#### P0 (Blocker)

- **P0.1 — Entscheiden und dokumentieren: „Which backend is the contract backend?“**
  - **Owner**: Backend
  - **Files/Modules**: `docs/backend/VERCEL_COMPATIBLE_BACKEND.md`, `vercel.json`, `api/` vs `backend/` deploy configs (`railway.toml`)
  - **Acceptance criteria**
    - Ein klarer, repo-gebundener Satz: „Frontend spricht **X** (api oder backend) in prod/dev“ inkl. Start/Deploy-Commands.

- **P0.2 — Auth: Unsicheren Shortcut entfernen + JWT Verification end-to-end definieren**
  - **Owner**: Backend
  - **Files/Modules**:
    - `api/_lib/handler.ts` (aktuell token==userId)
    - `backend/src/http/router.ts`, `backend/src/lib/auth/jwt.ts`, `backend/src/config/env.ts`
    - (optional) `docs/backend/CONTRACTS.md` / `API_SPEC.md` Auth Abschnitt
  - **Acceptance criteria**
    - Requests werden mit JWT verifiziert (issuer/audience/secret/alg festgelegt).
    - Anonymous nur dort erlaubt, wo explizit vorgesehen (z.B. `GET /health`, `GET /meta`).

- **P0.3 — Fix Env drift (backend)**
  - **Owner**: Backend
  - **Files/Modules**: `backend/src/config/env.ts`, `backend/src/config/config.ts`, `backend/tests/setup.ts`
  - **Acceptance criteria**
    - Env keys sind konsistent (Schema + Config + Tests).
    - `JWT_SECRET` ist vorhanden/validiert, DB URL/Path eindeutig.

#### P1 (Required for journal learning loop)

- **P1.1 — Journal Contract Alignment (status casing + response shape)**
  - **Owner**: Backend
  - **Files/Modules**:
    - `docs/backend/API_SPEC.md`, `docs/backend/CONTRACTS.md`
    - `api/_lib/domain/journal/types.ts`, `api/_lib/domain/journal/repo.ts`, `api/journal/*`
    - `backend/src/domain/journal/types.ts`, `backend/src/domain/journal/repo.ts`, `backend/src/routes/journal.ts`
  - **Acceptance criteria**
    - API Responses match `JournalEntry` v1 shape (lowercase status, ISO timestamps).
    - Idempotency-Key wird gemäß Spec aus Header gelesen.

- **P1.2 — Implement Frozen OnchainContext snapshot capture + persistence on create**
  - **Owner**: Backend
  - **Files/Modules (sollten entstehen/erweitert werden, minimal)**
    - Provider-adapter layer (DexPaprika + Moralis) – in `api/_lib/domain/` oder `backend/src/domain/`
    - Journal create path: `api/_lib/domain/journal/repo.ts` bzw. `backend/src/domain/journal/repo.ts`
    - Frontend contract reference: `src/types/journal.ts`
  - **Acceptance criteria**
    - Beim `POST /api/journal` wird ein `onchainContext` snapshot (gemäß `OnchainContextV1`) persistiert und später über `GET /api/journal`/`:id` ausgeliefert.
    - Snapshot-Fehler blockieren Write nicht (siehe P1.3).

- **P1.3 — Non-blocking enrichment & retries**
  - **Owner**: Backend
  - **Files/Modules**:
    - Journal create handler + provider clients
    - Optional queue/async job mechanism (minimal: best-effort in-request mit timeout; fallback: store partial snapshot + mark capturedAt)
  - **Acceptance criteria**
    - Journal create succeeds auch wenn Moralis/DexPaprika down/timeout.
    - Es gibt einen klaren, getesteten Fallback (z.B. `onchainContext` absent oder teilweise + späterer refresh-Mechanismus).

- **P1.4 — Tests: auth + journal + snapshot**
  - **Owner**: Backend
  - **Files/Modules**:
    - `api/tests/*`, `backend/tests/*`
  - **Acceptance criteria**
    - Tests decken JWT verification, journal status transitions, snapshot persistence/fallback ab.

#### P2 (Enhancements / consolidation)

- **P2.1 — Frontend: Journal von Stub → Backend wiring**
  - **Owner**: Frontend
  - **Files/Modules**:
    - `src/pages/Journal.tsx` (ersetzt `useJournalStub`)
    - `src/services/api/client.ts`
    - (neue) `src/services/journal/*` oder Anpassung bestehender Services
  - **Acceptance criteria**
    - Timeline/Inbox/Learn funktionieren mit echten `/api/journal` Daten.
    - Offline queue ist echt (Queue → retry → UI badge update), keine no-op.

- **P2.2 — Provider coverage erweitern (holders/transfers/liquidity/price)**
  - **Owner**: Backend
  - **Files/Modules**:
    - `backend/src/domain/grokPulse/sources.ts` ist nur teilweise; Journal braucht separate provider module.
    - `api/_lib/kv/types.ts` hat TTLs für holders/candles → Provider-Implementierung ergänzen.
  - **Acceptance criteria**
    - `OnchainContextV1` Felder sind vollständig und aus den vorgesehenen Providern befüllt (Moralis: holders/transfers; DexPaprika: price/liquidity/volume).

---

## Appendix: Component Inventory (purpose / data / stability / tests)

### Backend (Serverless, `api/`)

- **App bootstrap / handler**
  - **`api/_lib/handler.ts`**: Standard-Wrapper (CORS, errors, requestId, method dispatch, userId extraction).  
    - Data: `userId`, requestId  
    - Stability: **Experimental** (Auth shortcut)  
    - Tests: indirekt über integration specs (`api/tests/integration/*.spec.ts`)

- **KV layer**
  - **`api/_lib/kv/*`**: KV abstraction (Vercel KV or memory), key schemas + TTL.  
    - Data: journal entries/indices, alerts state, oracle snapshots, TA cache, rate limit buckets  
    - Stability: **Stable** (für dev/test), **Partial** (prod nur wenn KV env gesetzt)  
    - Tests: `api/tests/unit/kv.spec.ts`

- **Journal domain + routes**
  - **`api/_lib/domain/journal/*`**, **`api/journal/*`**  
    - Data: journal events, status transitions, indices  
    - Stability: **Partial** (status casing drift vs contract; auth missing)  
    - Tests: `api/tests/unit/journal-service.spec.ts`, `api/tests/integration/journal.spec.ts`

- **Alerts domain + routes**
  - **`api/_lib/domain/alerts/*`**, **`api/alerts/*`**  
    - Data: alert definitions/state, events, evaluation results  
    - Stability: **Partial** (evaluator uses deterministic providers; proxy to external alerts service exists)  
    - Tests: `api/tests/integration/alerts.spec.ts`, `api/tests/unit/state-machines.spec.ts`

- **Oracle**
  - **`api/_lib/domain/oracle/*`**, **`api/oracle/*`**  
    - Data: daily feed snapshots + per-user read states  
    - Stability: **Stable**  
    - Tests: `api/tests/integration/oracle.spec.ts`

- **TA**
  - **`api/_lib/domain/ta/*`**, **`api/chart/ta.ts`**  
    - Data: deterministic TA report + cache  
    - Stability: **Stable (stub)**  
    - Tests: `api/tests/integration/ta.spec.ts`

- **Reasoning**
  - **`api/_lib/reasoning/*`**, **`api/reasoning/*`**  
    - Data: LLM prompts/results + cache  
    - Stability: **Partial** (depends on env keys)  
    - Tests: `api/tests/integration/llm-routing.spec.ts`

### Backend (Node, `backend/`)

- **Server entry**
  - **`backend/src/server.ts`**: HTTP server + CORS (dev) + DB init + migrations + cleanup jobs.  
    - Data: SQLite DB `.data/*`, cleanup (kv/events/oracle/ta)  
    - Stability: **Partial** (config/env drift risk)  
    - Tests: N/A (covered indirectly by integration tests if runnable)

- **Router**
  - **`backend/src/http/router.ts`** + **`backend/src/app.ts`**: path router + auth extraction + route registration.  
    - Data: request parsing, userId derivation  
    - Stability: **Partial**  
    - Tests: integration specs under `backend/tests/integration/*`

- **Journal**
  - **`backend/src/domain/journal/*`**, **`backend/src/routes/journal.ts`**, migrations `backend/migrations/0003_journal_multitenancy.sql`  
    - Data: journal_entries_v2 + confirmations/archives  
    - Stability: **Partial** (contract drift)  
    - Tests: `backend/tests/integration/journal.spec.ts`

- **Alerts**
  - **`backend/src/domain/alerts/*`**, **`backend/src/routes/alerts.ts`**  
    - Data: alerts_v1 + alert_events_v1  
    - Stability: **Partial**  
    - Tests: `backend/tests/integration/alerts.spec.ts`

- **Oracle**
  - **`backend/src/domain/oracle/*`**, **`backend/src/routes/oracle.ts`**  
    - Data: oracle_daily_v1 + oracle_read_state_v1  
    - Stability: **Stable**  
    - Tests: `backend/tests/integration/oracle.spec.ts`

- **TA**
  - **`backend/src/domain/ta/*`**, **`backend/src/routes/ta.ts`**  
    - Data: ta_cache_v1  
    - Stability: **Stable (stub)**  
    - Tests: `backend/tests/integration/ta.spec.ts`

- **Grok Pulse**
  - **`backend/src/domain/grokPulse/*`**, **`backend/src/routes/grokPulse.ts`**  
    - Data: pulse snapshots/history + minimal market fields (DexPaprika + Moralis metadata)  
    - Stability: **Partial**  
    - Tests: `backend/tests/unit/grokPulse.spec.ts`

### Frontend (Root `src/`)

- **Journal UI**
  - **`src/pages/Journal.tsx`** + **`src/components/journal/*`**  
    - Data: `JournalEntryStub` via `src/stubs/*`  
    - Stability: **Stable (UI)**, **Experimental (data integration)**  
    - Tests: Playwright `playwright/tests/journal.spec.ts`

- **Offline storage**
  - **IndexedDB**: `src/services/db/db.ts` (stores alerts/journal/syncQueue/reasoning)
  - **Service Worker**: `src/sw/service-worker.ts` + `src/sw/*` (polling alerts/oracle, dedupe)
  - **Journal local queue**: `src/services/journal/journalQueue.ts` (no-op processing)
  - Stability: **Partial** (plumbing vorhanden, aber Journal writes noch Stub/no-op)

- **Contracts**
  - **Frozen Journal Contract**: `src/types/journal.ts` (inkl. `OnchainContextV1`)
  - Backend/API spec docs: `docs/backend/API_SPEC.md`, `docs/backend/CONTRACTS.md`


