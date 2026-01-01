import { getDatabase } from './sqlite.js';

/**
 * Key-Value Store Adapter
 * Implements KV abstraction over SQLite per DATA_STORES.md
 * 
 * Key format: kv:v1:<domain>:...
 */

export function kvGet<T>(key: string): T | null {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  
  const row = db.prepare(`
    SELECT value_json FROM kv_v1
    WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)
  `).get(key, now) as { value_json: string } | undefined;
  
  if (!row) {
    return null;
  }
  
  return JSON.parse(row.value_json) as T;
}

export function kvSet<T>(key: string, value: T, ttlSeconds?: number): void {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = ttlSeconds ? now + ttlSeconds : null;
  
  db.prepare(`
    INSERT OR REPLACE INTO kv_v1 (key, value_json, expires_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(key, JSON.stringify(value), expiresAt, now);
}

export function kvDelete(key: string): boolean {
  const db = getDatabase();
  
  const result = db.prepare(`DELETE FROM kv_v1 WHERE key = ?`).run(key);
  
  return result.changes > 0;
}

export function kvGetByPrefix<T>(prefix: string): Array<{ key: string; value: T }> {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  
  const rows = db.prepare(`
    SELECT key, value_json FROM kv_v1
    WHERE key LIKE ? AND (expires_at IS NULL OR expires_at > ?)
  `).all(`${prefix}%`, now) as Array<{ key: string; value_json: string }>;
  
  return rows.map(row => ({
    key: row.key,
    value: JSON.parse(row.value_json) as T,
  }));
}

export function kvCleanupExpired(): number {
  const db = getDatabase();
  const now = Math.floor(Date.now() / 1000);
  
  const result = db.prepare(`
    DELETE FROM kv_v1 WHERE expires_at IS NOT NULL AND expires_at <= ?
  `).run(now);
  
  return result.changes;
}

// Key builders per CONTRACTS.md
export const kvKeys = {
  alert: (alertId: string) => `kv:v1:alerts:byId:${alertId}`,
  alertIds: () => `kv:v1:alerts:ids`,
  watchCandidates: () => `kv:v1:watchCandidates:ids`,
  deadTokenSession: (alertId: string) => `kv:v1:sessions:deadToken:${alertId}`,
  alertEvent: (eventId: string) => `kv:v1:events:alert:${eventId}`,
  journalEntry: (entryId: string) => `kv:v1:journal:byId:${entryId}`,
  journalIds: () => `kv:v1:journal:ids`,
  oracleDaily: (date: string) => `kv:v1:oracle:daily:${date}`,
  oracleRead: (userId: string, insightId: string) => `kv:v1:oracle:read:${userId}:${insightId}`,
  taCache: (market: string, timeframe: string, replay: boolean, bucket: string) =>
    `kv:v1:ta:${market}:${timeframe}:${replay}:${bucket}`,
};

// TTL constants in seconds
export const kvTTL = {
  watchCandidates: 24 * 60 * 60, // 24h
  deadTokenSession: 13 * 60 * 60, // 13h
  alertEvent: 30 * 24 * 60 * 60, // 30d
  oracleDaily: 36 * 60 * 60, // 36h
  taCache: 24 * 60 * 60, // 24h
};
