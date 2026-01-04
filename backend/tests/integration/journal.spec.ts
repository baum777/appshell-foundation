/**
 * Integration Tests: Journal API
 * MULTITENANCY: All operations require userId
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { journalService } from '../../src/domain/journal/service';

// Test userId - all operations are scoped to this user
const TEST_USER_ID = 'test-user-123';
const OTHER_USER_ID = 'other-user-456';

describe('Journal Integration', () => {
  describe('Create', () => {
    it('should create entry with PENDING status', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, {
        side: 'BUY',
        summary: 'Test entry',
      });
      
      expect(entry.id).toBeDefined();
      expect(entry.userId).toBe(TEST_USER_ID);
      expect(entry.side).toBe('BUY');
      expect(entry.status).toBe('PENDING');
      expect(entry.summary).toBe('Test entry');
      expect(entry.timestamp).toBeDefined();
      expect(entry.dayKey).toBeDefined();
    });
    
    it('should use provided timestamp', async () => {
      const timestamp = '2025-12-31T12:00:00.000Z';
      
      const entry = await journalService.createEntry(TEST_USER_ID, {
        side: 'SELL',
        summary: 'Test',
        timestamp,
      });
      
      expect(entry.timestamp).toBe(timestamp);
      expect(entry.dayKey).toBe('2025-12-31');
    });

    it('should throw error when userId is empty', async () => {
      await expect(journalService.createEntry('', { side: 'BUY', summary: 'Test' } as any))
        .rejects.toThrow('userId is required');
    });
  });
  
  describe('Get by ID', () => {
    it('should return entry by id (userId-scoped)', async () => {
      const created = await journalService.createEntry(TEST_USER_ID, {
        side: 'BUY',
        summary: 'Find me',
      });
      
      const found = await journalService.getEntry(TEST_USER_ID, created.id);
      
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.summary).toBe('Find me');
    });
    
    it('should return null for non-existent id', async () => {
      const found = await journalService.getEntry(TEST_USER_ID, 'non-existent-id');
      
      expect(found).toBeNull();
    });

    it('should isolate entries by userId (multitenancy)', async () => {
      const created = await journalService.createEntry(TEST_USER_ID, {
        side: 'BUY',
        summary: 'User A only',
      });
      
      // OTHER_USER cannot see it
      const foundByOther = await journalService.getEntry(OTHER_USER_ID, created.id);
      expect(foundByOther).toBeNull();
      
      // TEST_USER can see it
      const foundByOwner = await journalService.getEntry(TEST_USER_ID, created.id);
      expect(foundByOwner).not.toBeNull();
    });
  });
  
  describe('List', () => {
    beforeEach(async () => {
      // Create entries with different statuses for TEST_USER
      await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Pending 1' });
      await journalService.createEntry(TEST_USER_ID, { side: 'SELL', summary: 'Pending 2' });
      
      const toConfirm = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'To confirm' });
      await journalService.confirmEntry(TEST_USER_ID, toConfirm.id, { mood: 'good', note: '', tags: [] });
      
      const toArchive = await journalService.createEntry(TEST_USER_ID, { side: 'SELL', summary: 'To archive' });
      await journalService.archiveEntry(TEST_USER_ID, toArchive.id, 'Test reason');
    });
    
    it('should list all entries without filter (userId-scoped)', async () => {
      const result = await journalService.listEntries(TEST_USER_ID);
      
      expect(result.items.length).toBe(4);
    });
    
    it('should filter by pending status', async () => {
      const result = await journalService.listEntries(TEST_USER_ID, 'pending');
      
      expect(result.items.length).toBe(2);
      expect(result.items.every(e => e.status === 'PENDING')).toBe(true);
    });
    
    it('should filter by confirmed status', async () => {
      const result = await journalService.listEntries(TEST_USER_ID, 'confirmed');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].status).toBe('CONFIRMED');
    });
    
    it('should filter by archived status', async () => {
      const result = await journalService.listEntries(TEST_USER_ID, 'archived');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].status).toBe('ARCHIVED');
    });
    
    it('should respect limit', async () => {
      const result = await journalService.listEntries(TEST_USER_ID, undefined, 2);
      
      expect(result.items.length).toBe(2);
    });

    it('should not list entries from other users', async () => {
      // Create entry for OTHER_USER
      await journalService.createEntry(OTHER_USER_ID, { side: 'BUY', summary: 'Other user entry' });
      
      // TEST_USER list should not include it
      const testUserList = await journalService.listEntries(TEST_USER_ID);
      const otherUserList = await journalService.listEntries(OTHER_USER_ID);
      
      expect(testUserList.items.length).toBe(4); // Only TEST_USER entries
      expect(otherUserList.items.length).toBe(1); // Only OTHER_USER entry
    });
  });
  
  describe('Confirm', () => {
    it('should change status to CONFIRMED', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const confirmed = await journalService.confirmEntry(TEST_USER_ID, entry.id, {
        mood: 'excited',
        note: 'Great trade!',
        tags: ['winner', 'strategy-a'],
      });
      
      expect(confirmed?.status).toBe('CONFIRMED');
    });
    
    it('should be idempotent', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      await journalService.confirmEntry(TEST_USER_ID, entry.id, { mood: 'good', note: '', tags: [] });
      const second = await journalService.confirmEntry(TEST_USER_ID, entry.id, { mood: 'different', note: 'x', tags: [] });
      
      expect(second?.status).toBe('CONFIRMED');
    });

    it('should not confirm other users entries', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const result = await journalService.confirmEntry(OTHER_USER_ID, entry.id, { mood: 'ok', note: '', tags: [] });
      
      expect(result).toBeNull();
    });

    it('should allow confirm with empty payload (no mandatory reflection)', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      const confirmed = await journalService.confirmEntry(TEST_USER_ID, entry.id, {} as any);
      expect(confirmed?.status).toBe('CONFIRMED');
    });
  });
  
  describe('Archive', () => {
    it('should change status to ARCHIVED', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'SELL', summary: 'Test' });
      
      const archived = await journalService.archiveEntry(TEST_USER_ID, entry.id, 'Mistake entry');
      
      expect(archived?.status).toBe('ARCHIVED');
    });
    
    it('should be idempotent', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'SELL', summary: 'Test' });
      
      await journalService.archiveEntry(TEST_USER_ID, entry.id, 'First reason');
      const second = await journalService.archiveEntry(TEST_USER_ID, entry.id, 'Second reason');
      
      expect(second?.status).toBe('ARCHIVED');
    });

    it('should not archive other users entries', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'SELL', summary: 'Test' });
      
      const result = await journalService.archiveEntry(OTHER_USER_ID, entry.id, 'Hack');
      
      expect(result).toBeNull();
    });

    it('should allow quickflip archive without reason', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'SELL', summary: 'Test' });
      const archived = await journalService.archiveEntry(TEST_USER_ID, entry.id);
      expect(archived?.status).toBe('ARCHIVED');
    });
  });
  
  describe('Restore', () => {
    it('should change status back to PENDING', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      await journalService.archiveEntry(TEST_USER_ID, entry.id, 'Oops');
      
      const restored = await journalService.restoreEntry(TEST_USER_ID, entry.id);
      
      expect(restored?.status).toBe('PENDING');
    });
    
    it('should be idempotent on pending', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const restored = await journalService.restoreEntry(TEST_USER_ID, entry.id);
      
      expect(restored?.status).toBe('PENDING');
    });

    it('should not restore other users entries', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      await journalService.archiveEntry(TEST_USER_ID, entry.id, 'Archived');
      
      const result = await journalService.restoreEntry(OTHER_USER_ID, entry.id);
      
      expect(result).toBeNull();
    });
  });
  
  describe('Delete', () => {
    it('should remove entry', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const deleted = await journalService.deleteEntry(TEST_USER_ID, entry.id);
      
      expect(deleted).toBe(true);
      expect(await journalService.getEntry(TEST_USER_ID, entry.id)).toBeNull();
    });
    
    it('should return false for non-existent', async () => {
      const deleted = await journalService.deleteEntry(TEST_USER_ID, 'non-existent');
      
      expect(deleted).toBe(false);
    });

    it('should not delete other users entries', async () => {
      const entry = await journalService.createEntry(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const deleted = await journalService.deleteEntry(OTHER_USER_ID, entry.id);
      
      expect(deleted).toBe(false);
      // Entry still exists for owner
      expect(await journalService.getEntry(TEST_USER_ID, entry.id)).not.toBeNull();
    });
  });
});
