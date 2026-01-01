# Vercel-Compatible Backend Architecture (Foundation v1 → v2-ready)

**Purpose:** This document defines the **non-negotiable architectural constraints** and the **target design** for deploying the backend on **Vercel** safely.

It exists to prevent “almost works in dev” backends (server processes, local SQLite, intervals) from being implemented again.

> **Rule:** If a backend change conflicts with this document, it is **NO-GO** for Vercel.

---

## 1) Executive Decision

### Deployment Target

* **Primary:** Vercel (Production)
* **Runtime model:** Serverless + optional Edge for read-mostly routes

### Non-negotiables (Vercel constraints)

* ❌ No long-running server process (no Express/Fastify “listen”).
* ❌ No background intervals (`setInterval`, cron-like loops inside functions).
* ❌ No local persistent filesystem assumptions.
* ❌ No local SQLite as system-of-record.
* ✅ All backend work must run as **request-driven serverless functions** or **Vercel Cron**.
* ✅ All operations must be **idempotent** and safe under retries/cold starts.

---

## 2) Target Architecture Overview

### Components

1. **Frontend (PWA)**

* UI/UX already implemented.
* Offline-first client state stays client-side (IndexedDB/Dexie).

2. **API Layer (`/api/*`)**

* Vercel Serverless Functions (Node runtime).
* Optional: Vercel Edge Functions only for simple, read-only, cache-friendly endpoints.

3. **State & Storage (server-side)**

* **Primary:** Vercel KV (Redis) for fast state, caps, queues, idempotency keys.
* **Optional:** External DB (Postgres) if long-term relational queries are required.
* **Never:** SQLite on local disk as source of truth.

4. **Service Worker (client-side orchestration)**

* SW coordinates polling schedules and local persistence.
* SW calls serverless endpoints for evaluations and emits local notifications.

5. **Cron (optional, minimal)**

* Use Vercel Cron for periodic snapshot refresh (e.g., Oracle daily snapshot) and housekeeping.
* Cron must be **stateless** per run.

---

## 3) Data Ownership & Source of Truth

### Client-side (PWA) owns

* UI state, local cache, optimistic UI
* Offline queueing
* IndexedDB/Dexie stores used by UI

### Server-side owns

* Durable global state needed across devices:

  * Alerts definitions/instances
  * Alert stage/session state (if not purely local)
  * Oracle feed snapshots + read state
  * Usage caps / rate limits
  * Idempotency keys / dedupe

### Recommended split by feature

* **Journal:** client-first (Dexie). Server provides sync endpoints later.
* **Alerts:** server owns definitions + emits; SW owns polling cadence.
* **Oracle:** server owns snapshot generation + read state.

---

## 4) API Design Rules

### 4.1 Consistent Error Schema

Every endpoint returns one error shape:

* `{ ok: false, error: { code, message, details?, requestId } }`

Every success returns:

* `{ ok: true, data: ... , requestId }`

### 4.2 Idempotency

All write operations MUST support safe retries:

* Create alert / update alert
* Emit alert stage events
* Mark oracle read

Mechanism:

* Client sends `Idempotency-Key` header (uuid) OR body field.
* Server stores a dedupe record in KV with TTL.

### 4.3 Timeouts & Runtime

* No endpoint depends on long chains of external calls.
* Any external-provider fetch must have:

  * tight timeout
  * fallback/stub behavior
  * caching

### 4.4 Caching (read endpoints)

* Use KV cache keys with TTL for heavy reads.
* Edge is allowed only for:

  * read-only, cacheable endpoints
  * no secrets in runtime output

---

## 5) Background Work Rules (No Intervals)

### Forbidden

* `setInterval` inside server code
* in-memory job queues
* “always-on” worker process

### Allowed

1. **Vercel Cron**

* Schedules periodic runs
* Each run is stateless and idempotent

2. **On-demand evaluation**

* SW calls `/api/alerts/evaluate` at a controlled cadence.

3. **Client-driven polling**

* SW decides *when* to poll.
* Backend decides *what is confirmed*.

---

## 6) Alerts Architecture (Vercel-safe)

### 6.1 Alert Types

* SIMPLE (price above/below/cross)
* TWO_STAGE_CONFIRMED (2-of-3)
* DEAD_TOKEN_AWAKENING_V2 (3-stage session)

