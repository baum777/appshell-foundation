import { describe, it, expect, vi } from 'vitest';
import { getOracleCards } from '../../services/signals/oracleService.js';

vi.mock('../../adapters/market/marketAdapter.js', () => ({
  getMarketSnapshot: vi.fn().mockResolvedValue({
    assetId: 'SOL',
    asOf: new Date().toISOString(),
    priceUsd: 150,
    change1hPct: 6, // Triggers momentum
    vol24hUsd: 2000000, // Triggers volume
    liquidityUsd: 1000000
  })
}));

vi.mock('../../adapters/onchain/onchainAdapter.js', () => ({
  getOnchainSnapshot: vi.fn().mockResolvedValue({
    assetId: 'SOL',
    asOf: new Date().toISOString(),
    holders: 2000, // Triggers holders
    trades1h: 100
  })
}));

vi.mock('../../services/llm/grokJson.js', () => ({
  generateGrokJson: vi.fn().mockResolvedValue({ title: 'AI Summary', why: 'AI says so' })
}));

describe('oracleService', () => {
  it('should generate baseline cards from snapshots', async () => {
    const cards = await getOracleCards('SOL', 'user1', 'free');
    
    expect(cards.length).toBeGreaterThan(0);
    const momentum = cards.find(c => c.title === 'Price Surge');
    expect(momentum).toBeDefined();
    expect(momentum?.impact).toBe('medium');
  });

  it('should include AI summary for pro users', async () => {
    const cards = await getOracleCards('SOL', 'user1', 'pro');
    const summary = cards.find(c => c.title === 'AI Summary');
    expect(summary).toBeDefined();
  });
});

