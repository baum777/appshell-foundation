/**
 * KV Store Factory
 * Automatically selects Vercel KV or memory fallback based on environment
 */

import type { KVStore } from './types';
import { hasVercelKV, isDev, isTest } from '../env';
import { memoryKVStore } from './memory-store';
import { vercelKVStore } from './vercel-store';
import { logger } from '../logger';

export * from './types';
export { clearMemoryStore, getMemoryStoreSize } from './memory-store';

let kvStore: KVStore | null = null;
let storeType: 'vercel' | 'memory' = 'memory';

export function getKVStore(): KVStore {
  if (kvStore) return kvStore;

  if (hasVercelKV()) {
    logger.info('Using Vercel KV store');
    kvStore = vercelKVStore;
    storeType = 'vercel';
  } else {
    if (!isDev() && !isTest()) {
      logger.warn('Vercel KV not configured in production - using memory store (data will be lost on cold start)');
    }
    kvStore = memoryKVStore;
    storeType = 'memory';
  }

  return kvStore;
}

export function getStoreType(): 'vercel' | 'memory' {
  getKVStore(); // Ensure initialized
  return storeType;
}

// Convenience re-exports
export const kv = {
  get: async <T>(key: string): Promise<T | null> => getKVStore().get<T>(key),
  set: async <T>(key: string, value: T, ttlSeconds?: number): Promise<void> => 
    getKVStore().set(key, value, ttlSeconds),
  delete: async (key: string): Promise<boolean> => getKVStore().delete(key),
  getByPrefix: async <T>(prefix: string): Promise<Array<{ key: string; value: T }>> => 
    getKVStore().getByPrefix<T>(prefix),
  exists: async (key: string): Promise<boolean> => getKVStore().exists(key),
  incr: async (key: string, ttlSeconds?: number): Promise<number> => 
    getKVStore().incr(key, ttlSeconds),
};
