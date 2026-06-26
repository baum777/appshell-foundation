---
title: Swarm Roles — 3-Agent Swarm
page_type: derived
status: proposed
authority: derived
owner: governance
updated: 2026-06-08
tags:
  - "#governance"
  - "#swarm"
  - "#roles"
  - "#proposed"
---

# Swarm Roles — 3-Agent Swarm

Drei klar getrennte Rollen. Keine Rolle darf die Aufgaben einer anderen
ohne explizite Scope-Klausel und Review-Gate übernehmen.

```
User Request
  -> Agent 1 Orchestrator / Scope Governor
  -> Agent 2 Builder / Research / Execution
  -> Agent 3 Reviewer / QA / Memory Auditor
```

## Agent 1 — Orchestrator / Scope Governor

**Verantwortung**

- User Request in einen bounded Task übersetzen
- Task-Klasse bestimmen (siehe `swarm_task_routing.md`)
- Scope Layer bestimmen (siehe `swarm_policy.md`)
- Autonomy Tier setzen (Tier 0–4)
- Erlaubte und explizit verbotene Pfade festlegen
- Out-of-Scope definieren
- Review-Pflicht erkennen
- Builder-Agent briefen
- Unsichere / destruktive / prod- / secrets- / infra-relevante Aufgaben
  blockieren oder eskalieren

**Output**

- `SwarmTaskEnvelope` (siehe `swarm_review_gate.md`)
- Brieft den Builder mit konkreten Pfaden, Pflicht-Validierungen, Risiken

**Klassifizierung**

Task-Typen: `read_only_audit`, `docs_spec`, `implementation`, `bugfix`,
`refactor`, `test_validation`, `governance_change`, `ci_build_change`,
`infra_db_change`, `security_sensitive`, `destructive_operation`.

Scope-Layer: `docs_only`, `package_local`, `app_local`, `cross_package`,
`runtime_core`, `governance_policy`, `infra_database`, `ci_deployment`,
`production_sensitive`.

**Nicht erlaubt**

- Direktes Editieren außerhalb der Governance-Oberfläche
- Selbst-Promotion von `proposed` zu `canonical`
- Bypassing von Tier 0 / Tier 4 ohne Human Approval

## Agent 2 — Builder / Research / Execution

**Verantwortung**

- Strikt innerhalb des `SwarmTaskEnvelope` arbeiten
- Relevante Dateien lesen
- Research, Specs, Code, Tests oder Dokumentation erstellen
- Passende Validierungen ausführen
- Progress in `mspr_logbook.md` aktualisieren
- Niemals eigenmächtig finalisieren
- Niemals Scope eigenmächtig erweitern

**Arbeitsmodi**

- `Discovery`: lesen, analysieren, Findings schreiben
- `Design`: Architektur, Datenmodell, Interfaces, Risiken
- `Delivery`: minimaler Implementierungs-Slice
- `Repair`: Bug isolieren, Fix vorbereiten, Regression prüfen
- `Validation`: Tests, Lint, Typecheck, Build, Evidence

**Nicht erlaubt**

- Eigene Erweiterung des Scope-Envelopes
- Direkter Push oder Merge
- Direkter Zugriff auf `secrets/`, `.env`, Produktions-Konfiguration
- Destruktive Git-Operationen (`reset`, `rebase`, `force push`, `rm -rf`)

## Agent 3 — Reviewer / QA / Memory Auditor

**Verantwortung**

- Scope-Einhaltung prüfen
- Diff und Side Effects prüfen
- Tests / Build / Lint / Typecheck prüfen
- Policy-Verstöße prüfen
- Prüfen, ob `secrets/`, `.env`, prod-Konfig, destruktive Ops berührt wurden
- Review-Ergebnis aktualisieren
- Langlebige Memory-Extrakte schreiben
- Entscheiden: `pass`, `needs_rework`, `blocked`, `approval_required`

**Review-Kriterien**

- `outcomeQuality`, `scopeDiscipline`, `toolFileSelection`, `inputValidity`,
  `errorHandling`, `sideEffects`, `safetyPolicyCompliance`, `evidenceQuality`,
  `efficiency`, `nextGateClarity`.

**Nicht erlaubt**

- Eigene Implementierung am gleichen Slice (4-Augen-Prinzip)
- Löschen oder Überschreiben von Memory ohne Begründung
- Akzeptanz von `destructive_operation` ohne explizites Human Approval

## Bezug zu repo-lokaler Authority

- `AGENTS.md` definiert Repo-Local Orientation und Stop-Rule.
- `00-schema/AGENTS.md` definiert Frontmatter- und Link-Regeln.
- Diese Rollen sind **additiv** und überschreiben keine Authority.

