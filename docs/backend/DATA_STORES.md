# DATA_STORES (v1)

Ziel: klar definieren, **wo** Daten leben (Backend DB/KV vs. Browser localStorage/IndexedDB), mit **Key Prefixes**, **TTLs**, **Migration/Versioning** und **Indexes**.

---

## 0) Storage Layers

### Backend (server-side)
- **Primary DB**: SQLite (v1), file-basiert, deterministisch in Dev/CI.
- **KV-Abstraktion**: KV-Keys aus `CONTRACTS.md` müssen auch ohne Redis funktionieren → in SQLite als KV-Table abbilden.
- **In-memory Cache (optional)**: nur als Performance-Cache, niemals Source-of-Truth.

### Browser (client-side)
- **localStorage**: bestehende UI-Key-Map `sparkfined_*_v1` darf nicht brechen.
- **IndexedDB (Service Worker)**: `sparkfined_sw_v1` für Dedupe + Wasserstände (siehe `SW_SPEC.md`).

---

## 1) Backend SQLite Layout (verbindlich)

### DB Datei
- **Default Path**: `./.data/tradeapp.sqlite`
- **Env override**: `DATABASE_URL=sqlite:./.data/tradeapp.sqlite`

> `./.data/` muss bei Start automatisch erstellt werden.

### Migrations
**Migration Files (SQL)**:
- `backend/migrations/0001_init.sql`
- `backend/migrations/0002_indexes.sql`

**Migration State Table**:
- `schema_migrations(version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`

---

## 2) Tabellen & Indexes (v1)

### 2.1 KV Store (für `kv:v1:*` Keys)

**Table**: `kv_v1`

```sql
key TEXT PRIMARY KEY,
value_json TEXT NOT NULL,
expires_at INTEGER NULL,   -- unix epoch seconds
updated_at INTEGER NOT NULL
```

**Indexes**:
- `CREATE INDEX kv_v1_expires_at_idx ON kv_v1(expires_at);`

**TTL Enforcement**:
- Cleanup job bei Server-Start und dann alle 10min:
  - delete where `expires_at IS NOT NULL AND expires_at <= now`

---

### 2.2 Journal

**Table**: `journal_entries_v1`

```sql
id TEXT PRIMARY KEY,
side TEXT NOT NULL,        -- "BUY" | "SELL"
status TEXT NOT NULL,      -- "pending" | "confirmed" | "archived"
timestamp TEXT NOT NULL,   -- ISO
summary TEXT NOT NULL,
created_at TEXT NOT NULL,  -- ISO
updated_at TEXT NOT NULL   -- ISO
```

**Indexes**:
- `journal_entries_v1_status_idx(status)`
- `journal_entries_v1_timestamp_idx(timestamp)`

**Confirm Payload Table**: `journal_confirmations_v1`

```sql
entry_id TEXT PRIMARY KEY REFERENCES journal_entries_v1(id) ON DELETE CASCADE,
mood TEXT NOT NULL,
note TEXT NOT NULL,
tags_json TEXT NOT NULL,
confirmed_at TEXT NOT NULL
```

**Archive Reason Table**: `journal_archives_v1`

```sql
entry_id TEXT PRIMARY KEY REFERENCES journal_entries_v1(id) ON DELETE CASCADE,
reason TEXT NOT NULL,
archived_at TEXT NOT NULL
```

---

### 2.3 Alerts

**Table**: `alerts_v1`

```sql
id TEXT PRIMARY KEY,
type TEXT NOT NULL,              -- AlertType
symbol_or_address TEXT NOT NULL,
timeframe TEXT NOT NULL,
enabled INTEGER NOT NULL,         -- 0/1
status TEXT NOT NULL,             -- "active" | "paused" | "triggered"
stage TEXT NOT NULL,              -- AlertStage
created_at TEXT NOT NULL,         -- ISO
note TEXT NULL,

-- Type-specific JSON (Simple/TwoStage/DeadToken):
payload_json TEXT NOT NULL,

-- Common time fields used by engines:
expires_at TEXT NULL,
cooldown_ends_at TEXT NULL,
updated_at TEXT NOT NULL
```

**Indexes**:
- `alerts_v1_type_idx(type)`
- `alerts_v1_symbol_idx(symbol_or_address)`
- `alerts_v1_status_stage_idx(status, stage)`
- `alerts_v1_enabled_idx(enabled)`

---

### 2.4 Alert Events (for `/api/alerts/events`)

**Table**: `alert_events_v1`

```sql
event_id TEXT PRIMARY KEY,
occurred_at TEXT NOT NULL,     -- ISO
alert_id TEXT NOT NULL,
payload_json TEXT NOT NULL
```

**Indexes**:
- `alert_events_v1_occurred_at_idx(occurred_at)`
- `alert_events_v1_alert_id_idx(alert_id)`

**Retention**:
- 30 Tage (Cleanup job täglich oder on-start).

---

### 2.5 Oracle

**Table**: `oracle_daily_v1`

```sql
date TEXT PRIMARY KEY,          -- "YYYY-MM-DD"
payload_json TEXT NOT NULL,     -- OracleDailyFeed without user read flags
created_at TEXT NOT NULL
```

**Table**: `oracle_read_state_v1`

```sql
user_id TEXT NOT NULL,
id TEXT NOT NULL,               -- insightId OR "today-takeaway"
is_read INTEGER NOT NULL,       -- 0/1
updated_at TEXT NOT NULL,
PRIMARY KEY (user_id, id)
```

**Indexes**:
- `oracle_read_state_v1_user_idx(user_id)`

---

### 2.6 TA Cache

**Table**: `ta_cache_v1`

```sql
key TEXT PRIMARY KEY,           -- see CONTRACTS kv:v1:ta:...
payload_json TEXT NOT NULL,     -- TAReport
expires_at INTEGER NOT NULL,
created_at TEXT NOT NULL
```

**Indexes**:
- `ta_cache_v1_expires_at_idx(expires_at)`

TTL: 24h.

---

## 3) Browser Storage (bestehend)

### 3.1 localStorage (UI)
Siehe `docs/backend/CONTRACTS.md` → Tabelle “Browser LocalStorage”.

### 3.2 IndexedDB (Service Worker)
Siehe `docs/backend/SW_SPEC.md` → `sparkfined_sw_v1`.

---

## 4) Versioning / Migration Strategy

### 4.1 Backend DB
- `*_v1` Tabellen bleiben stabil.
- Breaking changes → neue Tabellen `*_v2` + backfill job + dual-read window.
- Jede Migration ist eine SQL-Datei in `backend/migrations/`.

### 4.2 KV Key Versioning
- Prefix enthält Version: `kv:v1:...`
- Breaking key format → `kv:v2:...` (nicht überschreiben).

### 4.3 Browser Keys
- Existing UI keys bleiben `sparkfined_*_v1`.
- Wenn UI später migriert:
  - schreibe `sparkfined_*_v2` und lese fallback `v1` einmalig, dann delete `v1`.
  - **// BACKEND_TODO:** UI Sync across devices.

