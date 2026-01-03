import type { AppSettingsV1 } from "@/components/settings/types";

const USAGE_PREFIX = "journal_usage_v1:day:";

/**
 * Get today's date key in YYYY-MM-DD format
 */
function getTodayKey(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Get the localStorage key for today's insight usage
 */
function getUsageKey(): string {
  return `${USAGE_PREFIX}${getTodayKey()}:openai:insights:calls`;
}

/**
 * Get current usage count for today
 */
export function getCurrentUsage(): number {
  try {
    const stored = localStorage.getItem(getUsageKey());
    if (!stored) return 0;
    const count = parseInt(stored, 10);
    return isNaN(count) ? 0 : count;
  } catch {
    return 0;
  }
}

/**
 * Increment usage count
 */
export function incrementUsage(): number {
  try {
    const current = getCurrentUsage();
    const next = current + 1;
    localStorage.setItem(getUsageKey(), String(next));
    return next;
  } catch {
    return getCurrentUsage() + 1;
  }
}

/**
 * Get daily budget limit from settings
 */
export function getDailyLimit(settings: AppSettingsV1): number {
  const budget = settings.budgets.find(
    (b) => b.provider === "openai" && b.useCase === "insights"
  );
  return budget?.callsPerDay ?? 10;
}

/**
 * Check if budget is exceeded
 */
export function isBudgetExceeded(settings: AppSettingsV1): boolean {
  const limit = getDailyLimit(settings);
  const current = getCurrentUsage();
  return current >= limit;
}

/**
 * Check if admin fail-open is enabled (allows generation even when over limit)
 */
export function isAdminFailOpen(settings: AppSettingsV1): boolean {
  return settings.tier.level === "ADMIN" && settings.tier.adminFailOpen === true;
}

/**
 * Can generate a new insight (considering budget and admin status)
 */
export function canGenerate(settings: AppSettingsV1): boolean {
  if (!isBudgetExceeded(settings)) {
    return true;
  }
  // Admin with fail-open can still generate
  return isAdminFailOpen(settings);
}

/**
 * Get budget status for UI display
 */
export function getBudgetStatus(settings: AppSettingsV1): {
  current: number;
  limit: number;
  exceeded: boolean;
  failOpen: boolean;
} {
  const limit = getDailyLimit(settings);
  const current = getCurrentUsage();
  const exceeded = current >= limit;
  const failOpen = isAdminFailOpen(settings);
  
  return {
    current,
    limit,
    exceeded,
    failOpen,
  };
}

/**
 * Clean up old usage keys (call occasionally)
 */
export function cleanupOldUsageKeys(): void {
  try {
    const today = getTodayKey();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(USAGE_PREFIX) && !key.includes(today)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore cleanup errors
  }
}
