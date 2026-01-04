import { getKV } from './store.js';

export async function getJson<T>(key: string): Promise<T | null> {
  const kv = getKV();
  return kv.get<T>(key);
}

export async function setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  const kv = getKV();
  await kv.set(key, value, ttlSeconds);
}

