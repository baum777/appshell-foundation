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

describe('Journal Integration', () => {
  describe('Create', () => {
    it('should create entry with pending status', () => {
      const entry = journalCreate({
        side: 'BUY',
        summary: 'Test entry',
      });
      
      expect(entry.id).toBeDefined();
      expect(entry.side).toBe('BUY');
      expect(entry.status).toBe('pending');
      expect(entry.summary).toBe('Test entry');
      expect(entry.timestamp).toBeDefined();
    });
    
    it('should use provided timestamp', () => {
      const timestamp = '2025-12-31T12:00:00.000Z';
      
      const entry = journalCreate({
        side: 'SELL',
        summary: 'Test',
        timestamp,
      });
      
      expect(entry.timestamp).toBe(timestamp);
    });
  });
  
  describe('Get by ID', () => {
    it('should return entry by id', () => {
      const created = journalCreate({
        side: 'BUY',
        summary: 'Find me',
      });
      
      const found = journalGetById(created.id);
      
      expect(found).toEqual(created);
    });
    
    it('should return null for non-existent id', () => {
      const found = journalGetById('non-existent-id');
      
      expect(found).toBeNull();
    });
  });
  
  describe('List', () => {
    beforeEach(() => {
      // Create entries with different statuses
      journalCreate({ side: 'BUY', summary: 'Pending 1' });
      journalCreate({ side: 'SELL', summary: 'Pending 2' });
      
      const toConfirm = journalCreate({ side: 'BUY', summary: 'To confirm' });
      journalConfirm(toConfirm.id, { mood: 'good', note: '', tags: [] });
      
      const toArchive = journalCreate({ side: 'SELL', summary: 'To archive' });
      journalArchive(toArchive.id, 'Test reason');
    });
    
    it('should list all entries without filter', () => {
      const result = journalList();
      
      expect(result.items.length).toBe(4);
    });
    
    it('should filter by pending status', () => {
      const result = journalList('pending');
      
      expect(result.items.length).toBe(2);
      expect(result.items.every(e => e.status === 'pending')).toBe(true);
    });
    
    it('should filter by confirmed status', () => {
      const result = journalList('confirmed');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].status).toBe('confirmed');
    });
    
    it('should filter by archived status', () => {
      const result = journalList('archived');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].status).toBe('archived');
    });
    
    it('should respect limit', () => {
      const result = journalList(undefined, 2);
      
      expect(result.items.length).toBe(2);
    });
  });
  
  describe('Confirm', () => {
    it('should change status to confirmed', () => {
      const entry = journalCreate({ side: 'BUY', summary: 'Test' });
      
      const confirmed = journalConfirm(entry.id, {
        mood: 'excited',
        note: 'Great trade!',
        tags: ['winner', 'strategy-a'],
      });
      
      expect(confirmed?.status).toBe('confirmed');
    });
    
    it('should be idempotent', () => {
      const entry = journalCreate({ side: 'BUY', summary: 'Test' });
      
      journalConfirm(entry.id, { mood: 'good', note: '', tags: [] });
      const second = journalConfirm(entry.id, { mood: 'different', note: 'x', tags: [] });
      
      expect(second?.status).toBe('confirmed');
    });
  });
  
  describe('Archive', () => {
    it('should change status to archived', () => {
      const entry = journalCreate({ side: 'SELL', summary: 'Test' });
      
      const archived = journalArchive(entry.id, 'Mistake entry');
      
      expect(archived?.status).toBe('archived');
    });
    
    it('should be idempotent', () => {
      const entry = journalCreate({ side: 'SELL', summary: 'Test' });
      
      journalArchive(entry.id, 'First reason');
      const second = journalArchive(entry.id, 'Second reason');
      
      expect(second?.status).toBe('archived');
    });
  });
  
  describe('Restore', () => {
    it('should change status back to pending', () => {
      const entry = journalCreate({ side: 'BUY', summary: 'Test' });
      journalArchive(entry.id, 'Oops');
      
      const restored = journalRestore(entry.id);
      
      expect(restored?.status).toBe('pending');
    });
    
    it('should be idempotent on pending', () => {
      const entry = journalCreate({ side: 'BUY', summary: 'Test' });
      
      const restored = journalRestore(entry.id);
      
      expect(restored?.status).toBe('pending');
    });
  });
  
  describe('Delete', () => {
    it('should remove entry', () => {
      const entry = journalCreate({ side: 'BUY', summary: 'Test' });
      
      const deleted = journalDelete(entry.id);
      
      expect(deleted).toBe(true);
      expect(journalGetById(entry.id)).toBeNull();
    });
    
    it('should return false for non-existent', () => {
      const deleted = journalDelete('non-existent');
      
      expect(deleted).toBe(false);
    });
  });
});
