-- Journal Onchain Context Migration
-- Adds assetId and persistent market snapshot support to journal entries
-- Per BACKEND_JOURNAL_ONCHAIN_CONTEXT.md

ALTER TABLE journal_entries_v2 ADD COLUMN asset_id TEXT;
ALTER TABLE journal_entries_v2 ADD COLUMN onchain_context_json TEXT;
ALTER TABLE journal_entries_v2 ADD COLUMN context_status TEXT CHECK (context_status IN ('missing', 'complete', 'failed'));

-- Add index for finding entries with missing context (for background repair)
CREATE INDEX IF NOT EXISTS journal_entries_v2_context_status_idx 
  ON journal_entries_v2(context_status)
  WHERE context_status = 'missing';

-- Add index for finding entries by assetId (for history lookup)
CREATE INDEX IF NOT EXISTS journal_entries_v2_asset_idx 
  ON journal_entries_v2(user_id, asset_id);