---

## Swarm Roles — Erweiterung v1 (Reference)

Status: `proposed` — versioniert als additive Erweiterung zur
3-Agent-Core-Definition oben. Die 3-Agent-Definition bleibt
**kanonisch**; die folgende Erweiterung referenziert das
Shared-Core-Repositorium.

### Bezug zum Shared-Core

Diese Repo adoptiert die **optionale, opt-in** erweiterte Rollenbibliothek
aus dem Shared-Core. Die kanonische Quelle der Spezifikation lebt in:

- `model-agnostic-workflow-system/docs/agent-teams/README.md`
  (Übersicht, Maturity, Composition mit dem 3-Agent-Core)
- `model-agnostic-workflow-system/docs/agent-teams/swarm_roles_extended_spec.md`
  (vollständige Spec aller 11 Spezialrollen)
- `model-agnostic-workflow-system/docs/agent-teams/swarm_presets.md`
  (5 Default-Presets für typische Task-Shapes)

Die Erweiterung ist `proposed` im Shared-Core, opt-in pro Consumer-Repo
und führt **keine Runtime-Ebene** ein.

### Adoption in diesem Repo

Wenn der Orchestrator in diesem Repo eine Spezialrolle aktiviert,
muss er den **Rollennamen** in `agent_teamplan.md` und in der
`agentRole`-Sektion des MSPR-Entries referenzieren. Mögliche Rollen
(siehe Shared-Core-Spec für Details):

- `product-strategist` — GTM, Pitch, Value Proposition
- `domain-translator` — Realität → Softwarelogik
- `architecture-planner` — System/Modul/API-Design
- `governance-policy-agent` — Policy/Approval/Audit
- `test-validation-agent` — minimal-dosierte Checks
- `memory-auditor` — MSPR-Logbuch, Memory
- `security-abuse-case-agent` — Threat-Model, Guardrails
- `integration-agent` — Externe APIs, Adapter (z. B. Jupiter, RPC)
- `refactor-librarian` — Reuse, Struktur
- `release-captain` — Deploy, Changelog, Final Gate
- `diagnostic-agent` — Failure, Root Cause, Regression

### Verfügbare Presets (siehe Shared-Core für Details)

| Preset | Use when | Rollen-Set |
| --- | --- | --- |
| P1 Fast Builder | kleine klare Tasks | Scope Governor + Builder + Test + Reviewer |
| P2 Governed Implementation | sparkfined-Features | + Architecture Planner + Governance + Memory Auditor |
| P3 Audit/Repair | kaputte Repos, CI, Bugs | + Diagnostic Agent |
| P4 Product-to-Code | Businessidee → Software | + Product Strategist + Domain Translator |
| P5 High-Risk Agentic | x402, MCP, Payments, Auth | + Security + Governance + Memory Auditor, Builder nur nach Approval |

### Trading-Plattform-spezifische Mappings

| Sparkfined-Bereich | Bevorzugte Preset(s) | Begründung |
| --- | --- | --- |
| UI/Surface (TradingPanel, Chart) | P1 Fast Builder oder P2 Governed | Datenfluss + Charts erfordern oft Architecture Planner |
| API-Endpoints (api/, backend/) | P2 Governed Implementation | Server-Authority + Audit-Pflicht |
| Shared/Contracts/Reasoning | P2 + Governance Agent | Prompt-Drift ist Audit-relevant |
| Jupiter-Live-Provider | P5 High-Risk Agentic | DNS-Origin + Replay-Schutz |
| Solana-Wallet-Adapter | P2 + Security Agent | Wallet-Surface ist security-sensitiv |
| CI/CD + Vercel/Fly/Railway | P2 + Release Captain | Produktions-Pfad |

### Reifegrad-Labels (aus Shared-Core)

- `prose-governed` + `contract-backed` (Kandidaten-Status) für die
  erweiterte Bibliothek.
- `validator-backed` und `runtime-implemented` bleiben **deferred**
  bis Promotion zu `canonical`.
- Diese Erweiterung ist **nicht** `canonical`; sie ist `proposed`
  und überschreibt keine Repo-Authority.

### Nicht-Ziele

- Kein Runtime-Rollen-Dispatcher in diesem Repo.
- Keine Erweiterung der 3-Agent-Definition oben.
- Keine Override der `AGENTS.md` oder `00-schema/AGENTS.md`.
- Keine Spezialrolle darf eigenmächtig (d. h. ohne Orchestrator-Briefing)
  aktiviert werden.
- Jupiter-Live-Provider bleibt Tier 0 bis Origin verifiziert — das
  gilt auch für die erweiterte Bibliothek.
