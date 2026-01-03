import { describe, it, expect } from 'vitest';
import { calculateFreshness, TTL } from '../../lib/time/freshness.js';

describe('freshness', () => {
  it('should return fresh if within soft ttl', () => {
    const now = Date.now();
    const asOf = new Date(now - 10 * 1000).toISOString(); // 10s ago
    const result = calculateFreshness(asOf, TTL.PRICE_FAST); // soft 30s
    expect(result.status).toBe('fresh');
    expect(result.ageSec).toBe(10);
  });

  it('should return soft_stale if between soft and hard', () => {
    const now = Date.now();
    const asOf = new Date(now - 40 * 1000).toISOString(); // 40s ago
    const result = calculateFreshness(asOf, TTL.PRICE_FAST); // soft 30s, hard 120s
    expect(result.status).toBe('soft_stale');
    expect(result.ageSec).toBe(40);
  });

  it('should return hard_stale if over hard ttl', () => {
    const now = Date.now();
    const asOf = new Date(now - 130 * 1000).toISOString(); // 130s ago
    const result = calculateFreshness(asOf, TTL.PRICE_FAST); // hard 120s
    expect(result.status).toBe('hard_stale');
  });
});

