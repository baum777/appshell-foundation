import { describe, it, expect, vi } from 'vitest';
import { getUnifiedSignals } from '../../src/services/signals/unifiedService.js';

// Mocks
vi.mock('../../src/services/user/watchlistService.js', () => ({
  getWatchlist: vi.fn().mockResolvedValue(['WARM1', 'WARM2'])
}));
vi.mock('../../src/services/user/focusService.js', () => ({
  getFocus: vi.fn().mockResolvedValue({ assetId: 'HOT1', until: '2099-01-01' })
}));
vi.mock('../../src/services/signals/oracleService.js', () => ({
  getOracleCards: vi.fn().mockImplementation(async (assetId) => {
    return [{
      id: assetId,
      kind: 'oracle',
      scope: 'user',
      assetId,
      title: `Oracle ${assetId}`,
      why: '...',
      impact: assetId === 'HOT1' ? 'critical' : 'low',
      confidence: 0.8,
      asOf: new Date().toISOString(),
      freshness: { status: 'fresh', ageSec: 0 }
    }];
  })
}));
vi.mock('../../src/services/signals/dailyBiasService.js', () => ({
  getDailyBias: vi.fn().mockResolvedValue({
    id: 'bias', kind: 'pulse', scope: 'market', title: 'Bias', why: '...', impact: 'medium', confidence: 0.5, asOf: new Date().toISOString(), freshness: { status: 'fresh', ageSec: 0 }
  })
}));
vi.mock('../../src/services/signals/pulseService.js', () => ({
  generatePulseCards: vi.fn().mockResolvedValue([{
    id: 'pulse1', kind: 'pulse', scope: 'market', title: 'Pulse', why: '...', impact: 'high', confidence: 0.6, asOf: new Date().toISOString(), freshness: { status: 'fresh', ageSec: 0 }
  }])
}));

describe('unifiedService', () => {
  it('should aggregate user and market signals', async () => {
    const result = await getUnifiedSignals('u1', 'free');
    
    // User: HOT1 + WARM1 + WARM2 (capped by policy? free has warm=10 so ok)
    expect(result.user.length).toBe(3);
    
    // Market: Bias + Pulse (HOT1)
    expect(result.market.length).toBe(2); 
  });

  it('should sort by impact', async () => {
    const result = await getUnifiedSignals('u1', 'free', 'all', 'impact');
    // HOT1 is critical, WARM1/2 are low.
    expect(result.user[0].impact).toBe('critical');
    expect(result.user[2].impact).toBe('low');
  });
});

