import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Alert } from '@/components/alerts/types';
import type { JournalEntry } from '@/services/trading/journal.service';
import type { ReasoningCacheRow } from '@/services/reasoning/cache';

interface TradeAppDB extends DBSchema {
  alerts: {
    key: string;
    value: Alert;
    indexes: { 'by-status': string; 'by-created': string };
  };
  journal: {
    key: string;
    value: JournalEntry;
    indexes: { 'by-date': string; 'by-status': string };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'ALERT' | 'JOURNAL';
      action: 'CREATE' | 'UPDATE' | 'DELETE';
      payload: any;
      timestamp: number;
    };
  };
  reasoning: {
    key: string;
    value: ReasoningCacheRow;
    indexes: { 'by-type': string; 'by-updated': string };
  };
}

const DB_NAME = 'tradeapp-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<TradeAppDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TradeAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Alerts Store
        if (!db.objectStoreNames.contains('alerts')) {
          const store = db.createObjectStore('alerts', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-created', 'createdAt');
        }

        // Journal Store
        if (!db.objectStoreNames.contains('journal')) {
          const store = db.createObjectStore('journal', { keyPath: 'id' });
          store.createIndex('by-date', 'timestamp');
          store.createIndex('by-status', 'status');
        }

        // Sync Queue (for offline actions)
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }

        // Reasoning Cache
        if (!db.objectStoreNames.contains('reasoning')) {
          const store = db.createObjectStore('reasoning', { keyPath: 'key' });
          store.createIndex('by-type', 'type');
          store.createIndex('by-updated', 'updatedAt');
        }
      },
    });
  }
  return dbPromise;
}

export const dbService = {
  async getAllAlerts(): Promise<Alert[]> {
    const db = await getDB();
    return db.getAll('alerts');
  },

  async saveAlert(alert: Alert): Promise<void> {
    const db = await getDB();
    await db.put('alerts', alert);
  },

  async deleteAlert(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('alerts', id);
  },

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    const db = await getDB();
    return db.getAllFromIndex('journal', 'by-date');
  },

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    const db = await getDB();
    await db.put('journal', entry);
  },

  // Sync Queue methods
  async addToSyncQueue(item: any): Promise<void> {
    const db = await getDB();
    await db.put('syncQueue', item);
  },

  async getSyncQueue(): Promise<any[]> {
    const db = await getDB();
    return db.getAll('syncQueue');
  },

  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('syncQueue', id);
  },

  // ─────────────────────────────────────────────────────────────
  // Reasoning Cache methods
  // ─────────────────────────────────────────────────────────────

  async getReasoning(key: string): Promise<ReasoningCacheRow | null> {
    const db = await getDB();
    return (await db.get('reasoning', key)) ?? null;
  },

  async saveReasoning(row: ReasoningCacheRow): Promise<void> {
    const db = await getDB();
    await db.put('reasoning', row);
  },

  async deleteReasoning(key: string): Promise<void> {
    const db = await getDB();
    await db.delete('reasoning', key);
  },
};

