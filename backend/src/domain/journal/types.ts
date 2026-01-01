/**
 * Journal Domain Types
 * Matches CONTRACTS.md JournalEntry schema
 */

export type JournalEntrySide = 'BUY' | 'SELL';
export type JournalEntryStatus = 'pending' | 'confirmed' | 'archived';

export interface JournalEntry {
  id: string;
  side: JournalEntrySide;
  status: JournalEntryStatus;
  timestamp: string;
  summary: string;
}

export interface JournalConfirmPayload {
  mood: string;
  note: string;
  tags: string[];
}

export interface JournalCreateRequest {
  side: JournalEntrySide;
  summary: string;
  timestamp?: string;
}

export interface JournalArchiveRequest {
  reason: string;
}

export interface JournalListResponse {
  items: JournalEntry[];
  nextCursor?: string;
}

// Internal database representation
export interface JournalEntryRow {
  id: string;
  side: string;
  status: string;
  timestamp: string;
  summary: string;
  created_at: string;
  updated_at: string;
}

export interface JournalConfirmationRow {
  entry_id: string;
  mood: string;
  note: string;
  tags_json: string;
  confirmed_at: string;
}

export interface JournalArchiveRow {
  entry_id: string;
  reason: string;
  archived_at: string;
}
