---
title: Swarm Task Routing
page_type: derived
status: proposed
authority: derived
owner: governance
updated: 2026-06-08
tags:
  - "#governance"
  - "#swarm"
  - "#routing"
  - "#proposed"
---

# Swarm Task Routing

Variable Routing-Logik: jede Task-Klasse wird an Orchestrator / Builder /
Reviewer verteilt, mit Autonomy Tier und Review-Pflicht.

## Routing-Tabelle

| Task-Klasse | Orchestrator | Builder | Reviewer | Tier | Review |
| --- | --- | --- | --- | --- | --- |
| `read_only_audit` | Scope klassifizieren | Dateien lesen, Findings schreiben | Memory prüfen | Tier 1 | Nein |
| `docs_spec` | Scope und Zielstruktur setzen | Spec schreiben | Konsistenz prüfen | Tier 2 | Optional |
| `implementation` | Slice begrenzen | Code + Tests | Diff / Test / Policy prüfen | Tier 3 | Ja |
| `bugfix` | Scope + Repro setzen | Fix + Test | Regression + Diff prüfen | Tier 3 | Ja |
| `refactor` | Scope + Risiko setzen | Minimaler Refactor-Slice | Diff + Test prüfen | Tier 3 | Ja |
| `test_validation` | Validierungsumfang setzen | Tests / Lint / Typecheck ausführen | Evidence prüfen | Tier 2 | Optional |
| `governance_change` | Policy-Trigger prüfen | Docs / Rules ändern | Streng prüfen | Tier 3 | Ja |
| `ci_build_change` | Risk-Gate setzen | Minimal ändern | Full Validation | Tier 3 | Ja |
| `infra_db_change` | Approval erkennen | Nur mit Freigabe ändern | Streng prüfen | Tier 0 / 3 | Ja |
| `security_sensitive` | Blockieren oder eskalieren | Spec / Patch entwerfen | Streng prüfen | Tier 0 / 3 | Human Approval |
| `destructive_operation` | Blockieren | Nicht ausführen | Eskalieren | Tier 0 | Human Approval |

## sparkfined-spezifische Mappings

| Repo-Pfad / -Datei | Routing-Hinweis |
| --- | --- |
| `src/**` (Vite/React Frontend) | `implementation` (Tier 3) — UI-Surface |
| `api/**` | `implementation` oder `test_validation` (Tier 2–3) — Backend-API |
| `backend/**` | `implementation` (Tier 3) — Canonical Backend |
| `apps/backend-alerts/**` | `implementation` (Tier 3) — Sub-App |
| `shared/contracts/**` | `governance_change` (Tier 3) — Reasoning-Prompts und Provider-Verträge |
| `playwright/**`, `tests/**` | `test_validation` (Tier 2) — E2E- und Unit-Tests |
| `00-schema/**`, `02-wiki/**`, `03-mspr/**` | `governance_change` (Tier 3) |
| `vercel.json`, `fly.toml`, `railway.toml`, `.vercel/**` | `ci_build_change` (Tier 3) |
| `.env`, `.env.example`, `.env.*.local` | `governance_change` (Tier 3) — Secrets-Discipline |
| `audit/**`, `scripts/audit/**` | `read_only_audit` (Tier 1) — Findings-only |
| `docs/**` | `docs_spec` (Tier 2) |
| `AGENTS.md`, `README.md`, `00-schema/AGENTS.md` | `governance_change` (Tier 3) |

## Routing-Beispiel

User Request: *"Integriere den Jupiter-API-Provider für `/api/quote`
echt."*

1. Orchestrator klassifiziert `implementation` und stellt fest: Bestehender
   MSPR-Packet `2026-05-21-terminal-api-jupiter-dns-risk` belegt, dass
   Jupiter-DNS-Auflösung `ENOTFOUND` blockiert.
2. Orchestrator eskaliert daher: kombinierte Klasse
   `security_sensitive` + `infra_db_change`, Tier 0 mit
   **explizitem Human Approval** (Provider-Origin und DNS-Verifikation
   fehlen).
3. Builder entwirft eine **Spec / Stub-Layer** mit Fail-Closed-Verhalten
   und Tests. Führt `pnpm verify` aus. Schreibt Findings in
   `mspr_logbook.md`.
4. Reviewer prüft Drift, Side Effects, DNS-Edge-Case, und lehnt
   produktive Implementierung ab, bis Origin verifiziert ist.
5. Bei `pass` der Spec: Übergang an nächsten Gate (DNS-Setup, Smoke,
   dann Re-Routing auf Tier 3).

## Routing-Override

Wenn ein Task eine Kombination aus Klassen hat (z. B. Implementation +
Governance-Change), gilt die **strengste** Klasse. Konflikte werden
in `mspr_logbook.md` als MSPR-Entry dokumentiert.
