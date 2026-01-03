import type { JournalInsightV1 } from './types';
import { JournalInsightV1Schema } from './types';

const CACHE_KEY_PREFIX = 'journal_insight_v1:entry:';
const ERROR_KEY = 'journal_insight_v1:lastError';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getCachedInsight(entryId: string): JournalInsightV1 | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${entryId}`);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw);
    
    // Check TTL
    if (parsed.createdAt && Date.now() - parsed.createdAt > TTL_MS) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${entryId}`);
      return null;
    }
    
    // Validate schema
    const result = JournalInsightV1Schema.safeParse(parsed);
    if (!result.success) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${entryId}`);
      return null;
    }
    
    // Mark as cache hit
    return { ...result.data, meta: { ...result.data.meta, cache: 'hit' } };
  } catch {
    return null;
  }
}

export function setCachedInsight(insight: JournalInsightV1): void {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${insight.entryId}`, JSON.stringify(insight));
  } catch (e) {
    // Storage quota exceeded or other error
    setLastError(`Cache write failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

export function clearCachedInsight(entryId: string): void {
  localStorage.removeItem(`${CACHE_KEY_PREFIX}${entryId}`);
}

export function setLastError(message: string): void {
  localStorage.setItem(ERROR_KEY, JSON.stringify({
    message,
    timestamp: Date.now(),
  }));
}

export function getLastError(): { message: string; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(ERROR_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
