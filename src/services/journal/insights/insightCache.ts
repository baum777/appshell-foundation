import { JournalInsightV1, JournalInsightV1Schema, InsightError } from "./types";

const CACHE_PREFIX = "journal_insight_v1:entry:";
const ERROR_KEY = "journal_insight_v1:lastError";
const TTL_DAYS = 7;

/**
 * Get cached insight for an entry
 * Returns null if not found or invalid
 */
export function getCachedInsight(entryId: string): JournalInsightV1 | null {
  try {
    const key = `${CACHE_PREFIX}${entryId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return null;
    }
    
    const parsed = JSON.parse(stored);
    const result = JournalInsightV1Schema.safeParse(parsed);
    
    if (!result.success) {
      // Invalid data, remove it
      localStorage.removeItem(key);
      setLastError(`Invalid cached insight for ${entryId}: ${result.error.message}`);
      return null;
    }
    
    // Return with cache: hit override
    return {
      ...result.data,
      meta: {
        ...result.data.meta,
        cache: "hit" as const,
      },
    };
  } catch (err) {
    setLastError(`Failed to read cache for ${entryId}: ${err}`);
    return null;
  }
}

/**
 * Store insight in cache
 */
export function setCachedInsight(insight: JournalInsightV1): boolean {
  try {
    const key = `${CACHE_PREFIX}${insight.entryId}`;
    const validated = JournalInsightV1Schema.safeParse(insight);
    
    if (!validated.success) {
      setLastError(`Validation failed before caching: ${validated.error.message}`);
      return false;
    }
    
    localStorage.setItem(key, JSON.stringify(validated.data));
    return true;
  } catch (err) {
    setLastError(`Failed to cache insight: ${err}`);
    return false;
  }
}

/**
 * Remove cached insight
 */
export function removeCachedInsight(entryId: string): void {
  try {
    const key = `${CACHE_PREFIX}${entryId}`;
    localStorage.removeItem(key);
  } catch {
    // Ignore removal errors
  }
}

/**
 * Check if cached insight is stale (older than TTL)
 */
export function isInsightStale(insight: JournalInsightV1): boolean {
  const ttlMs = TTL_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - insight.createdAt > ttlMs;
}

/**
 * Get the age of an insight in a human-readable format
 */
export function getInsightAge(insight: JournalInsightV1): string {
  const ageMs = Date.now() - insight.createdAt;
  const ageMin = Math.floor(ageMs / 60000);
  
  if (ageMin < 1) return "just now";
  if (ageMin < 60) return `${ageMin} min ago`;
  
  const ageHours = Math.floor(ageMin / 60);
  if (ageHours < 24) return `${ageHours}h ago`;
  
  const ageDays = Math.floor(ageHours / 24);
  return `${ageDays}d ago`;
}

/**
 * Set last error for debugging
 */
export function setLastError(message: string): void {
  try {
    const error: InsightError = {
      message,
      timestamp: Date.now(),
    };
    localStorage.setItem(ERROR_KEY, JSON.stringify(error));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get last error for debugging
 */
export function getLastError(): InsightError | null {
  try {
    const stored = localStorage.getItem(ERROR_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear last error
 */
export function clearLastError(): void {
  try {
    localStorage.removeItem(ERROR_KEY);
  } catch {
    // Ignore
  }
}
