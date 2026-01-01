/**
 * Oracle Repository
 * KV-backed storage for daily feeds and read states
 */

import { kv, kvKeys, kvTTL } from '../../kv';
import type { OracleDailyFeed, OracleReadState } from '../../types';
import { generateDailyFeed, getDateString } from './generator';

// ─────────────────────────────────────────────────────────────
// ORACLE FEED
// ─────────────────────────────────────────────────────────────

export async function oracleGetDaily(date: Date, userId: string): Promise<OracleDailyFeed> {
  const dateStr = getDateString(date);
  
  // Try to get cached daily feed
  let feed = await kv.get<OracleDailyFeed>(kvKeys.oracleSnapshot(dateStr));
  
  if (!feed) {
    // Generate new feed and cache it
    feed = generateDailyFeed(dateStr);
    await kv.set(kvKeys.oracleSnapshot(dateStr), feed, kvTTL.oracleDaily);
    
    // Also update latest pointer
    await kv.set(kvKeys.oracleLatest(), dateStr);
  }
  
  // Apply user's read states
  const readStates = await getReadStatesForUser(userId);
  
  feed.pinned.isRead = readStates.get(feed.pinned.id) ?? false;
  
  feed.insights = feed.insights.map(insight => ({
    ...insight,
    isRead: readStates.get(insight.id) ?? false,
  }));
  
  return feed;
}

// ─────────────────────────────────────────────────────────────
// READ STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────

interface ReadStateEntry {
  isRead: boolean;
  updatedAt: string;
}

async function getReadStatesForUser(userId: string): Promise<Map<string, boolean>> {
  // For v1 no-auth, we use global read state
  const effectiveUserId = userId === 'anon' ? 'global' : userId;
  
  const entries = await kv.getByPrefix<ReadStateEntry>(
    `${kvKeys.oracleRead(effectiveUserId, '')}`.replace(/:$/, ':')
  );
  
  const map = new Map<string, boolean>();
  for (const entry of entries) {
    // Extract insightId from key
    const parts = entry.key.split(':');
    const insightId = parts[parts.length - 1];
    map.set(insightId, entry.value.isRead);
  }
  
  return map;
}

export async function oracleSetReadState(
  userId: string,
  id: string,
  isRead: boolean
): Promise<OracleReadState> {
  const effectiveUserId = userId === 'anon' ? 'global' : userId;
  const now = new Date().toISOString();
  
  const entry: ReadStateEntry = {
    isRead,
    updatedAt: now,
  };
  
  await kv.set(kvKeys.oracleRead(effectiveUserId, id), entry);
  
  return {
    id,
    isRead,
    updatedAt: now,
  };
}

export async function oracleBulkSetReadState(
  userId: string,
  ids: string[],
  isRead: boolean
): Promise<OracleReadState[]> {
  const results: OracleReadState[] = [];
  
  for (const id of ids) {
    const result = await oracleSetReadState(userId, id, isRead);
    results.push(result);
  }
  
  return results;
}

// ─────────────────────────────────────────────────────────────
// CRON HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Refresh daily snapshot (called by cron)
 * Idempotent - safe to call multiple times
 */
export async function oracleRefreshDaily(): Promise<{ date: string; generated: boolean }> {
  const today = new Date();
  const dateStr = getDateString(today);
  
  // Check if already exists
  const existing = await kv.get<OracleDailyFeed>(kvKeys.oracleSnapshot(dateStr));
  if (existing) {
    return { date: dateStr, generated: false };
  }
  
  // Generate and cache
  const feed = generateDailyFeed(dateStr);
  await kv.set(kvKeys.oracleSnapshot(dateStr), feed, kvTTL.oracleDaily);
  await kv.set(kvKeys.oracleLatest(), dateStr);
  
  return { date: dateStr, generated: true };
}
