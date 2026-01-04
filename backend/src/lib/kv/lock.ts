import { getKV } from './store.js';

export async function acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
  const kv = getKV();
  const value = Date.now().toString();
  return kv.setnx(key, value, ttlSeconds);
}

export async function releaseLock(key: string): Promise<void> {
  const kv = getKV();
  await kv.delete(key);
}
