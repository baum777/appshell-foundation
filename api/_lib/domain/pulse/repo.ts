import { createHash } from 'crypto';
import { getKVStore } from '../../kv';
import type { PulseSnapshot } from './types';
import { logger } from '../../logger';

// Constants
const V = 'v1';
const TTL_LATEST = 900; // 15 min
const TTL_HISTORY = 129600; // 36h
const TTL_LOCK = 30; // 30s
const MAX_HISTORY = 96;

// Helpers
function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getQueryHash(query: string): string {
  return createHash('sha256').update(normalizeQuery(query)).digest('hex').slice(0, 16);
}

function getKey(type: 'latest' | 'hist' | 'lock' | 'err', query: string): string {
  const qh = getQueryHash(query);
  return `gp:${V}:${type}:${qh}`;
}

// Repository
export async function getPulse(query: string): Promise<PulseSnapshot | null> {
  const kv = getKVStore();
  const key = getKey('latest', query);
  return await kv.get<PulseSnapshot>(key);
}

export async function savePulse(snapshot: PulseSnapshot): Promise<void> {
  const kv = getKVStore();
  const query = snapshot.query;
  
  const keyLatest = getKey('latest', query);
  const keyHist = getKey('hist', query);
  
  // 1. Save Latest
  await kv.set(keyLatest, snapshot, TTL_LATEST);

  // 2. Update History (Ring Buffer)
  try {
    const hist = (await kv.get<PulseSnapshot[]>(keyHist)) || [];
    hist.unshift(snapshot);
    // Trim
    if (hist.length > MAX_HISTORY) {
      hist.length = MAX_HISTORY;
    }
    await kv.set(keyHist, hist, TTL_HISTORY);
  } catch (error) {
    logger.error('Failed to update pulse history', { error: String(error) });
  }
}

export async function getPulseHistory(query: string): Promise<PulseSnapshot[]> {
  const kv = getKVStore();
  const key = getKey('hist', query);
  return (await kv.get<PulseSnapshot[]>(key)) || [];
}

export async function acquireRefreshLock(query: string): Promise<boolean> {
  const kv = getKVStore();
  const key = getKey('lock', query);
  
  // Try to set if not exists
  const existing = await kv.get<string>(key);
  if (existing) return false;

  await kv.set(key, '1', TTL_LOCK);
  return true;
}
