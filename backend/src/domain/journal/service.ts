import { randomUUID } from 'crypto';
import type { 
  JournalEvent, 
  JournalCreateRequest, 
  JournalConfirmPayload, 
  LegacyJournalStatus
} from './types.js';
import { 
  journalRepoSQLite, 
  extractDayKey, 
  assertUserId 
} from './repo.js'; // Will update repo.ts to export these still


export class JournalService {
  
  async createEntry(
    userId: string, 
    request: JournalCreateRequest, 
    idempotencyKey?: string
  ): Promise<JournalEvent> {
    assertUserId(userId);
    const now = new Date().toISOString();
    const id = idempotencyKey || `entry-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const timestamp = request.timestamp || now;
    const dayKey = extractDayKey(timestamp);

    // Initial event structure
    const event: JournalEvent = {
      id,
      userId,
      side: request.side,
      status: 'PENDING',
      timestamp,
      summary: request.summary,
      dayKey,
      createdAt: now,
      updatedAt: now,
      assetId: request.assetId,
      onchainContext: request.onchainContext
    };

    // Ruleset v1:
    // - Snapshot-at-write: if onchainContext is provided, persist it as-is.
    // - Offline-first: do NOT block writes on enrichment; backend must not synchronously enrich on create.
    if (event.onchainContext) {
      event.contextStatus = 'complete';
    } else if (event.assetId) {
      event.contextStatus = 'missing';
    }

    // Persist
    await journalRepoSQLite.putEvent(userId, event);
    return event;
  }

  async getEntry(userId: string, id: string): Promise<JournalEvent | null> {
    return journalRepoSQLite.getEvent(userId, id);
  }

  async listEntries(
    userId: string, 
    status?: LegacyJournalStatus, 
    limit = 50, 
    cursor?: string
  ): Promise<{ items: JournalEvent[]; nextCursor?: string }> {
    // We need to implement list in repo that supports these parameters properly
    // The existing repo.listStatusIds returns IDs, but we want full objects.
    // Ideally repo has a `listEvents` method.
    // For now, I'll rely on the existing pattern or assume repo update adds `listEvents`.
    // Wait, existing repo has `journalList` function which did the SQL query. 
    // I should move that SQL logic to the Repo class or keep it here.
    // The plan said "Move 'business logic' functions... from repo.ts to here".
    // But `journalList` in `repo.ts` was doing direct DB access. 
    // I should probably add `listEvents` to `JournalRepoSQLite` and call it.
    
    // I will use a direct call to the repo instance which I will update in next step to include `listEvents`.
    // For now, I'll comment that expectation.
    return (journalRepoSQLite as any).listEvents(userId, status, limit, cursor);
  }

  async confirmEntry(
    userId: string, 
    id: string, 
    payload: Partial<JournalConfirmPayload>
  ): Promise<JournalEvent | null> {
    assertUserId(userId);
    const now = new Date().toISOString();
    
    const entry = await this.getEntry(userId, id);
    if (!entry) return null;
    if (entry.status === 'CONFIRMED') return entry;
    
    // Update fields
    entry.status = 'CONFIRMED';
    entry.updatedAt = now;
    entry.confirmData = {
      mood: payload.mood ?? '',
      note: payload.note ?? '',
      tags: payload.tags ?? [],
      confirmedAt: now
    };

    await journalRepoSQLite.putEvent(userId, entry);
    return entry;
  }

  async archiveEntry(
    userId: string, 
    id: string, 
    reason?: string
  ): Promise<JournalEvent | null> {
    assertUserId(userId);
    const now = new Date().toISOString();
    
    const entry = await this.getEntry(userId, id);
    if (!entry) return null;
    if (entry.status === 'ARCHIVED') return entry;

    entry.status = 'ARCHIVED';
    entry.updatedAt = now;
    entry.archiveData = {
      reason: reason ?? '',
      archivedAt: now
    };

    await journalRepoSQLite.putEvent(userId, entry);
    return entry;
  }

  async restoreEntry(userId: string, id: string): Promise<JournalEvent | null> {
    assertUserId(userId);
    const now = new Date().toISOString();
    
    const entry = await this.getEntry(userId, id);
    if (!entry) return null;
    if (entry.status === 'PENDING') return entry;

    entry.status = 'PENDING';
    entry.updatedAt = now;
    entry.archiveData = undefined; // Clear archive data

    await journalRepoSQLite.putEvent(userId, entry);
    return entry;
  }

  async deleteEntry(userId: string, id: string): Promise<boolean> {
    return journalRepoSQLite.deleteEvent(userId, id);
  }
}

export const journalService = new JournalService();
