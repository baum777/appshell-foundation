-- Performance indexes per DATA_STORES.md

-- KV Store
CREATE INDEX IF NOT EXISTS kv_v1_expires_at_idx ON kv_v1(expires_at);

-- Journal
CREATE INDEX IF NOT EXISTS journal_entries_v1_status_idx ON journal_entries_v1(status);
CREATE INDEX IF NOT EXISTS journal_entries_v1_timestamp_idx ON journal_entries_v1(timestamp);

-- Alerts
CREATE INDEX IF NOT EXISTS alerts_v1_type_idx ON alerts_v1(type);
CREATE INDEX IF NOT EXISTS alerts_v1_symbol_idx ON alerts_v1(symbol_or_address);
CREATE INDEX IF NOT EXISTS alerts_v1_status_stage_idx ON alerts_v1(status, stage);
CREATE INDEX IF NOT EXISTS alerts_v1_enabled_idx ON alerts_v1(enabled);

-- Alert Events
CREATE INDEX IF NOT EXISTS alert_events_v1_occurred_at_idx ON alert_events_v1(occurred_at);
CREATE INDEX IF NOT EXISTS alert_events_v1_alert_id_idx ON alert_events_v1(alert_id);

-- Oracle
CREATE INDEX IF NOT EXISTS oracle_read_state_v1_user_idx ON oracle_read_state_v1(user_id);

-- TA Cache
CREATE INDEX IF NOT EXISTS ta_cache_v1_expires_at_idx ON ta_cache_v1(expires_at);
