# TEST_PLAN (Unit + Integration + E2E)

Ziel: Backend so testen, dass es **deterministisch**, **schema-stabil** und **UI-kompatibel** ist.

---

## 0) Test-Kommandos (Acceptance Gates)

Backend-Implementierung muss folgende Commands in CI lokal bestehen:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run test:e2e`

Zusätzlich (neu, vom Backend einzuführen):
- `npm run test:backend` (Unit + Integration)

---

## 1) Golden Fixtures (deterministisch)

### 1.1 Deterministische Zeit
- Alle Backend-Tests müssen Zeit kontrollieren:
  - feste `NOW = 2025-12-31T12:00:00.000Z`
  - keine `Date.now()` ohne Injektion/Clock Provider.

### 1.2 Deterministische “Market Data” Stubs
Da externe Feeds fehlen, müssen Tests eine deterministische Quote-Quelle verwenden:
- Provider Interface: `PriceFeedProvider.getLastPrice(symbolOrAddress, timeframe) -> number`
- Test Fixture: `seed="test-seed-v1"`
- Preisfunktion (golden): stable hash über `(seed, symbol, floor(now/60s))`.

> // BACKEND_TODO: spätere Integration mit echten Börsen/Onchain APIs.

### 1.3 Golden Alert Scenarios
Definiere pro AlertType feste Szenarien:
- **SIMPLE**:
  - Case Above: lastPrice crosses from 99 → 101 against target 100
  - Case Below: 101 → 99 target 100
  - Case Cross: crosses either direction (Definition in Backend fixieren)
- **TWO_STAGE_CONFIRMED**:
  - 2-of-3 indicators true innerhalb window → confirmed
  - expiry erreicht vor 2-of-3 → expired
  - cooldown respected (keine erneute confirmation)
- **DEAD_TOKEN_AWAKENING_V2**:
  - deadness precondition true
  - AWAKENING emit, danach SUSTAINED emit, danach SECOND_SURGE emit
  - session max 12h → SESSION_ENDED

---

## 2) Unit Tests (Backend intern)

### 2.1 Validation Schemas
**Ziel**: Jede API-Request-Schema-Validierung muss deterministisch Fehler liefern (Details + Code).

- **Files (neu)**:
  - `backend/src/validation/*.ts`
  - `backend/tests/unit/validation.spec.ts`
- **Tests (Minimum)**:
  - `POST /api/journal` rejects missing `summary` → `400 VALIDATION_FAILED`
  - `POST /api/alerts` rejects unknown `type` → `400 VALIDATION_FAILED`
  - `PUT /api/oracle/read-state` rejects empty `id` → `400 VALIDATION_FAILED`

### 2.2 Error Mapping + Request IDs
- **Files**:
  - `backend/src/http/error.ts`
  - `backend/src/http/requestId.ts`
  - `backend/tests/unit/errors.spec.ts`
- **Tests**:
  - Jeder Fehler enthält `requestId` und `code`.
  - Response Header `x-request-id` ist gesetzt und equals `requestId`.

### 2.3 State Machines
- **Files**:
  - `backend/src/domain/alerts/twoStageMachine.ts`
  - `backend/src/domain/alerts/deadTokenMachine.ts`
  - `backend/tests/unit/state-machines.spec.ts`
- **Tests**:
  - TWO_STAGE: 2-of-3 innerhalb Window → `CONFIRMED` + emit `TWO_STAGE_CONFIRMED`
  - TWO_STAGE: expiry erreicht → `EXPIRED` + disabled/paused
  - DEAD_TOKEN: deadness precondition gating (kein Stage1 ohne deadness)
  - DEAD_TOKEN: session max 12h enforced → `SESSION_ENDED`

### 2.4 Deterministic TA Generator
- **Files**:
  - `backend/src/domain/ta/taGenerator.ts`
  - `backend/tests/unit/ta.spec.ts`
- **Tests**:
  - Gleiche Inputs (market/timeframe/replay + fixed clock) → exakt gleiche `TAReport` JSON
  - `assumptions` echo korrekt gesetzt

---

## 3) Integration Tests (HTTP + DB)

### 3.1 Test Setup
- **DB**: SQLite temp file pro Test-Suite (z.B. `./.data/test-<pid>.sqlite`)
- **Server**: In-Process HTTP (Fastify inject oder Supertest) ohne echte Ports in CI.
- **Files**:
  - `backend/tests/integration/journal.spec.ts`
  - `backend/tests/integration/alerts.spec.ts`
  - `backend/tests/integration/oracle.spec.ts`
  - `backend/tests/integration/ta.spec.ts`

### 3.2 Journal API
- `POST /api/journal` → 201, Entry `status=pending`, `timestamp` ISO
- `GET /api/journal?view=pending` → enthält created Entry
- `POST /api/journal/:id/confirm` → status becomes confirmed
- `POST /api/journal/:id/archive` → status archived, 200 idempotent on repeat
- `POST /api/journal/:id/restore` → status pending
- `DELETE /api/journal/:id` → 204; danach `GET` → 404 `JOURNAL_NOT_FOUND`

### 3.3 Alerts API
- Create SIMPLE → returns `SimpleAlert` fields, enabled=true, status=active, stage=WATCHING
- Toggle pause via `PATCH enabled=false` → status=paused
- Cancel watch → stage=CANCELLED, enabled=false, status=paused
- Events endpoint:
  - After evaluation tick, `GET /api/alerts/events` returns `AlertEmitted[]` with stable schema

### 3.4 Oracle API
- `GET /api/oracle/daily` returns pinned id `"today-takeaway"` + insights list
- `PUT /api/oracle/read-state` persists and is reflected on next `GET /daily`
- bulk mark all read updates takeaway + insights

### 3.5 TA API
- `POST /api/chart/ta` returns deterministic `TAReport`
- caching semantics optional to test (header presence)

---

## 4) E2E Tests (Playwright)

### 4.1 Ziel
E2E muss sicherstellen, dass UI mit Backend zusammen funktioniert **ohne** UX-Änderungen.

### 4.2 Test Harness
- `playwright.config.ts` muss Backend + Frontend starten (oder ein Combined Dev Server).
- Empfohlen: setze `VITE_API_URL=http://localhost:<backendPort>/api` im Playwright `webServer.env`.

### 4.3 Neue E2E Specs (minimal)
- `playwright/tests/backend-journal.spec.ts`
  - Create Journal entry via API (request in test)
  - Visit `/journal?entry=<id>` → UI zeigt Entry (nach Integration weg von Stub)
- `playwright/tests/backend-alerts.spec.ts`
  - Create SIMPLE alert via API
  - Visit `/alerts` → AlertCard sichtbar, toggle pause works
- `playwright/tests/backend-oracle.spec.ts`
  - Visit `/oracle` → shows takeaway card + insights
  - Toggle read → persists across reload (server read-state)

> Hinweis: Solange UI noch Stub-Hooks nutzt, sind diese E2E Tests als **// BACKEND_TODO** zu markieren und erst nach UI-Integration zu aktivieren.

