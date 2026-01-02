-- Journal Multitenancy Migration
-- Adds userId-scoped tables for journal entries
-- Per HARD RULE: All journal operations require userId - no global state

-- ─────────────────────────────────────────────────────────────
-- V2 TABLES (with user_id scope)
-- ─────────────────────────────────────────────────────────────

-- Journal Entries V2 (userId-scoped)
CREATE TABLE IF NOT EXISTS journal_entries_v2 (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'archived')),
  timestamp TEXT NOT NULL,
  summary TEXT NOT NULL,
  day_key TEXT NOT NULL, -- YYYY-MM-DD for efficient day-based queries
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, id)
);

-- Journal Confirmations V2 (userId-scoped)
CREATE TABLE IF NOT EXISTS journal_confirmations_v2 (
  entry_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  note TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  confirmed_at TEXT NOT NULL,
  PRIMARY KEY (user_id, entry_id),
  FOREIGN KEY (user_id, entry_id) REFERENCES journal_entries_v2(user_id, id) ON DELETE CASCADE
);

-- Journal Archives V2 (userId-scoped)
CREATE TABLE IF NOT EXISTS journal_archives_v2 (
  entry_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  archived_at TEXT NOT NULL,
  PRIMARY KEY (user_id, entry_id),
  FOREIGN KEY (user_id, entry_id) REFERENCES journal_entries_v2(user_id, id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES (userId-scoped queries)
-- ─────────────────────────────────────────────────────────────

-- Primary query patterns:
-- 1. List entries by userId + status
-- 2. List entries by userId + day_key
-- 3. Get entry by userId + id (covered by PK)

CREATE INDEX IF NOT EXISTS journal_entries_v2_user_status_idx 
  ON journal_entries_v2(user_id, status);

CREATE INDEX IF NOT EXISTS journal_entries_v2_user_day_idx 
  ON journal_entries_v2(user_id, day_key);

CREATE INDEX IF NOT EXISTS journal_entries_v2_user_timestamp_idx 
  ON journal_entries_v2(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS journal_entries_v2_user_created_idx 
  ON journal_entries_v2(user_id, created_at ASC);

CREATE INDEX IF NOT EXISTS journal_entries_v2_user_updated_idx 
  ON journal_entries_v2(user_id, updated_at DESC);

-- ─────────────────────────────────────────────────────────────
-- NOTE: V1 tables are NOT dropped
-- ─────────────────────────────────────────────────────────────
-- Per MIGRATION RULE:
-- "If existing global keys exist and cannot be mapped to userId,
--  choose 'hard reset journal' (ignore old keys).
--  Do not create insecure default-user fallback."
--
-- The v1 tables remain for reference but are no longer used.
-- New multitenancy code uses v2 tables exclusively.
-- Old data in v1 is orphaned and should be manually cleaned up.

