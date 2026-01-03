import type { AppSettingsV1 } from '@/components/settings/types';

const USAGE_KEY_PREFIX = 'journal_usage_v1:day:';

function getTodayKey(): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${USAGE_KEY_PREFIX}${today}:openai:insights:calls`;
}

export function getDailyInsightCalls(): number {
  try {
    const raw = localStorage.getItem(getTodayKey());
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementDailyInsightCalls(): number {
  const key = getTodayKey();
  const current = getDailyInsightCalls();
  const newCount = current + 1;
  localStorage.setItem(key, String(newCount));
  return newCount;
}

export function getDailyInsightLimit(settings: AppSettingsV1): number {
  const insightBudget = settings.budgets.find(
    b => b.provider === 'openai' && b.useCase === 'insights'
  );
  return insightBudget?.callsPerDay ?? 10;
}

export function canGenerateInsight(settings: AppSettingsV1): { 
  allowed: boolean; 
  remaining: number;
  isAdmin: boolean;
  adminFailOpen: boolean;
} {
  const limit = getDailyInsightLimit(settings);
  const used = getDailyInsightCalls();
  const remaining = Math.max(0, limit - used);
  const isAdmin = settings.tier.level === 'ADMIN';
  const adminFailOpen = settings.tier.adminFailOpen ?? false;
  
  // ADMIN with failOpen can always generate
  if (isAdmin && adminFailOpen) {
    return { allowed: true, remaining, isAdmin, adminFailOpen };
  }
  
  return { 
    allowed: remaining > 0, 
    remaining,
    isAdmin,
    adminFailOpen,
  };
}

export function cleanupOldUsageKeys(): void {
  const today = new Date().toISOString().split('T')[0];
  
  // Clean up keys older than 7 days
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(USAGE_KEY_PREFIX)) {
      const dateMatch = key.match(/day:(\d{4}-\d{2}-\d{2}):/);
      if (dateMatch) {
        const keyDate = dateMatch[1];
        const daysDiff = Math.floor(
          (new Date(today).getTime() - new Date(keyDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 7) {
          keysToRemove.push(key);
        }
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
