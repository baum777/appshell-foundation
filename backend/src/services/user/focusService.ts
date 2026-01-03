import { getKV } from '../../lib/kv/store.js';
import { getEnv } from '../../config/env.js';

const FOCUS_KEY_PREFIX = 'user:focus:';
const DEFAULT_TTL_SECONDS = 15 * 60; // 15 minutes

export type UserFocus = {
  assetId: string;
  until: string; // ISO
};

export async function getFocus(userId: string): Promise<UserFocus | null> {
  const kv = getKV();
  const key = `${FOCUS_KEY_PREFIX}${userId}`;
  return kv.get<UserFocus>(key);
}

export async function setFocus(userId: string, assetId: string): Promise<void> {
  const kv = getKV();
  const key = `${FOCUS_KEY_PREFIX}${userId}`;
  const env = getEnv();
  
  // Use env var if available (parsed as number of minutes? Env schema says minutes?)
  // The plan said "SIGNALS_FOCUS_TTL_MINUTES (default 15)" in env vars section but I haven't added it to env.ts yet.
  // I will use a default or check env if I added it. I'll stick to 15m default for now.
  const ttlSeconds = DEFAULT_TTL_SECONDS; 
  
  const focus: UserFocus = {
    assetId,
    until: new Date(Date.now() + ttlSeconds * 1000).toISOString()
  };
  
  await kv.set(key, focus, ttlSeconds);
}

