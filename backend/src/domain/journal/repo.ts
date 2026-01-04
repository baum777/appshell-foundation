/**
 * Journal Repository (SQLite Implementation)
 * MULTITENANT: All operations require userId - no global state
 * All queries MUST include WHERE user_id = ?
 */

import { getDatabase } from '../../db/sqlite.js';
import type {
  JournalRepo,
  JournalEvent,
  JournalStatus,
  JournalEntryRow,
  LegacyJournalStatus,
} from './types.js';
import {
  assertUserId,
  extractDayKey,
  normalizeStatus,
  toLegacyStatus,
} from './types.js';

// Re-export helpers for service usage
export { assertUserId, extractDayKey };

// ─────────────────────────────────────────────────────────────
// ROW MAPPING
// ─────────────────────────────────────────────────────────────

function rowToEvent(row: JournalEntryRow, confirmData?: JournalEvent['confirmData'], archiveData?: JournalEvent['archiveData']): JournalEvent {
  return {
    id: row.id,
    userId: row.user_id,
    side: row.side as JournalEvent['side'],
    status: normalizeStatus(row.status),
    timestamp: row.timestamp,
    summary: row.summary,
    dayKey: row.day_key || extractDayKey(row.timestamp),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
    // New fields
    assetId: row.asset_id || undefined,
    onchainContext: row.onchain_context_json ? JSON.parse(row.onchain_context_json) : undefined,
    contextStatus: row.context_status as any || undefined,

    confirmData,
    archiveData,
  };
}

// ─────────────────────────────────────────────────────────────
// SQLITE REPOSITORY IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

export class JournalRepoSQLite implements JournalRepo {
  async getEvent(userId: string, id: string): Promise<JournalEvent | null> {
    assertUserId(userId);
    const db = getDatabase();
    
    const row = db.prepare(`
      SELECT id, user_id, side, status, timestamp, summary, day_key, created_at, updated_at,
             asset_id, onchain_context_json, context_status
      FROM journal_entries_v2
      WHERE user_id = ? AND id = ?
    `).get(userId, id) as JournalEntryRow | undefined;
    
    if (!row) return null;
    
    // Fetch confirmation data if exists
    const confirmRow = db.prepare(`
      SELECT mood, note, tags_json, confirmed_at
      FROM journal_confirmations_v2
      WHERE entry_id = ? AND user_id = ?
    `).get(id, userId) as { mood: string; note: string; tags_json: string; confirmed_at: string } | undefined;
    
    // Fetch archive data if exists
    const archiveRow = db.prepare(`
      SELECT reason, archived_at
      FROM journal_archives_v2
      WHERE entry_id = ? AND user_id = ?
    `).get(id, userId) as { reason: string; archived_at: string } | undefined;
    
    return rowToEvent(
      row,
      confirmRow ? {
        mood: confirmRow.mood,
        note: confirmRow.note,
        tags: JSON.parse(confirmRow.tags_json),
        confirmedAt: confirmRow.confirmed_at,
      } : undefined,
      archiveRow ? {
        reason: archiveRow.reason,
        archivedAt: archiveRow.archived_at,
      } : undefined
    );
  }

  async putEvent(userId: string, event: JournalEvent): Promise<void> {
    assertUserId(userId);
    if (event.userId !== userId) {
      throw new Error(`Event userId mismatch: expected ${userId}, got ${event.userId}`);
    }
    
    const db = getDatabase();
    const legacyStatus = toLegacyStatus(event.status);
    
    db.prepare(`
      INSERT OR REPLACE INTO journal_entries_v2 
      (id, user_id, side, status, timestamp, summary, day_key, created_at, updated_at, asset_id, onchain_context_json, context_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      userId,
      event.side,
      legacyStatus,
      event.timestamp,
      event.summary,
      event.dayKey,
      event.createdAt,
      event.updatedAt,
      event.assetId || null,
      event.onchainContext ? JSON.stringify(event.onchainContext) : null,
      event.contextStatus || null
    );
    
    // Update confirmation data if present
    if (event.confirmData) {
      db.prepare(`
        INSERT OR REPLACE INTO journal_confirmations_v2 
        (entry_id, user_id, mood, note, tags_json, confirmed_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        event.id,
        userId,
        event.confirmData.mood,
        event.confirmData.note,
        JSON.stringify(event.confirmData.tags),
        event.confirmData.confirmedAt
      );
    }
    
    // Update archive data if present
    if (event.archiveData) {
      db.prepare(`
        INSERT OR REPLACE INTO journal_archives_v2 
        (entry_id, user_id, reason, archived_at)
        VALUES (?, ?, ?, ?)
      `).run(
        event.id,
        userId,
        event.archiveData.reason,
        event.archiveData.archivedAt
      );
    } else {
      // Remove archive data if not present (e.g., on restore)
      db.prepare(`DELETE FROM journal_archives_v2 WHERE entry_id = ? AND user_id = ?`).run(event.id, userId);
    }
  }

