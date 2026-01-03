# Backend Audit & Fix Report 2026

**Date:** January 3, 2026
**Auditor:** Gemini 3

---

## 1. Inventory

### Routes / Controllers
- `backend/src/routes/alerts.ts`
- `backend/src/routes/grokPulse.ts`
- `backend/src/routes/health.ts`
- `backend/src/routes/journal.ts`
- `backend/src/routes/oracle.ts`
- `backend/src/routes/ta.ts`
- `backend/src/routes/usage.ts`
- `backend/src/routes/reasoning/*.ts` (Reasoning Engine)

### Domain Services
- `backend/src/domain/alerts/` (Evaluator, State Machines)
- `backend/src/domain/grokPulse/` (Engine, Lexicon)
- `backend/src/domain/journal/` (Repo, Types)
- `backend/src/domain/oracle/` (Generator, Repo)
- `backend/src/domain/ta/` (Generator, Cache)

### Adapters (Clients)
- `backend/src/clients/openaiClient.ts`
- `backend/src/clients/deepseekClient.ts`
- `backend/src/clients/grokClient.ts`
- `backend/src/clients/opusClient.ts`
- `backend/src/clients/llmRouter.ts`

### Database / Persistence
- `backend/src/db/sqlite.ts` (Primary Store)
- `backend/src/db/kv.ts` (Key-Value Store)
- `backend/src/db/migrate.ts` (Migrations)

### Utilities / Lib
- `backend/src/lib/budget/` (Budget Gate)
- `backend/src/lib/kv/` (Store wrapper)
- `backend/src/lib/rateLimit/` (Limiter)
- `backend/src/lib/usage/` (Usage Tracker)

### Configuration & Observability
- `backend/src/config/env.ts`
- `backend/src/config/config.ts`
- `backend/src/observability/logger.ts`

### Tests
- `backend/src/tests/unit/`
- `backend/tests/integration/` (Root level)

---

## 2. Contract Drift Analysis

### Journal Status Casing
**Finding:** Critical mismatch between Internal DB and Public API contract.
- **Contract (`CONTRACTS.md`):** Expects lowercase status (`pending`, `confirmed`, `archived`) for query params and response fields.
- **Internal (`domain/journal/types.ts`):** Defines `JournalStatus` as UPPERCASE (`PENDING`, `CONFIRMED`, `ARCHIVED`).
- **Code (`routes/journal.ts`):** Directly returns domain objects without conversion.
- **Impact:** Frontend interfaces expecting lowercase values will break or display incorrect UI states.
- **Fix:** Map to lowercase in route handlers.

### Other Potential Drifts
- **Oracle Insight:** Backend implementation seems aligned with `OracleStub` (title, summary, theme, isRead), but strict validation should be enforced.
- **Alerts:** Backend implements `AlertStage` and `AlertStatus`. Need to ensure `enabled` logic maps correctly to `paused` status in responses.

---

## 3. Adapter Scorecards

### OpenAI Client (`clients/openaiClient.ts`)
- **Auth:** Bearer Token via Env (`OPENAI_API_KEY`). Secure.
- **Timeout:** Uses `AbortController` (good).
- **Retry/Backoff:** **MISSING**. No logic to handle `429 Too Many Requests` or `5xx` errors.
- **Rate Limits:** **MISSING**. Does not respect `Retry-After`.
- **Error Normalization:** Basic check for `res.ok`, throws raw error.
- **Recommendation:** Wrap in `withRetry` utility; normalize `429` to internal `PROVIDER_RATE_LIMITED` or handle backoff transparently.

### DeepSeek / Grok / Opus Clients
- **Analysis:** Likely share same pattern as OpenAI client (copy-paste implementation).
- **Issues:** Same lack of retry/backoff resilience.
- **Recommendation:** Apply shared `withRetry` wrapper to all LLM clients.

---

## 4. Security Findings

### [CRITICAL] Auth Bypass / Impersonation
**File:** `backend/src/http/router.ts`
- **Finding:** The `extractUserId` method naively trusts the Bearer token content:
  ```ts
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7) || 'anon';
  }
  ```
- **Risk:** Any attacker can send `Authorization: Bearer any-user-id` and become that user.
- **Fix (P0):** Implement JWT verification. Validate signature, expiration, and `sub` claim.

### Secret Handling
- **Status:** Secrets loaded via `dotenv`.
- **Risk:** No explicit check preventing secrets from being logged in `logger.ts`.
- **Fix:** Ensure logger sanitizes sensitive keys if full objects are logged.

### Rate Limiting
- **Status:** `rateLimiters` exist in `http/rateLimit.ts`.
- **Check:** Ensure global rate limits are active for all routes, not just resource-intensive ones.

