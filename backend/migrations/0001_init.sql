-- Initial database schema
-- Per DATA_STORES.md v1

-- KV Store (for kv:v1:* keys)
CREATE TABLE IF NOT EXISTS kv_v1 (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  expires_at INTEGER NULL,
  updated_at INTEGER NOT NULL
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries_v1 (
  id TEXT PRIMARY KEY,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'archived')),
  timestamp TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Journal Confirmations
CREATE TABLE IF NOT EXISTS journal_confirmations_v1 (
  entry_id TEXT PRIMARY KEY REFERENCES journal_entries_v1(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  note TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  confirmed_at TEXT NOT NULL
);

-- Journal Archives
CREATE TABLE IF NOT EXISTS journal_archives_v1 (
  entry_id TEXT PRIMARY KEY REFERENCES journal_entries_v1(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  archived_at TEXT NOT NULL
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts_v1 (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('SIMPLE', 'TWO_STAGE_CONFIRMED', 'DEAD_TOKEN_AWAKENING_V2')),
  symbol_or_address TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'triggered')),
  stage TEXT NOT NULL CHECK (stage IN ('INITIAL', 'WATCHING', 'CONFIRMED', 'EXPIRED', 'CANCELLED')),
  created_at TEXT NOT NULL,
  note TEXT NULL,
  payload_json TEXT NOT NULL,
  expires_at TEXT NULL,
  cooldown_ends_at TEXT NULL,
  updated_at TEXT NOT NULL
);

-- Alert Events
CREATE TABLE IF NOT EXISTS alert_events_v1 (
  event_id TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  alert_id TEXT NOT NULL,
  payload_json TEXT NOT NULL
);

-- Oracle Daily
CREATE TABLE IF NOT EXISTS oracle_daily_v1 (
  date TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Oracle Read State
CREATE TABLE IF NOT EXISTS oracle_read_state_v1 (
  user_id TEXT NOT NULL,
  id TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, id)
);

-- TA Cache
CREATE TABLE IF NOT EXISTS ta_cache_v1 (
  key TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
