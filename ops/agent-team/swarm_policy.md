---
title: Swarm Policy
page_type: derived
status: proposed
authority: derived
owner: governance
updated: 2026-06-08
tags:
  - "#governance"
  - "#swarm"
  - "#policy"
  - "#proposed"
---

# Swarm Policy

Diese Policy ist **additiv** zur repo-lokalen Authority (`AGENTS.md`,
`00-schema/AGENTS.md`). Bei Konflikt gewinnt die kanonische Quelle.
Diese Datei operationalisiert die Agent-Disziplin, ändert aber keine
Produkt- oder Runtime-Authority.

## Tier-Modell

| Tier | Name | Agent-Verhalten |
| --- | --- | --- |
| 0 | Blocked | Keine Aktion. Human Approval erforderlich. |
| 1 | Read-only | Nur Lesen und Findings. Keine Schreibvorgänge. |
| 2 | Draft / Spec | Drafts, Specs, Findings. Keine produktiven Writes. |
| 3 | Execute + Review | Implementiert, benötigt Reviewer-Pass. |
| 4 | Autonomous | Autonom mit harten Limits, Audit-Trail verpflichtend. |

## Immer blockieren oder eskalieren (Tier 0)

- `.env` lesen oder ändern
- Secrets ausgeben oder posten
- Produktions-Konfiguration ändern
- Daten löschen oder droppen
- Destruktive Git-Operationen (`force push`, `reset --hard`, rebase
  mit History-Rewrite, `rm -rf` in Repo-Scope)
- Migrationen ohne expliziten Auftrag
- Deployment ohne expliziten Auftrag
- Zugriff auf private Credentials
- Wallet-Adapter-Änderungen ohne Audit
- Solana-Programm-ID-Änderungen ohne explizite Freigabe

## Immer review-pflichtig (Tier 3 + Reviewer)

- Runtime-Core
- Agent-Core / Governance
- CI / Build / Package Manager
- Datenbank / Migration (Backend-Migrationen, SQLite- oder Postgres-)
- Auth / Permissions
- Externe API-Integrationen (z. B. Jupiter, RPC-Provider, OpenAI)
- Cross-Package-Refactors
- Schema- oder Contract-Drift
- Änderungen an `vercel.json`, `fly.toml`, `railway.toml`, `.vercel/**`
- Provider-Usage-Hooks und Token-Capture
- Plan- oder Reasoning-Prompts in `shared/contracts/**`

## Meist ohne Review möglich (Tier 1–2)

- Read-only Analyse
- Lokale Dokumentationsentwürfe
- Nicht-invasive Specs
- Reine Findings / Progress Updates
- Reine Memory-Extrakte in `agent_memory.md`
- Reine Wiki- oder Logbuch-Appends
- Reine Appends an `02-wiki/log.md`

## Bezug zu sparkfined-spezifischen Regeln

- **Verify-Skript** (`pnpm verify`): kombiniert Backend-Typecheck,
  -Build, -Test, Root-Typecheck, Vite-Build, Vitest. Tier 3 + Reviewer
  bei jedem Implementation-Slice, der `verify` berührt.
- **E2E via Playwright**: Tier 3 + Reviewer. Bestehende Patterns
  (z. B. `terminal-chart-candles-provider-decision`) zeigen, dass
  Live-Provider-Entscheidungen Review-Gate-pflichtig sind.
- **Solana-Wallet-Adapter** und **Sentry**: Tier 3 + Reviewer.
- **Local Postgres via Docker**: Tier 3 mit Hinweis auf den bestehenden
  Service in `apps/backend-alerts`. Produktion bleibt externer Vertrag.
- **Jupiter-DNS-Risiko** (siehe `2026-05-21-terminal-api-jupiter-dns-risk`):
  Tier 0 / Human Approval, solange Origin-Auflösung nicht verifiziert ist.
- **CI-Workflows** in `.github/workflows/**`: Tier 3 + Reviewer.

## Memory- und Logbuch-Regeln

- Memory darf Scope oder Policy **nicht** überschreiben.
- Keine Secrets in Memory. Niemals.
- Keine privaten Daten in Memory.
- Keine ungeprüften Vermutungen als Fakt speichern.
- Immer Quelle / Kontext angeben.
- Langlebige Erkenntnisse nur, wenn sie für künftige Runs tatsächlich
  relevant sind.

## Verstoß-Verhalten

Verstöße gegen Tier 0 werden sofort gestoppt und als MSPR-Packet
unter `03-mspr/packets/` mit `status: blocked` geloggt. Tier 3
Verstöße führen zu `needs_rework` mit konkreter Scope- oder
Policy-Korrektur. Bestehende Packets (z. B.
`2026-05-13-p0-runtime-verification-risk`) zeigen die gelebte Praxis.