### 6.2 Who does what

**Service Worker (client):**

* Maintains a polling schedule per active watch candidate/session
* Persists minimal state for restart safety (IndexedDB)
* Calls serverless evaluation endpoints
* Emits browser notifications locally (if permitted)

**Backend (serverless):**

* Stores alert definitions/instances (KV/DB)
* Evaluates rules deterministically based on current data
* Enforces cooldown, expiry, one-shot stage emits
* Returns updated stage state + any “emit” events

### 6.3 Evaluation Pattern

* SW calls `POST /api/alerts/evaluate` with:

  * symbol/address
  * timeframe
  * alertId(s)
  * lastSeen candle timestamp (optional)
* Server returns:

  * updated stage state
  * emit events (0..n)
  * next recommended poll hint (optional)

> **Key:** The SW is not a “truth engine”. It is a “scheduler + local notifier”.

---

## 7) Dead Token Awakening v2 (Vercel-safe session)

### Session management

* Session start is triggered by evaluation result, not by background loops.
* Session state is stored in KV/DB (or client-only if explicitly chosen).
* The 12h hard stop is checked on each evaluation call.

### External data sourcing

* If DexPaprika / Moralis are used:

  * Fetch must be timeout-protected
  * Cache intermediate results in KV
  * Provide deterministic stub mode when missing keys

---

## 8) Oracle Architecture (Vercel-safe)

### Snapshot model

* Daily snapshot generated by:

  * Vercel Cron (preferred)
  * OR first user request of the day triggers refresh with cache lock

### Read state

* Stored server-side per user (if auth) OR client-side localStorage for v1.
* If server-side, require:

  * user identifier
  * idempotent mark-read endpoint

---

## 9) Journal Architecture (Vercel-safe)

### v1 (now)

* Journal remains client-first (Dexie).
* Backend endpoints may exist as stubs for future sync but must not break UI.

### v2 (later)

* Add sync endpoints + conflict strategy
* Add ingestion endpoints (wallet events) behind rate limits

---

## 10) Chart TA Endpoint (Vercel-safe)

### v1

* Provide deterministic stub analysis endpoint that returns final schema.
* No model call required.

### v2

* Add GPT Vision integration behind:

  * rate limits
  * size limits for screenshots
  * caching by (market, timeframe, ts)

---

## 11) Environment Variables (minimum set)

### Required (production)

* `KV_REST_API_URL`
* `KV_REST_API_TOKEN`
* `KV_REST_API_READ_ONLY_TOKEN` (if used)

### External providers (optional, but must stub if missing)

* `DEXPAPRIKA_API_KEY` (if required)
* `MORALIS_API_KEY`

### AI (optional)

* `OPENAI_API_KEY` (or equivalent)

> Missing optional provider keys must not crash prod. The system returns deterministic stub outputs and logs a warning.

---

## 12) Observability & Safety

### Logging

* Log requestId + route + duration
* Never log secrets or raw wallet addresses unless explicitly allowed

### Rate limits

* Minimum per-IP / per-user caps for:

  * alerts evaluate
  * oracle refresh
  * TA analyze

### Dedupe

* Alert emits must be deduped by:

  * (alertId + stage + stageWindowStart) with TTL

---

## 13) Vercel Deploy Requirements

### Required files

* `vercel.json` (must exist)
* API routes under `src/pages/api/*` or `api/*` depending on framework conventions

### Forbidden patterns (grep should find none)

* `app.listen(`
* `setInterval(`
* `sqlite3` / better-sqlite3 as primary store
* writing to filesystem for persistence

---

## 14) GO / NO-GO Gate

### GO when

* All backend work is request-driven serverless or Vercel Cron.
* No local SQLite as source of truth.
* No intervals.
* All APIs conform to the shared error schema.
* Alerts are idempotent and restart-safe.

### NO-GO when

* Any server process or interval is required for correctness.
* Any durable state depends on local disk.
* Any endpoint can duplicate emits or spam due to missing idempotency.

---

## 15) Open Decisions (must be resolved before Opus run)

1. **Auth model**

* Anonymous user (local-only) vs user identity for server-side persistence

2. **Where does alert state live?**

* KV/DB (recommended for cross-device)
* or client-only (simpler, but not cross-device)

3. **Provider coverage**

* Which market data provider is the canonical source?

Document your choices here before implementation.
