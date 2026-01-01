import { randomUUID } from 'crypto';
import { getDatabase } from '../../db/sqlite.js';
import type {
  JournalEntry,
  JournalEntryRow,
  JournalEntryStatus,
  JournalCreateRequest,
  JournalConfirmPayload,
} from './types.js';

/**
 * Journal Repository
 * Handles persistence for journal entries
 */

function rowToEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    side: row.side as JournalEntry['side'],
    status: row.status as JournalEntryStatus,
    timestamp: row.timestamp,
    summary: row.summary,
  };
}

export function journalCreate(
  request: JournalCreateRequest,
  idempotencyKey?: string
): JournalEntry {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const id = idempotencyKey || `entry-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const timestamp = request.timestamp || now;
  
  db.prepare(`
    INSERT INTO journal_entries_v1 (id, side, status, timestamp, summary, created_at, updated_at)
    VALUES (?, ?, 'pending', ?, ?, ?, ?)
  `).run(id, request.side, timestamp, request.summary, now, now);
  
  return {
    id,
    side: request.side,
    status: 'pending',
    timestamp,
    summary: request.summary,
  };
}

export function journalGetById(id: string): JournalEntry | null {
  const db = getDatabase();
  
  const row = db.prepare(`
    SELECT id, side, status, timestamp, summary, created_at, updated_at
    FROM journal_entries_v1
    WHERE id = ?
  `).get(id) as JournalEntryRow | undefined;
  
  if (!row) {
    return null;
  }
  
  return rowToEntry(row);
}

export function journalList(
  status?: JournalEntryStatus,
  limit = 50,
  cursor?: string
): { items: JournalEntry[]; nextCursor?: string } {
  const db = getDatabase();
  
  let query = `
    SELECT id, side, status, timestamp, summary, created_at, updated_at
    FROM journal_entries_v1
  `;
  
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  
  if (cursor) {
    conditions.push('timestamp < ?');
    params.push(cursor);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit + 1); // Fetch one extra to detect next page
  
  const rows = db.prepare(query).all(...params) as JournalEntryRow[];
  
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map(rowToEntry);
  
  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.timestamp : undefined,
  };
}

export function journalConfirm(
  id: string,
  payload: JournalConfirmPayload
): JournalEntry | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const entry = journalGetById(id);
  if (!entry) {
    return null;
  }
  
  // Idempotent: if already confirmed, just return
  if (entry.status === 'confirmed') {
    return entry;
  }
  
  // Update entry status first
  db.prepare(`
    UPDATE journal_entries_v1
    SET status = 'confirmed', updated_at = ?
    WHERE id = ?
  `).run(now, id);
  
  // Then insert confirmation details
  db.prepare(`
    INSERT OR REPLACE INTO journal_confirmations_v1 (entry_id, mood, note, tags_json, confirmed_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, payload.mood, payload.note, JSON.stringify(payload.tags), now);
  
  return {
    ...entry,
    status: 'confirmed',
  };
}

export function journalArchive(id: string, reason: string): JournalEntry | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const entry = journalGetById(id);
  if (!entry) {
    return null;
  }
  
  // Idempotent: if already archived, just return
  if (entry.status === 'archived') {
    return entry;
  }
  
  db.transaction(() => {
    db.prepare(`
      UPDATE journal_entries_v1
      SET status = 'archived', updated_at = ?
      WHERE id = ?
    `).run(now, id);
    
    db.prepare(`
      INSERT OR REPLACE INTO journal_archives_v1 (entry_id, reason, archived_at)
      VALUES (?, ?, ?)
    `).run(id, reason, now);
  })();
  
  return {
    ...entry,
    status: 'archived',
  };
}

export function journalRestore(id: string): JournalEntry | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const entry = journalGetById(id);
  if (!entry) {
    return null;
  }
  
  // Idempotent: if already pending, just return
  if (entry.status === 'pending') {
    return entry;
  }
  
  db.prepare(`
    UPDATE journal_entries_v1
    SET status = 'pending', updated_at = ?
    WHERE id = ?
  `).run(now, id);
  
  // Remove archive record if exists
  db.prepare(`DELETE FROM journal_archives_v1 WHERE entry_id = ?`).run(id);
  
  return {
    ...entry,
    status: 'pending',
  };
}

export function journalDelete(id: string): boolean {
  const db = getDatabase();
  
  const result = db.prepare(`
    DELETE FROM journal_entries_v1 WHERE id = ?
  `).run(id);
  
  return result.changes > 0;
}
