# Updated Backend Acceptance Criteria

**Date:** January 3, 2026
**Status:** Active
**Reference:** `CONTRACTS.md`, `BACKEND_AUDIT_2026.md`

---

## 1. Security & Authentication

- [ ] **JWT Enforcement**: All protected routes must verify `Authorization: Bearer <token>`.
  - [ ] Valid HMAC-SHA256 signature required.
  - [ ] `exp` claim must be in the future.
  - [ ] `sub` (or `userId`) must be present.
  - [ ] Invalid/Missing token returns `401 Unauthorized` (Code: `AUTH_*`).
- [ ] **Spoofing Prevention**: Supplying `Authorization: Bearer <userId>` (raw string) must fail.
- [ ] **Secrets**: No secrets (API keys, JWT secrets) logged to console or files.

## 2. Resilience & Reliability

- [ ] **Retry Logic**: All upstream provider calls (OpenAI, Grok, etc.) must use `withRetry`.
  - [ ] Retries on `429`, `5xx`.
  - [ ] Retries on network errors (timeout, reset).
  - [ ] Respects `Retry-After` header if present.
  - [ ] Fails fast on `400` (Bad Request) or `401` (Upstream Auth Error).
- [ ] **Timeouts**: All upstream calls must have explicit timeouts (default < 30s).
- [ ] **Rate Limits**:
  - [ ] Global API rate limit active per user/IP.
  - [ ] Upstream `429` errors mapped to `503 Service Unavailable` or `429` with retry-after.

## 3. Contract Alignment

- [ ] **Journal Status**:
  - [ ] API responses MUST return lowercase status: `pending`, `confirmed`, `archived`.
  - [ ] API inputs MUST accept lowercase status.
  - [ ] Internal DB UPPERCASE status is fully encapsulated.
- [ ] **Error Format**: All errors match `{ error: { code, message, details? } }`.

## 4. Entitlements & Quotas (Appendix C)

**Reset:** Daily (rolling 24h).

### Quota Keys
- `oracle.dataRefresh` (Refresh of Oracle signal/market data per asset)
- `entitlements.refresh` (On-chain holder check)
- `pulse.run` (AI analysis run)
- `alert.simple` (Simple price alerts)
- `alert.advanced` (Shared cap for 2-stage / Dead-token)

### Tier Gates (JWT Claims)
- **Free**: No holder requirement.
- **Pro**: `holder:sparkfined` required.
- **High**: `holder:sparkfined` AND `holder:prehigh` required.
- **VIP**: `tier:vip` required.

### Daily Limits (Default)
| Key | Free | Pro | High | VIP |
|---|---|---|---|---|
| `oracle.dataRefresh` | 1 | 5 | 25 | ∞ |
| `pulse.run` | 1 | 10* | 50* | ∞ |
| `alert.simple` | 5 | 25 | 100 | ∞ |
| `alert.advanced` | 0 | 3 | 20 | ∞ |
| `entitlements.refresh`| 0 | 1 | 3 | ∞ |

*(*) Optional/Configurable*

### Enforcement
- **Gate Fail**: `403 Forbidden` (Code: `AUTH_FORBIDDEN`)
- **Quota Exceeded**: `429 Too Many Requests` (Code: `QUOTA_EXCEEDED`)
- **Rate Limit**: `429 Too Many Requests` (Code: `RATE_LIMITED`)

