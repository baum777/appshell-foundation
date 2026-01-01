/**
 * Service Worker IndexedDB Storage
 * Per SW_SPEC.md
 */

import {
  SW_IDB_NAME,
  SW_IDB_VERSION,
  STORE_KV,
  STORE_DEDUPE,
  type SwKeyValueRow,
  type SwDedupeRow,
} from './sw-contracts';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
export function initSwStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(SW_IDB_NAME, SW_IDB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open SW IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // KV store
      if (!database.objectStoreNames.contains(STORE_KV)) {
        const kvStore = database.createObjectStore(STORE_KV, { keyPath: 'key' });
        kvStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Dedupe store
      if (!database.objectStoreNames.contains(STORE_DEDUPE)) {
        const dedupeStore = database.createObjectStore(STORE_DEDUPE, { keyPath: 'dedupeKey' });
        dedupeStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

/**
 * Get value from KV store
 */
export async function kvGet<T>(key: string): Promise<T | null> {
  const database = await initSwStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_KV, 'readonly');
    const store = transaction.objectStore(STORE_KV);
    const request = store.get(key);

    request.onsuccess = () => {
      const row = request.result as SwKeyValueRow | undefined;
      resolve(row ? (row.value as T) : null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get key: ${key}`));
    };
  });
}

/**
 * Set value in KV store
 */
export async function kvSet<T>(key: string, value: T): Promise<void> {
  const database = await initSwStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_KV, 'readwrite');
    const store = transaction.objectStore(STORE_KV);

    const row: SwKeyValueRow = {
      key,
      value,
      updatedAt: new Date().toISOString(),
    };

    const request = store.put(row);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to set key: ${key}`));
  });
}

/**
 * Check if event is already deduped
 */
export async function isDeduplicated(dedupeKey: string): Promise<boolean> {
  const database = await initSwStorage();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_DEDUPE, 'readonly');
    const store = transaction.objectStore(STORE_DEDUPE);
    const request = store.get(dedupeKey);

    request.onsuccess = () => {
      const row = request.result as SwDedupeRow | undefined;
      if (!row) {
        resolve(false);
        return;
      }
      // Check if expired
      resolve(row.expiresAt > now);
    };

    request.onerror = () => {
      reject(new Error(`Failed to check dedupe: ${dedupeKey}`));
    };
  });
}

/**
 * Add dedupe entry
 */
export async function addDedupe(
  dedupeKey: string,
  eventId: string,
  ttlMs: number
): Promise<void> {
  const database = await initSwStorage();
  const now = new Date();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_DEDUPE, 'readwrite');
    const store = transaction.objectStore(STORE_DEDUPE);

    const row: SwDedupeRow = {
      dedupeKey,
      eventId,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    };

    const request = store.put(row);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to add dedupe: ${dedupeKey}`));
  });
}

/**
 * Cleanup expired dedupe entries
 */
export async function cleanupDedupe(): Promise<number> {
  const database = await initSwStorage();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_DEDUPE, 'readwrite');
    const store = transaction.objectStore(STORE_DEDUPE);
    const index = store.index('expiresAt');
    const range = IDBKeyRange.upperBound(now);
    
    let deleted = 0;
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        deleted++;
        cursor.continue();
      } else {
        resolve(deleted);
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to cleanup dedupe'));
    };
  });
}
