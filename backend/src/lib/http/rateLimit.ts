import { getKV } from '../kv/store.js';

const COOLDOWN_PREFIX = 'provider:cooldown';

export async function setProviderCooldown(provider: string, userId: string, ttlSeconds: number = 30): Promise<void> {
  const kv = getKV();
  const key = `${COOLDOWN_PREFIX}:${provider}:${userId}`;
  // Set value to '1', existence checks block requests
  await kv.set(key, '1', ttlSeconds);
}

export async function isProviderOnCooldown(provider: string, userId: string): Promise<boolean> {
  const kv = getKV();
  const key = `${COOLDOWN_PREFIX}:${provider}:${userId}`;
  return kv.exists(key);
}

