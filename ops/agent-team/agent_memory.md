---
title: Agent Memory
page_type: derived
status: proposed
authority: derived
owner: governance
updated: 2026-06-08
tags:
  - "#governance"
  - "#swarm"
  - "#memory"
  - "#proposed"
---

# Agent Memory

Drei Memory-Ebenen, wie im OrchestrAI_Labs-Prinzip vorgesehen. Diese
Datei ist **additives Governance-Memory** und ersetzt weder
`02-wiki/index.md` noch `03-mspr/packets/`.

## Working Memory

Kurzlebig. Nur aktueller Task. Wird in `mspr_logbook.md` als Progress-
Sektion pro Entry geführt. Wird mit Abschluss des Tasks verworfen.

> **Beispiel** (nicht eintragspflichtig):
>
> - User Request: <request>
> - Aktive Pfade: <paths>
> - Aktive Findings: <findings>
> - Verworfen bei Task-Ende.

## Repo Memory

Dauerhaft. Wird in Markdown-Artefakten unter `ops/agent-team/` (und
in `02-wiki/index.md` für dauerhafte Verweise) gespeichert. Nur
langlebige Erkenntnisse aufnehmen.

Aktuell Repo-Memory-Items:

| Datum | Item | Quelle | Status |
| --- | --- | --- | --- |
| 2026-06-08 | sparkfined ist Vite/React Frontend + Node-Backend (api/, backend/, apps/backend-alerts/) + Playwright E2E. | `package.json` + `AGENTS.md` | active |
| 2026-06-08 | Standard-Validierungen: `pnpm typecheck`, `pnpm contract:typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm verify`, `pnpm lint`, `pnpm doc:check`. | `package.json` scripts | active |
| 2026-06-08 | Solana-Wallet-Adapter und Sentry sind in der Dependency-Liste; Änderungen daran sind Tier 3 + Reviewer. | `package.json` deps | active |
| 2026-06-08 | Jupiter-API-Auflösung ist `ENOTFOUND`-Risiko. Live-Provider bleibt Tier 0 bis Verifikation. | `03-mspr/packets/2026-05-21-terminal-api-jupiter-dns-risk` | active |
| 2026-06-08 | Chart-Candles-Provider-Entscheidung ist Review-Gate-pflichtig (Spec/Stub vs. Live). | `02-wiki/log.md` `terminal-chart-candles-provider-decision` | active |
| 2026-06-08 | Function-Wiki-Pflichtfelder: `id`, `type`, `canonical`, `updated`, `freshness`, `perf.*`. | `00-schema/AGENTS.md` | active |
| 2026-06-08 | Update-Protokoll: Profiling-Run aktualisiert `perf.*`; Schema-Änderung setzt `freshness: stale`; Append an `02-wiki/log.md` mit `update | {id} | metric_delta`. | `00-schema/AGENTS.md` | active |

## Semantic Memory

Optional. Wird nur aktiviert, wenn das Repo eine Embedding-, Vector-DB-
oder Retrieval-Infrastruktur aufbaut. Im aktuellen Zustand nicht
vorhanden; kein Aufbau geplant.

**Nicht implementieren, solange keine bestehende Retrieval- oder
Vector-Infrastruktur existiert.**

## Memory-Regeln (verbindlich)

- Nur langlebige Erkenntnisse speichern.
- Keine Secrets. Niemals.
- Keine privaten Daten.
- Keine ungeprüften Vermutungen als Fakt speichern.
- Immer Quelle / Kontext angeben.
- Memory darf Scope oder Policy nicht überschreiben.
- Bei Konflikt zwischen Memory und `AGENTS.md` / `00-schema/AGENTS.md`
  gilt die kanonische Quelle.

## Promotion-Regel

Items in der Repo-Memory-Tabelle sind mit `proposed` markiert, bis sie
mindestens einmal in einem realen Workstream verwendet und vom
Reviewer bestätigt wurden. Danach Status `active`. Veraltete Items
werden mit `stale` markiert und nach einer Retension-Periode entfernt.

## Role-Typed Memory (Extended Roles v1)

Bei Aktivierung einer Spezialrolle aus dem Shared-Core (siehe
`swarm_roles.md` Erweiterung v1) werden langlebige Erkenntnisse nach
Rollen-Typ getrennt erfasst. Jede Zeile trägt ein `role`-Tag.

| Datum | role | Item | Quelle | Status |
| --- | --- | --- | --- | --- |
| 2026-06-08 | (alle) | Shared-Core Rollenbibliothek ist `proposed`; Adoption hier ist opt-in und additiv. | `model-agnostic-workflow-system/docs/agent-teams/README.md` | active |
| 2026-06-08 | `architecture-planner` | Frontend (`src/`) ist Vite/React + shadcn/ui; Backend (`api/`, `backend/`, `apps/backend-alerts/`) ist Node/Express mit Playwright E2E. | `package.json` | active |
| 2026-06-08 | `security-abuse-case-agent` | Jupiter-API-Auflösung `ENOTFOUND`-Risiko: Live-Provider bleibt Tier 0 bis DNS-Origin verifiziert. | `03-mspr/packets/2026-05-21-terminal-api-jupiter-dns-risk.json` | active |
| 2026-06-08 | `integration-agent` | Solana Wallet Adapter + Sentry + RPC-Provider: Tier 3 + Security bei Änderungen. | `package.json` deps | active |
| 2026-06-08 | `test-validation-agent` | Standard-Validierungen: `pnpm typecheck`, `pnpm contract:typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm verify`, `pnpm lint`, `pnpm doc:check`. | `package.json` scripts | active |
| 2026-06-08 | `governance-policy-agent` | Chart-Candles-Provider-Entscheidung ist Review-Gate-pflichtig (Spec/Stub vs. Live). | `02-wiki/log.md` `terminal-chart-candles-provider-decision` | active |
| 2026-06-08 | `release-captain` | Verifier-Skript (`pnpm verify`) kombiniert Backend-Typecheck, -Build, -Test, Root-Typecheck, Vite-Build, Vitest. Jeder Release-Slice muss das gesamte Verify durchlaufen. | `package.json` | active |
| 2026-06-08 | `diagnostic-agent` | Function-Wiki-Pflichtfelder: `id`, `type`, `canonical`, `updated`, `freshness`, `perf.*`. Update-Protokoll: Profiling-Run aktualisiert `perf.*`; Schema-Änderung setzt `freshness: stale`. | `00-schema/AGENTS.md` | active |

**Role-Index:** siehe Shared-Core-Spec
`swarm_roles_extended_spec.md` für die vollständige Liste und
Aktivierungs-Modi.
