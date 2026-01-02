// Usage Counters Store Types
// LocalStorage key: app_usage_v1

import type { Provider, UseCase } from './types';

export interface UsageEvent {
  id: string;
  ts: number;
  provider: Provider;
  useCase: UseCase;
  type: 'call' | 'error' | 'cache_hit' | 'cache_miss';
  latencyMs?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface UsageCounters {
  callsToday: Partial<Record<Provider, Partial<Record<UseCase, number>>>>;
  errorsToday: Partial<Record<Provider, Partial<Record<UseCase, number>>>>;
  cacheHitsToday: Partial<Record<string, number>>; // module: count
  avgLatencyMs: Partial<Record<Provider, Partial<Record<UseCase, number>>>>;
  lastError: {
    code: string;
    message: string;
    provider: Provider;
    useCase: UseCase;
    ts: number;
  } | null;
  lastProviderUsed: Provider | null;
  events: UsageEvent[]; // ring buffer
}

export interface AppUsageV1 {
  version: 1;
  date: string; // YYYY-MM-DD, resets daily
  counters: UsageCounters;
}

export const DEFAULT_USAGE: AppUsageV1 = {
  version: 1,
  date: new Date().toISOString().split('T')[0],
  counters: {
    callsToday: {},
    errorsToday: {},
    cacheHitsToday: {},
    avgLatencyMs: {},
    lastError: null,
    lastProviderUsed: null,
    events: [],
  },
};

// Helper to get today's date string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper to check if usage is stale (from previous day)
export function isUsageStale(usage: AppUsageV1): boolean {
  return usage.date !== getTodayDateString();
}
