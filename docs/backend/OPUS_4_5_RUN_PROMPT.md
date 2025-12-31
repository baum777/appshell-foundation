# OPUS_4_5_RUN_PROMPT (copy/paste)

Du bist **Opus 4.5** und sollst den vollständigen Backend-Stack + minimal notwendiges Frontend-Wiring in **einem einzigen Run** implementieren. **Keine Rückfragen. Keine Spekulation.** Halte dich strikt an die repo-nativen Spezifikationen unter `docs/backend/`.

## Non‑negotiable Rules
- **Contracts are law**: `docs/backend/CONTRACTS.md` ist Source-of-Truth. Keine Abweichungen.
- **Docs-only drift prevention**: Wenn du eine Entscheidung treffen musst, die nicht in den Docs steht, markiere sie als `// BACKEND_TODO:` und wähle die UI-sicherste Default.
- **TypeScript-first**: kein `any`, keine untypisierten JSON blobs ohne Interface.
- **UI/UX unverändert**: keine Layout-/Copy-/Flow-Redesigns. Nur Wiring.
- **Error schema**: Jede Error-Response entspricht `ErrorResponse` (status/message/code/requestId/details?).
- **Determinismus**: TA endpoint und Alert Engines müssen mit fixed clock/seed deterministisch testbar sein.
- **Versioning**: respektiere `sparkfined_*_v1` localStorage keys und `kv:v1:*` key patterns.

## Acceptance Gates (müssen am Ende grün sein)
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run test:e2e`
- `npm run test:backend`

---

## Implementation Order (strict, no reordering)

### Phase 1 — Foundations
1. Implementiere Backend Skeleton + Router unter `/api`.
2. Implementiere env/config parsing + request-id + error mapping.
3. Implementiere rate limit + caching headers wie in `docs/backend/API_SPEC.md`.

### Phase 2 — Data Stores
4. Implementiere SQLite DB unter `./.data/tradeapp.sqlite` und SQL migrations:
   - `backend/migrations/0001_init.sql`
   - `backend/migrations/0002_indexes.sql`
5. Implementiere Migration runner, der beim Start idempotent läuft.

### Phase 3 — Journal
6. Implementiere Journal domain repo + routes exakt wie `docs/backend/API_SPEC.md`:
   - `GET /api/journal` (inkl. `view` alias)
   - `GET /api/journal/:id`
   - `POST /api/journal`
   - `POST /api/journal/:id/confirm`
   - `POST /api/journal/:id/archive`
   - `POST /api/journal/:id/restore`
   - `DELETE /api/journal/:id`

### Phase 4 — Alerts (Core + Advanced)
7. Implementiere Alerts CRUD + list filter.
8. Implementiere Alert Events Store + `GET /api/alerts/events`.
9. Implementiere TWO_STAGE_CONFIRMED engine (2-of-3) + expiry/cooldown + event emission.
10. Implementiere DEAD_TOKEN_AWAKENING_V2 engine (deadness gating, 3-stage session, max 12h) + events.

### Phase 5 — Oracle
11. Implementiere `GET /api/oracle/daily` (pinned `today-takeaway`) + caching policy.
12. Implementiere Read-State endpoints:
    - `PUT /api/oracle/read-state`
    - `POST /api/oracle/read-state/bulk`

### Phase 6 — Chart TA (stub deterministic)
13. Implementiere `POST /api/chart/ta` returning `TAReport` exakt wie `docs/backend/CONTRACTS.md`.
14. Implementiere server-side cache bucketed by day (24h TTL) wie `DATA_STORES.md`.

### Phase 7 — Service Worker (optional, aber nach Spec)
15. Implementiere SW files wie `docs/backend/SW_SPEC.md` (poll, dedupe, notifications).
16. Registriere SW in `src/main.tsx` ohne UX-Änderung.

### Phase 8 — Frontend Wiring (no redesign)
17. Ersetze stub/local-only Stores schrittweise, UI-safe:
    - Journal: `src/pages/Journal.tsx` nutzt API statt stub data.
    - Alerts: `src/components/alerts/useAlertsStore.ts` persist/load via API (localStorage fallback nur wenn API down; `// BACKEND_TODO` falls nötig).
    - Oracle: `src/pages/Oracle.tsx` lädt `/api/oracle/daily` und nutzt `/read-state`.

### Phase 9 — Tests
18. Füge `npm run test:backend` hinzu (Unit + Integration).
19. Implementiere Unit/Integration Tests nach `docs/backend/TEST_PLAN.md`.
20. Optional: füge Playwright backend e2e specs hinzu und aktiviere sie erst, wenn UI tatsächlich API nutzt (`// BACKEND_TODO`).

---

## Exact File List (create/modify)

### Create (Backend)
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/src/server.ts`
- `backend/src/app.ts`
- `backend/src/config/env.ts`
- `backend/src/config/config.ts`
- `backend/src/http/router.ts`
- `backend/src/http/error.ts`
- `backend/src/http/requestId.ts`
- `backend/src/http/rateLimit.ts`
- `backend/src/http/cacheHeaders.ts`
- `backend/src/observability/logger.ts`
- `backend/src/db/sqlite.ts`
- `backend/src/db/migrate.ts`
- `backend/migrations/0001_init.sql`
- `backend/migrations/0002_indexes.sql`
- `backend/src/routes/journal.ts`
- `backend/src/domain/journal/types.ts`
- `backend/src/domain/journal/repo.ts`
- `backend/src/routes/alerts.ts`
- `backend/src/routes/ta.ts`
- `backend/src/routes/oracle.ts`
- `backend/src/domain/alerts/types.ts`
- `backend/src/domain/alerts/repo.ts`
- `backend/src/domain/alerts/eventsRepo.ts`
- `backend/src/domain/alerts/evaluator.ts`
- `backend/src/domain/alerts/twoStageMachine.ts`
- `backend/src/domain/alerts/deadTokenMachine.ts`
- `backend/src/domain/alerts/deadTokenDetector.ts`
- `backend/src/domain/oracle/generator.ts`
- `backend/src/domain/oracle/repo.ts`
- `backend/src/domain/oracle/readStateRepo.ts`
- `backend/src/domain/ta/taGenerator.ts`
- `backend/src/domain/ta/cacheRepo.ts`
- `backend/src/validation/*` (zod schemas)
- `backend/tests/unit/*`
- `backend/tests/integration/*`

### Create (Service Worker)
- `src/sw/service-worker.ts`
- `src/sw/sw-contracts.ts`
- `src/sw/sw-storage.ts`
- `src/sw/sw-scheduler.ts`
- `src/sw/sw-alerts.ts`
- `src/sw/sw-oracle.ts`

### Modify
- `.env.example` (append backend envs)
- `package.json` (scripts for backend start + test:backend; ggf. deps)
- `vite.config.ts` (SW output/registration support; ggf. dev proxy to backend)
- `src/main.tsx` (SW registration)
- `src/pages/Journal.tsx`
- `src/pages/Oracle.tsx`
- `src/components/alerts/useAlertsStore.ts`

---

## Final Checklist
- Stelle sicher, dass jede Route in `docs/backend/API_SPEC.md` existiert, inkl. Statuscodes und Error codes.
- Stelle sicher, dass alle TS Interfaces exakt matchen (`CONTRACTS.md`).
- Stelle sicher, dass alle Tests aus `TEST_PLAN.md` implementiert sind und deterministisch laufen.

