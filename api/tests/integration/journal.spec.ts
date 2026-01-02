/**
 * Integration Tests: Journal API
 * Per TEST_PLAN.md section 3.2
 * MULTITENANCY: All operations require userId
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { clearMemoryStore } from '../../_lib/kv/memory-store';
import {
  journalCreate,
  journalGetById,
  journalList,
  journalConfirm,
  journalArchive,
  journalRestore,
  journalDelete,
} from '../../_lib/domain/journal/repo';

// Test userId - all operations are scoped to this user
const TEST_USER_ID = 'test-user-123';
const OTHER_USER_ID = 'other-user-456';

describe('Journal API Integration', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  it('creates entry with status=PENDING', async () => {
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'BUY',
      summary: 'Test trade entry',
    });

    expect(entry.id).toBeDefined();
    expect(entry.status).toBe('PENDING');
    expect(entry.side).toBe('BUY');
    expect(entry.summary).toBe('Test trade entry');
    expect(entry.timestamp).toBeDefined();
    expect(entry.userId).toBe(TEST_USER_ID);
    expect(entry.dayKey).toBeDefined();
  });

  it('creates entry with custom timestamp', async () => {
    const timestamp = '2025-12-31T12:00:00.000Z';
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'SELL',
      summary: 'Timed entry',
      timestamp,
    });

    expect(entry.timestamp).toBe(timestamp);
    expect(entry.dayKey).toBe('2025-12-31');
  });

  it('returns entry by id (userId-scoped)', async () => {
    const created = await journalCreate(TEST_USER_ID, {
      side: 'BUY',
      summary: 'Find me',
    });

    const found = await journalGetById(TEST_USER_ID, created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.summary).toBe('Find me');
  });

  it('returns null for nonexistent entry', async () => {
    const found = await journalGetById(TEST_USER_ID, 'nonexistent-id');
    expect(found).toBeNull();
  });

  it('isolates entries by userId (multitenancy)', async () => {
    // Create entry for TEST_USER
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'BUY',
      summary: 'User A entry',
    });

    // OTHER_USER cannot see it
    const foundByOther = await journalGetById(OTHER_USER_ID, entry.id);
    expect(foundByOther).toBeNull();

    // TEST_USER can see it
    const foundByOwner = await journalGetById(TEST_USER_ID, entry.id);
    expect(foundByOwner).not.toBeNull();
  });

  it('lists entries filtered by status (userId-scoped)', async () => {
    await journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Pending 1' });
    await journalCreate(TEST_USER_ID, { side: 'SELL', summary: 'Pending 2' });
    const entry3 = await journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'To confirm' });
    await journalConfirm(TEST_USER_ID, entry3.id, { mood: 'good', note: '', tags: [] });

    const pending = await journalList(TEST_USER_ID, 'PENDING');
    const confirmed = await journalList(TEST_USER_ID, 'CONFIRMED');

    expect(pending.items.length).toBe(2);
    expect(confirmed.items.length).toBe(1);
    expect(confirmed.items[0].summary).toBe('To confirm');
  });

  it('confirms entry and updates status', async () => {
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'BUY',
      summary: 'Confirm me',
    });

    const confirmed = await journalConfirm(TEST_USER_ID, entry.id, {
      mood: 'confident',
      note: 'Good setup',
      tags: ['breakout', 'volume'],
    });

    expect(confirmed?.status).toBe('CONFIRMED');
  });

  it('is idempotent on double confirm', async () => {
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'BUY',
      summary: 'Double confirm',
    });

    await journalConfirm(TEST_USER_ID, entry.id, { mood: 'ok', note: '', tags: [] });
    const second = await journalConfirm(TEST_USER_ID, entry.id, { mood: 'ok', note: '', tags: [] });

    expect(second?.status).toBe('CONFIRMED');
  });

  it('archives entry', async () => {
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'SELL',
      summary: 'Archive me',
    });

    const archived = await journalArchive(TEST_USER_ID, entry.id, 'Invalid trade');

    expect(archived?.status).toBe('ARCHIVED');
  });

  it('is idempotent on double archive', async () => {
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'SELL',
      summary: 'Double archive',
    });

    await journalArchive(TEST_USER_ID, entry.id, 'First archive');
    const second = await journalArchive(TEST_USER_ID, entry.id, 'Second archive');

    expect(second?.status).toBe('ARCHIVED');
  });

  it('restores entry to pending', async () => {
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'BUY',
      summary: 'Restore me',
    });
    await journalArchive(TEST_USER_ID, entry.id, 'Oops');

    const restored = await journalRestore(TEST_USER_ID, entry.id);

    expect(restored?.status).toBe('PENDING');
  });

  it('deletes entry', async () => {
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'BUY',
      summary: 'Delete me',
    });

    const deleted = await journalDelete(TEST_USER_ID, entry.id);
    const found = await journalGetById(TEST_USER_ID, entry.id);

    expect(deleted).toBe(true);
    expect(found).toBeNull();
  });

  it('returns false on deleting nonexistent entry', async () => {
    const deleted = await journalDelete(TEST_USER_ID, 'nonexistent');
    expect(deleted).toBe(false);
  });

  it('supports pagination (userId-scoped)', async () => {
    // Create 5 entries
    for (let i = 1; i <= 5; i++) {
      await journalCreate(TEST_USER_ID, {
        side: 'BUY',
        summary: `Entry ${i}`,
        timestamp: new Date(Date.now() + i * 1000).toISOString(),
      });
    }

    const page1 = await journalList(TEST_USER_ID, undefined, 2);
    expect(page1.items.length).toBe(2);
    expect(page1.nextCursor).toBeDefined();

    const page2 = await journalList(TEST_USER_ID, undefined, 2, page1.nextCursor);
    expect(page2.items.length).toBe(2);
  });

  it('prevents cross-user operations', async () => {
    // Create entry for TEST_USER
    const entry = await journalCreate(TEST_USER_ID, {
      side: 'BUY',
      summary: 'Protected entry',
    });

    // OTHER_USER cannot confirm it
    const confirmed = await journalConfirm(OTHER_USER_ID, entry.id, { mood: 'ok', note: '', tags: [] });
    expect(confirmed).toBeNull();

    // OTHER_USER cannot archive it
    const archived = await journalArchive(OTHER_USER_ID, entry.id, 'Hack attempt');
    expect(archived).toBeNull();

    // OTHER_USER cannot delete it
    const deleted = await journalDelete(OTHER_USER_ID, entry.id);
    expect(deleted).toBe(false);

    // Entry still exists for TEST_USER
    const stillExists = await journalGetById(TEST_USER_ID, entry.id);
    expect(stillExists).not.toBeNull();
    expect(stillExists?.status).toBe('PENDING');
  });

  it('throws error when userId is empty', async () => {
    await expect(journalCreate('', { side: 'BUY', summary: 'Test' }))
      .rejects.toThrow('userId is required');
  });
});
