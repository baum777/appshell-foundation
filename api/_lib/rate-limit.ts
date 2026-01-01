/**
 * Rate Limiting Helpers
 * KV-backed rate limiting for API endpoints
 */

import { kv, kvKeys } from './kv';
import { rateLimited } from './errors';

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  journal: { limit: 60, windowSeconds: 60 },
  alerts: { limit: 60, windowSeconds: 60 },
  oracle: { limit: 30, windowSeconds: 60 },
  ta: { limit: 10, windowSeconds: 60 },
  evaluate: { limit: 30, windowSeconds: 60 },
};

function getBucket(windowSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / windowSeconds);
  return bucket.toString();
}

export async function checkRateLimit(
  resource: string,
  identifier: string,
  config?: RateLimitConfig
): Promise<void> {
  const cfg = config || DEFAULT_LIMITS[resource] || { limit: 60, windowSeconds: 60 };
  const bucket = getBucket(cfg.windowSeconds);
  const key = kvKeys.rateLimit(resource, identifier, bucket);
  
  const count = await kv.incr(key, cfg.windowSeconds);
  
  if (count > cfg.limit) {
    throw rateLimited(`Rate limit exceeded for ${resource}. Try again later.`);
  }
}

export async function getRateLimitRemaining(
  resource: string,
  identifier: string,
  config?: RateLimitConfig
): Promise<number> {
  const cfg = config || DEFAULT_LIMITS[resource] || { limit: 60, windowSeconds: 60 };
  const bucket = getBucket(cfg.windowSeconds);
  const key = kvKeys.rateLimit(resource, identifier, bucket);
  
  const count = await kv.get<number>(key) || 0;
  return Math.max(0, cfg.limit - count);
}
