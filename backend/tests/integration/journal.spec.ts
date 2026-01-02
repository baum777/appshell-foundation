/**
 * Integration Tests: Journal API
 * MULTITENANCY: All operations require userId
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  journalCreate,
  journalGetById,
  journalList,
  journalConfirm,
  journalArchive,
  journalRestore,
  journalDelete,
} from '../../src/domain/journal/repo';

// Test userId - all operations are scoped to this user
const TEST_USER_ID = 'test-user-123';
const OTHER_USER_ID = 'other-user-456';

describe('Journal Integration', () => {
  describe('Create', () => {
    it('should create entry with PENDING status', () => {
      const entry = journalCreate(TEST_USER_ID, {
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
    
    it('should use provided timestamp', () => {
      const timestamp = '2025-12-31T12:00:00.000Z';
      
      const entry = journalCreate(TEST_USER_ID, {
        side: 'SELL',
        summary: 'Test',
        timestamp,
      });
      
      expect(entry.timestamp).toBe(timestamp);
      expect(entry.dayKey).toBe('2025-12-31');
    });

    it('should throw error when userId is empty', () => {
      expect(() => journalCreate('', { side: 'BUY', summary: 'Test' }))
        .toThrow('userId is required');
    });
  });
  
  describe('Get by ID', () => {
    it('should return entry by id (userId-scoped)', () => {
      const created = journalCreate(TEST_USER_ID, {
        side: 'BUY',
        summary: 'Find me',
      });
      
      const found = journalGetById(TEST_USER_ID, created.id);
      
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.summary).toBe('Find me');
    });
    
    it('should return null for non-existent id', () => {
      const found = journalGetById(TEST_USER_ID, 'non-existent-id');
      
      expect(found).toBeNull();
    });

    it('should isolate entries by userId (multitenancy)', () => {
      const created = journalCreate(TEST_USER_ID, {
        side: 'BUY',
        summary: 'User A only',
      });
      
      // OTHER_USER cannot see it
      const foundByOther = journalGetById(OTHER_USER_ID, created.id);
      expect(foundByOther).toBeNull();
      
      // TEST_USER can see it
      const foundByOwner = journalGetById(TEST_USER_ID, created.id);
      expect(foundByOwner).not.toBeNull();
    });
  });
  
  describe('List', () => {
    beforeEach(() => {
      // Create entries with different statuses for TEST_USER
      journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Pending 1' });
      journalCreate(TEST_USER_ID, { side: 'SELL', summary: 'Pending 2' });
      
      const toConfirm = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'To confirm' });
      journalConfirm(TEST_USER_ID, toConfirm.id, { mood: 'good', note: '', tags: [] });
      
      const toArchive = journalCreate(TEST_USER_ID, { side: 'SELL', summary: 'To archive' });
      journalArchive(TEST_USER_ID, toArchive.id, 'Test reason');
    });
    
    it('should list all entries without filter (userId-scoped)', () => {
      const result = journalList(TEST_USER_ID);
      
      expect(result.items.length).toBe(4);
    });
    
    it('should filter by pending status', () => {
      const result = journalList(TEST_USER_ID, 'pending');
      
      expect(result.items.length).toBe(2);
      expect(result.items.every(e => e.status === 'PENDING')).toBe(true);
    });
    
    it('should filter by confirmed status', () => {
      const result = journalList(TEST_USER_ID, 'confirmed');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].status).toBe('CONFIRMED');
    });
    
    it('should filter by archived status', () => {
      const result = journalList(TEST_USER_ID, 'archived');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].status).toBe('ARCHIVED');
    });
    
    it('should respect limit', () => {
      const result = journalList(TEST_USER_ID, undefined, 2);
      
      expect(result.items.length).toBe(2);
    });

    it('should not list entries from other users', () => {
      // Create entry for OTHER_USER
      journalCreate(OTHER_USER_ID, { side: 'BUY', summary: 'Other user entry' });
      
      // TEST_USER list should not include it
      const testUserList = journalList(TEST_USER_ID);
      const otherUserList = journalList(OTHER_USER_ID);
      
      expect(testUserList.items.length).toBe(4); // Only TEST_USER entries
      expect(otherUserList.items.length).toBe(1); // Only OTHER_USER entry
    });
  });
  
  describe('Confirm', () => {
    it('should change status to CONFIRMED', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const confirmed = journalConfirm(TEST_USER_ID, entry.id, {
        mood: 'excited',
        note: 'Great trade!',
        tags: ['winner', 'strategy-a'],
      });
      
      expect(confirmed?.status).toBe('CONFIRMED');
    });
    
    it('should be idempotent', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      journalConfirm(TEST_USER_ID, entry.id, { mood: 'good', note: '', tags: [] });
      const second = journalConfirm(TEST_USER_ID, entry.id, { mood: 'different', note: 'x', tags: [] });
      
      expect(second?.status).toBe('CONFIRMED');
    });

    it('should not confirm other users entries', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const result = journalConfirm(OTHER_USER_ID, entry.id, { mood: 'ok', note: '', tags: [] });
      
      expect(result).toBeNull();
    });
  });
  
  describe('Archive', () => {
    it('should change status to ARCHIVED', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'SELL', summary: 'Test' });
      
      const archived = journalArchive(TEST_USER_ID, entry.id, 'Mistake entry');
      
      expect(archived?.status).toBe('ARCHIVED');
    });
    
    it('should be idempotent', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'SELL', summary: 'Test' });
      
      journalArchive(TEST_USER_ID, entry.id, 'First reason');
      const second = journalArchive(TEST_USER_ID, entry.id, 'Second reason');
      
      expect(second?.status).toBe('ARCHIVED');
    });

    it('should not archive other users entries', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'SELL', summary: 'Test' });
      
      const result = journalArchive(OTHER_USER_ID, entry.id, 'Hack');
      
      expect(result).toBeNull();
    });
  });
  
  describe('Restore', () => {
    it('should change status back to PENDING', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      journalArchive(TEST_USER_ID, entry.id, 'Oops');
      
      const restored = journalRestore(TEST_USER_ID, entry.id);
      
      expect(restored?.status).toBe('PENDING');
    });
    
    it('should be idempotent on pending', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const restored = journalRestore(TEST_USER_ID, entry.id);
      
      expect(restored?.status).toBe('PENDING');
    });

    it('should not restore other users entries', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      journalArchive(TEST_USER_ID, entry.id, 'Archived');
      
      const result = journalRestore(OTHER_USER_ID, entry.id);
      
      expect(result).toBeNull();
    });
  });
  
  describe('Delete', () => {
    it('should remove entry', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const deleted = journalDelete(TEST_USER_ID, entry.id);
      
      expect(deleted).toBe(true);
      expect(journalGetById(TEST_USER_ID, entry.id)).toBeNull();
    });
    
    it('should return false for non-existent', () => {
      const deleted = journalDelete(TEST_USER_ID, 'non-existent');
      
      expect(deleted).toBe(false);
    });

    it('should not delete other users entries', () => {
      const entry = journalCreate(TEST_USER_ID, { side: 'BUY', summary: 'Test' });
      
      const deleted = journalDelete(OTHER_USER_ID, entry.id);
      
      expect(deleted).toBe(false);
      // Entry still exists for owner
      expect(journalGetById(TEST_USER_ID, entry.id)).not.toBeNull();
    });
  });
});
