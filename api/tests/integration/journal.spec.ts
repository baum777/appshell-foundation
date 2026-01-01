/**
 * Integration Tests: Journal API
 * Per TEST_PLAN.md section 3.2
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

describe('Journal API Integration', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  it('creates entry with status=pending', async () => {
    const entry = await journalCreate({
      side: 'BUY',
      summary: 'Test trade entry',
    });

    expect(entry.id).toBeDefined();
    expect(entry.status).toBe('pending');
    expect(entry.side).toBe('BUY');
    expect(entry.summary).toBe('Test trade entry');
    expect(entry.timestamp).toBeDefined();
  });

  it('creates entry with custom timestamp', async () => {
    const timestamp = '2025-12-31T12:00:00.000Z';
    const entry = await journalCreate({
      side: 'SELL',
      summary: 'Timed entry',
      timestamp,
    });

    expect(entry.timestamp).toBe(timestamp);
  });

  it('returns entry by id', async () => {
    const created = await journalCreate({
      side: 'BUY',
      summary: 'Find me',
    });

    const found = await journalGetById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.summary).toBe('Find me');
  });

  it('returns null for nonexistent entry', async () => {
    const found = await journalGetById('nonexistent-id');
    expect(found).toBeNull();
  });

  it('lists entries filtered by status', async () => {
    await journalCreate({ side: 'BUY', summary: 'Pending 1' });
    await journalCreate({ side: 'SELL', summary: 'Pending 2' });
    const entry3 = await journalCreate({ side: 'BUY', summary: 'To confirm' });
    await journalConfirm(entry3.id, { mood: 'good', note: '', tags: [] });

    const pending = await journalList('pending');
    const confirmed = await journalList('confirmed');

    expect(pending.items.length).toBe(2);
    expect(confirmed.items.length).toBe(1);
    expect(confirmed.items[0].summary).toBe('To confirm');
  });

  it('confirms entry and updates status', async () => {
    const entry = await journalCreate({
      side: 'BUY',
      summary: 'Confirm me',
    });

    const confirmed = await journalConfirm(entry.id, {
      mood: 'confident',
      note: 'Good setup',
      tags: ['breakout', 'volume'],
    });

    expect(confirmed?.status).toBe('confirmed');
  });

  it('is idempotent on double confirm', async () => {
    const entry = await journalCreate({
      side: 'BUY',
      summary: 'Double confirm',
    });

    await journalConfirm(entry.id, { mood: 'ok', note: '', tags: [] });
    const second = await journalConfirm(entry.id, { mood: 'ok', note: '', tags: [] });

    expect(second?.status).toBe('confirmed');
  });

  it('archives entry', async () => {
    const entry = await journalCreate({
      side: 'SELL',
      summary: 'Archive me',
    });

    const archived = await journalArchive(entry.id, 'Invalid trade');

    expect(archived?.status).toBe('archived');
  });

  it('is idempotent on double archive', async () => {
    const entry = await journalCreate({
      side: 'SELL',
      summary: 'Double archive',
    });

    await journalArchive(entry.id, 'First archive');
    const second = await journalArchive(entry.id, 'Second archive');

    expect(second?.status).toBe('archived');
  });

  it('restores entry to pending', async () => {
    const entry = await journalCreate({
      side: 'BUY',
      summary: 'Restore me',
    });
    await journalArchive(entry.id, 'Oops');

    const restored = await journalRestore(entry.id);

    expect(restored?.status).toBe('pending');
  });

  it('deletes entry', async () => {
    const entry = await journalCreate({
      side: 'BUY',
      summary: 'Delete me',
    });

    const deleted = await journalDelete(entry.id);
    const found = await journalGetById(entry.id);

    expect(deleted).toBe(true);
    expect(found).toBeNull();
  });

  it('returns false on deleting nonexistent entry', async () => {
    const deleted = await journalDelete('nonexistent');
    expect(deleted).toBe(false);
  });

  it('supports pagination', async () => {
    // Create 5 entries
    for (let i = 1; i <= 5; i++) {
      await journalCreate({
        side: 'BUY',
        summary: `Entry ${i}`,
        timestamp: new Date(Date.now() + i * 1000).toISOString(),
      });
    }

    const page1 = await journalList(undefined, 2);
    expect(page1.items.length).toBe(2);
    expect(page1.nextCursor).toBeDefined();

    const page2 = await journalList(undefined, 2, page1.nextCursor);
    expect(page2.items.length).toBe(2);
  });
});
