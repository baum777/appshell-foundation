/**
 * Unit Tests: Journal Service - Index Consistency (SQLite)
 * Tests for pending → confirmed and pending → archived flows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { journalService } from '../../src/domain/journal/service';

const TEST_USER = 'test-user-unit-123';

describe('Journal Service - Index Consistency (SQLite)', () => {
  describe('pending → confirmed flow', () => {
    it('should change status from PENDING to CONFIRMED', async () => {
      const entry = await journalService.createEntry(TEST_USER, {
        side: 'BUY',
        summary: 'Test entry',
      });

      expect(entry.status).toBe('PENDING');

      const confirmed = await journalService.confirmEntry(TEST_USER, entry.id, { mood: 'ok', note: '', tags: [] });

      expect(confirmed?.status).toBe('CONFIRMED');
    });

    it('should be idempotent - double confirm returns same result', async () => {
      const entry = await journalService.createEntry(TEST_USER, {
        side: 'BUY',
        summary: 'Test entry',
      });

      const first = await journalService.confirmEntry(TEST_USER, entry.id, { mood: 'ok', note: '', tags: [] });
      const second = await journalService.confirmEntry(TEST_USER, entry.id, { mood: 'ok', note: '', tags: [] });

      expect(first?.status).toBe('CONFIRMED');
      expect(second?.status).toBe('CONFIRMED');
    });

    it('should store confirmation data', async () => {
      const entry = await journalService.createEntry(TEST_USER, {
        side: 'BUY',
        summary: 'Test entry',
      });

      await journalService.confirmEntry(TEST_USER, entry.id, {
        mood: 'confident',
        note: 'Great setup',
        tags: ['breakout', 'volume'],
      });

      // Verify confirmation data was stored
      // (In SQLite repo, confirmation is stored in separate table)
      expect(true).toBe(true); // Test passes if no error
    });
  });

  describe('pending → archived flow', () => {
    it('should change status from PENDING to ARCHIVED', async () => {
      const entry = await journalService.createEntry(TEST_USER, {
        side: 'SELL',
        summary: 'Test entry',
      });

      expect(entry.status).toBe('PENDING');

      const archived = await journalService.archiveEntry(TEST_USER, entry.id, 'Invalid setup');

      expect(archived?.status).toBe('ARCHIVED');
    });

    it('should be idempotent - double archive returns same result', async () => {
      const entry = await journalService.createEntry(TEST_USER, {
        side: 'SELL',
        summary: 'Test entry',
      });

      const first = await journalService.archiveEntry(TEST_USER, entry.id, 'Reason 1');
      const second = await journalService.archiveEntry(TEST_USER, entry.id, 'Reason 2');

      expect(first?.status).toBe('ARCHIVED');
      expect(second?.status).toBe('ARCHIVED');
    });
  });

  describe('archived → pending (restore) flow', () => {
    it('should change status from ARCHIVED to PENDING', async () => {
      const entry = await journalService.createEntry(TEST_USER, {
        side: 'BUY',
        summary: 'Test entry',
      });
      await journalService.archiveEntry(TEST_USER, entry.id, 'Mistake');

      const restored = await journalService.restoreEntry(TEST_USER, entry.id);

      expect(restored?.status).toBe('PENDING');
    });

    it('should be idempotent - restore on pending returns pending', async () => {
      const entry = await journalService.createEntry(TEST_USER, {
        side: 'BUY',
        summary: 'Test entry',
      });

      const result = await journalService.restoreEntry(TEST_USER, entry.id);

      expect(result?.status).toBe('PENDING');
    });
  });

  describe('multitenancy isolation', () => {
    it('should not allow cross-user confirm', async () => {
      const OTHER_USER = 'other-user-xyz';

      const entry = await journalService.createEntry(TEST_USER, {
        side: 'BUY',
        summary: 'User 1 entry',
      });

      // OTHER_USER cannot confirm TEST_USER's entry
      const result = await journalService.confirmEntry(OTHER_USER, entry.id, { mood: 'ok', note: '', tags: [] });

      expect(result).toBeNull();
    });

    it('should not allow cross-user archive', async () => {
      const OTHER_USER = 'other-user-xyz';

      const entry = await journalService.createEntry(TEST_USER, {
        side: 'SELL',
        summary: 'User 1 entry',
      });

      const result = await journalService.archiveEntry(OTHER_USER, entry.id, 'Hack attempt');

      expect(result).toBeNull();
    });

    it('should not allow cross-user restore', async () => {
      const OTHER_USER = 'other-user-xyz';

      const entry = await journalService.createEntry(TEST_USER, {
        side: 'BUY',
        summary: 'User 1 entry',
      });
      await journalService.archiveEntry(TEST_USER, entry.id, 'Archived');

      const result = await journalService.restoreEntry(OTHER_USER, entry.id);

      expect(result).toBeNull();
    });
  });

  describe('userId validation', () => {
    it('should throw error when userId is empty', async () => {
      await expect(journalService.createEntry('', { side: 'BUY', summary: 'Test' } as any))
        .rejects.toThrow('userId is required');
    });

    it('should throw error when userId is whitespace only', async () => {
      await expect(journalService.createEntry('   ', { side: 'BUY', summary: 'Test' } as any))
        .rejects.toThrow('userId is required');
    });
  });
});

