import type { FreshnessStatus } from '../../domain/signals/types.js';

export type TTLConfig = {
  soft: number;
  hard: number;
};

export const TTL = {
  PRICE_FAST: { soft: 30, hard: 120 },
  MARKET_MEDIUM: { soft: 300, hard: 1800 }, // 5m, 30m
  ONCHAIN_SLOW: { soft: 1200, hard: 43200 }, // 20m, 12h
  PULSE: { soft: 600, hard: 7200 }, // 10m, 2h
  DAILY_BIAS: { soft: 21600, hard: 86400 }, // 6h, 24h
};

export function calculateFreshness(asOfIso: string, ttl: TTLConfig): { status: FreshnessStatus; ageSec: number } {
  const asOf = new Date(asOfIso).getTime();
  const now = Date.now();
  const ageSec = Math.max(0, Math.floor((now - asOf) / 1000));

  let status: FreshnessStatus = 'fresh';
  if (ageSec > ttl.hard) {
    status = 'hard_stale';
  } else if (ageSec > ttl.soft) {
    status = 'soft_stale';
  }

  return { status, ageSec };
}

