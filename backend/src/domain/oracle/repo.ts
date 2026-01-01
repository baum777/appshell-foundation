import { getDatabase } from '../../db/sqlite.js';
import type {
  OracleDailyFeed,
  OracleReadState,
} from './types.js';
import { generateDailyFeed, getDateString } from './generator.js';

/**
 * Oracle Repository
 * Handles persistence for daily feeds and read states
 */

export function oracleGetDaily(date: Date, userId: string): OracleDailyFeed {
  const dateStr = getDateString(date);
  const db = getDatabase();
  
  // Try to get cached daily feed
  const cached = db.prepare(`
    SELECT payload_json FROM oracle_daily_v1 WHERE date = ?
  `).get(dateStr) as { payload_json: string } | undefined;
  
  let feed: OracleDailyFeed;
  
  if (cached) {
    feed = JSON.parse(cached.payload_json) as OracleDailyFeed;
  } else {
    // Generate new feed and cache it
    feed = generateDailyFeed(dateStr);
    
    db.prepare(`
      INSERT OR REPLACE INTO oracle_daily_v1 (date, payload_json, created_at)
      VALUES (?, ?, ?)
    `).run(dateStr, JSON.stringify(feed), new Date().toISOString());
  }
  
  // Apply user's read states
  const readStates = getReadStatesForUser(userId);
  
  feed.pinned.isRead = readStates.get(feed.pinned.id) ?? false;
  
  feed.insights = feed.insights.map(insight => ({
    ...insight,
    isRead: readStates.get(insight.id) ?? false,
  }));
  
  return feed;
}

function getReadStatesForUser(userId: string): Map<string, boolean> {
  const db = getDatabase();
  
  const rows = db.prepare(`
    SELECT id, is_read FROM oracle_read_state_v1 WHERE user_id = ?
  `).all(userId) as Array<{ id: string; is_read: number }>;
  
  const map = new Map<string, boolean>();
  for (const row of rows) {
    map.set(row.id, row.is_read === 1);
  }
  
  return map;
}

export function oracleSetReadState(
  userId: string,
  id: string,
  isRead: boolean
): OracleReadState {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT OR REPLACE INTO oracle_read_state_v1 (user_id, id, is_read, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(userId, id, isRead ? 1 : 0, now);
  
  return {
    id,
    isRead,
    updatedAt: now,
  };
}

export function oracleBulkSetReadState(
  userId: string,
  ids: string[],
  isRead: boolean
): OracleReadState[] {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO oracle_read_state_v1 (user_id, id, is_read, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  
  const results: OracleReadState[] = [];
  
  db.transaction(() => {
    for (const id of ids) {
      stmt.run(userId, id, isRead ? 1 : 0, now);
      results.push({
        id,
        isRead,
        updatedAt: now,
      });
    }
  })();
  
  return results;
}

export function oracleClearOldDaily(retentionDays = 7): number {
  const db = getDatabase();
  
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const cutoffStr = getDateString(cutoffDate);
  
  const result = db.prepare(`
    DELETE FROM oracle_daily_v1 WHERE date < ?
  `).run(cutoffStr);
  
  return result.changes;
}
