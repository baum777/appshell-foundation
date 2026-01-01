/**
 * Journal Repository
 * KV-backed storage for journal entries
 */

import { randomUUID } from 'crypto';
import { kv, kvKeys } from '../../kv';
import type {
  JournalEntry,
  JournalEntryFull,
  JournalEntryStatus,
} from '../../types';

// ─────────────────────────────────────────────────────────────
// JOURNAL INDEX MANAGEMENT
// ─────────────────────────────────────────────────────────────

async function getJournalIndex(): Promise<string[]> {
  const index = await kv.get<string[]>(kvKeys.journalIndex());
  return index || [];
}

async function setJournalIndex(ids: string[]): Promise<void> {
  await kv.set(kvKeys.journalIndex(), ids);
}

async function addToIndex(entryId: string): Promise<void> {
  const index = await getJournalIndex();
  if (!index.includes(entryId)) {
    index.push(entryId);
    await setJournalIndex(index);
  }
}

async function removeFromIndex(entryId: string): Promise<void> {
  const index = await getJournalIndex();
  const filtered = index.filter(id => id !== entryId);
  await setJournalIndex(filtered);
}

// ─────────────────────────────────────────────────────────────
// JOURNAL CRUD
// ─────────────────────────────────────────────────────────────

export interface JournalCreateRequest {
  side: 'BUY' | 'SELL';
  summary: string;
  timestamp?: string;
}

export interface JournalConfirmPayload {
  mood: string;
  note: string;
  tags: string[];
}

export async function journalCreate(
  request: JournalCreateRequest,
  idempotencyKey?: string
): Promise<JournalEntry> {
  const now = new Date().toISOString();
  const id = idempotencyKey || `entry-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const timestamp = request.timestamp || now;
  
  // Check idempotency - if entry exists with this id, return it
  if (idempotencyKey) {
    const existing = await journalGetById(id);
    if (existing) {
      return existing;
    }
  }
  
  const entryFull: JournalEntryFull = {
    id,
    side: request.side,
    status: 'pending',
    timestamp,
    summary: request.summary,
    createdAt: now,
    updatedAt: now,
  };
  
  await kv.set(kvKeys.journalEntry(id), entryFull);
  await addToIndex(id);
  
  return {
    id,
    side: request.side,
    status: 'pending',
    timestamp,
    summary: request.summary,
  };
}

export async function journalGetById(id: string): Promise<JournalEntry | null> {
  const full = await kv.get<JournalEntryFull>(kvKeys.journalEntry(id));
  if (!full) return null;
  
  return {
    id: full.id,
    side: full.side,
    status: full.status,
    timestamp: full.timestamp,
    summary: full.summary,
  };
}

export async function journalGetFullById(id: string): Promise<JournalEntryFull | null> {
  return kv.get<JournalEntryFull>(kvKeys.journalEntry(id));
}

export interface JournalListResult {
  items: JournalEntry[];
  nextCursor?: string;
}

export async function journalList(
  status?: JournalEntryStatus,
  limit = 50,
  cursor?: string
): Promise<JournalListResult> {
  const index = await getJournalIndex();
  const entries: JournalEntryFull[] = [];
  
  // Fetch all entries
  for (const id of index) {
    const entry = await kv.get<JournalEntryFull>(kvKeys.journalEntry(id));
    if (entry) {
      entries.push(entry);
    }
  }
  
  // Filter by status
  let filtered = entries;
  if (status) {
    filtered = entries.filter(e => e.status === status);
  }
  
  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  
  // Apply cursor (timestamp-based pagination)
  if (cursor) {
    const cursorIndex = filtered.findIndex(e => e.timestamp === cursor);
    if (cursorIndex !== -1) {
      filtered = filtered.slice(cursorIndex + 1);
    }
  }
  
  // Apply limit
  const hasMore = filtered.length > limit;
  const items = filtered.slice(0, limit);
  
  return {
    items: items.map(e => ({
      id: e.id,
      side: e.side,
      status: e.status,
      timestamp: e.timestamp,
      summary: e.summary,
    })),
    nextCursor: hasMore ? items[items.length - 1]?.timestamp : undefined,
  };
}

export async function journalConfirm(
  id: string,
  payload: JournalConfirmPayload
): Promise<JournalEntry | null> {
  const entry = await journalGetFullById(id);
  if (!entry) return null;
  
  // Idempotent: if already confirmed, just return
  if (entry.status === 'confirmed') {
    return {
      id: entry.id,
      side: entry.side,
      status: entry.status,
      timestamp: entry.timestamp,
      summary: entry.summary,
    };
  }
  
  const now = new Date().toISOString();
  
  entry.status = 'confirmed';
  entry.updatedAt = now;
  entry.confirmData = {
    mood: payload.mood,
    note: payload.note,
    tags: payload.tags,
    confirmedAt: now,
  };
  
  await kv.set(kvKeys.journalEntry(id), entry);
  
  return {
    id: entry.id,
    side: entry.side,
    status: 'confirmed',
    timestamp: entry.timestamp,
    summary: entry.summary,
  };
}

export async function journalArchive(id: string, reason: string): Promise<JournalEntry | null> {
  const entry = await journalGetFullById(id);
  if (!entry) return null;
  
  // Idempotent: if already archived, just return
  if (entry.status === 'archived') {
    return {
      id: entry.id,
      side: entry.side,
      status: entry.status,
      timestamp: entry.timestamp,
      summary: entry.summary,
    };
  }
  
  const now = new Date().toISOString();
  
  entry.status = 'archived';
  entry.updatedAt = now;
  entry.archiveData = {
    reason,
    archivedAt: now,
  };
  
  await kv.set(kvKeys.journalEntry(id), entry);
  
  return {
    id: entry.id,
    side: entry.side,
    status: 'archived',
    timestamp: entry.timestamp,
    summary: entry.summary,
  };
}

export async function journalRestore(id: string): Promise<JournalEntry | null> {
  const entry = await journalGetFullById(id);
  if (!entry) return null;
  
  // Idempotent: if already pending, just return
  if (entry.status === 'pending') {
    return {
      id: entry.id,
      side: entry.side,
      status: entry.status,
      timestamp: entry.timestamp,
      summary: entry.summary,
    };
  }
  
  const now = new Date().toISOString();
  
  entry.status = 'pending';
  entry.updatedAt = now;
  delete entry.archiveData;
  
  await kv.set(kvKeys.journalEntry(id), entry);
  
  return {
    id: entry.id,
    side: entry.side,
    status: 'pending',
    timestamp: entry.timestamp,
    summary: entry.summary,
  };
}

export async function journalDelete(id: string): Promise<boolean> {
  const exists = await kv.exists(kvKeys.journalEntry(id));
  if (!exists) return false;
  
  await kv.delete(kvKeys.journalEntry(id));
  await removeFromIndex(id);
  
  return true;
}