  async deleteEvent(userId: string, id: string): Promise<boolean> {
    assertUserId(userId);
    const db = getDatabase();
    
    const result = db.prepare(`
      DELETE FROM journal_entries_v2 WHERE user_id = ? AND id = ?
    `).run(userId, id);
    
    if (result.changes > 0) {
      // Cascade delete related data
      db.prepare(`DELETE FROM journal_confirmations_v2 WHERE entry_id = ? AND user_id = ?`).run(id, userId);
      db.prepare(`DELETE FROM journal_archives_v2 WHERE entry_id = ? AND user_id = ?`).run(id, userId);
      return true;
    }
    
    return false;
  }

  async listDayIds(userId: string, dayKey: string): Promise<string[]> {
    assertUserId(userId);
    const db = getDatabase();
    
    const rows = db.prepare(`
      SELECT id FROM journal_entries_v2 
      WHERE user_id = ? AND day_key = ?
      ORDER BY created_at ASC
    `).all(userId, dayKey) as { id: string }[];
    
    return rows.map(r => r.id);
  }

  async setDayIds(userId: string, _dayKey: string, _ids: string[]): Promise<void> {
    assertUserId(userId);
    // No-op in SQLite implementation
  }

  async listStatusIds(userId: string, status: JournalStatus): Promise<string[]> {
    assertUserId(userId);
    const db = getDatabase();
    const legacyStatus = toLegacyStatus(status);
    
    const rows = db.prepare(`
      SELECT id FROM journal_entries_v2 
      WHERE user_id = ? AND status = ?
      ORDER BY created_at ASC
    `).all(userId, legacyStatus) as { id: string }[];
    
    return rows.map(r => r.id);
  }

  async setStatusIds(userId: string, _status: JournalStatus, _ids: string[]): Promise<void> {
    assertUserId(userId);
    // No-op in SQLite implementation
  }

  async getUpdatedAt(userId: string): Promise<string | null> {
    assertUserId(userId);
    const db = getDatabase();
    
    const row = db.prepare(`
      SELECT MAX(updated_at) as max_updated FROM journal_entries_v2 
      WHERE user_id = ?
    `).get(userId) as { max_updated: string | null } | undefined;
    
    return row?.max_updated || null;
  }

  async setUpdatedAt(userId: string, _iso: string): Promise<void> {
    assertUserId(userId);
    // No-op in SQLite implementation
  }

  // Added for Service usage to replace legacy standalone function
  async listEvents(
    userId: string,
    status?: LegacyJournalStatus,
    limit = 50,
    cursor?: string
  ): Promise<{ items: JournalEvent[]; nextCursor?: string }> {
    assertUserId(userId);
    const db = getDatabase();
    
    let query = `
      SELECT id, user_id, side, status, timestamp, summary, day_key, created_at, updated_at,
             asset_id, onchain_context_json, context_status
      FROM journal_entries_v2
      WHERE user_id = ?
    `;
    
    const params: (string | number)[] = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (cursor) {
      query += ' AND timestamp < ?';
      params.push(cursor);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit + 1);
    
    const rows = db.prepare(query).all(...params) as JournalEntryRow[];
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(row => rowToEvent(row));
    
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]?.timestamp : undefined,
    };
  }
}

// Singleton instance for convenience
export const journalRepoSQLite = new JournalRepoSQLite();
