/**
 * Integration Tests: Oracle API
 * Per TEST_PLAN.md section 3.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { clearMemoryStore } from '../../_lib/kv/memory-store';
import {
  oracleGetDaily,
  oracleSetReadState,
  oracleBulkSetReadState,
  oracleRefreshDaily,
} from '../../_lib/domain/oracle/repo';

describe('Oracle API Integration', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  it('returns daily feed with pinned takeaway', async () => {
    const today = new Date();
    const feed = await oracleGetDaily(today, 'test-user');

    expect(feed.pinned).toBeDefined();
    expect(feed.pinned.id).toBe('today-takeaway');
    expect(feed.pinned.title).toBeDefined();
    expect(feed.pinned.summary).toBeDefined();
    expect(feed.pinned.isRead).toBe(false);
  });

  it('returns insights list', async () => {
    const today = new Date();
    const feed = await oracleGetDaily(today, 'test-user');

    expect(feed.insights).toBeDefined();
    expect(Array.isArray(feed.insights)).toBe(true);
    expect(feed.insights.length).toBeGreaterThanOrEqual(3);

    for (const insight of feed.insights) {
      expect(insight.id).toBeDefined();
      expect(insight.title).toBeDefined();
      expect(insight.summary).toBeDefined();
      expect(insight.theme).toBeDefined();
      expect(insight.isRead).toBe(false);
    }
  });

  it('generates deterministic content for same date', async () => {
    const date = new Date('2025-12-31');
    
    const feed1 = await oracleGetDaily(date, 'user1');
    clearMemoryStore(); // Clear cache
    const feed2 = await oracleGetDaily(date, 'user2');

    expect(feed1.pinned.title).toBe(feed2.pinned.title);
    expect(feed1.pinned.summary).toBe(feed2.pinned.summary);
  });

  it('sets read state for insight', async () => {
    const result = await oracleSetReadState('test-user', 'today-takeaway', true);

    expect(result.id).toBe('today-takeaway');
    expect(result.isRead).toBe(true);
    expect(result.updatedAt).toBeDefined();
  });

  it('reflects read state on subsequent fetch', async () => {
    const today = new Date();
    
    // First fetch - unread
    const feed1 = await oracleGetDaily(today, 'reader');
    expect(feed1.pinned.isRead).toBe(false);

    // Mark as read
    await oracleSetReadState('reader', 'today-takeaway', true);

    // Second fetch - should be read
    const feed2 = await oracleGetDaily(today, 'reader');
    expect(feed2.pinned.isRead).toBe(true);
  });

  it('bulk sets read states', async () => {
    const today = new Date();
    const feed = await oracleGetDaily(today, 'bulk-user');
    
    const allIds = ['today-takeaway', ...feed.insights.map(i => i.id)];

    const results = await oracleBulkSetReadState('bulk-user', allIds, true);

    expect(results.length).toBe(allIds.length);
    for (const result of results) {
      expect(result.isRead).toBe(true);
    }

    // Verify on fetch
    const feed2 = await oracleGetDaily(today, 'bulk-user');
    expect(feed2.pinned.isRead).toBe(true);
    for (const insight of feed2.insights) {
      expect(insight.isRead).toBe(true);
    }
  });

  it('uses global read state for anon users', async () => {
    const today = new Date();
    
    await oracleSetReadState('anon', 'today-takeaway', true);

    const feed = await oracleGetDaily(today, 'anon');
    expect(feed.pinned.isRead).toBe(true);
  });

  describe('Cron Refresh', () => {
    it('generates daily snapshot idempotently', async () => {
      const result1 = await oracleRefreshDaily();
      expect(result1.generated).toBe(true);
      expect(result1.date).toBeDefined();

      const result2 = await oracleRefreshDaily();
      expect(result2.generated).toBe(false);
      expect(result2.date).toBe(result1.date);
    });
  });
});
