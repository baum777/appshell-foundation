import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePulse } from '../../api/_lib/domain/pulse/engine';
import { manualSeedAdapter } from '../../api/_lib/domain/pulse/adapter';
import { PulseLabel } from '../../api/_lib/domain/pulse/types';
import { clearMemoryStore } from '../../api/_lib/kv/memory-store';
import { getPulse, savePulse } from '../../api/_lib/domain/pulse/repo';

// Mock routeLLMRequest
vi.mock('../../api/_lib/reasoning/llmRouter', () => ({
  routeLLMRequest: vi.fn().mockImplementation(async (useCase, req) => {
    if (useCase === 'grok_pulse') {
      return {
        model: 'grok-beta',
        parsed: {
          label: 'BULL',
          score: 75,
          confidence: 0.9,
          drivers: ['Strong volume', 'New partnership'],
          reasoning_short: 'Looks good',
          top_sources: [{ name: 'Twitter', url: 'https://x.com/post/1' }]
        },
        rawText: '{}'
      };
    }
    throw new Error('Unknown use case');
  })
}));

describe('Grok Pulse Engine', () => {
  beforeEach(() => {
    clearMemoryStore();
    manualSeedAdapter.seed([]);
  });

  it('returns UNKNOWN/heuristic if no items found', async () => {
    const pulse = await generatePulse('test query');
    expect(pulse.label).toBe(PulseLabel.UNKNOWN);
    expect(pulse.meta.model).toBe('heuristic');
    expect(pulse.confidence).toBe(0);
  });

  it('calls Grok when items exist and parses result', async () => {
    // Seed data
    manualSeedAdapter.seed([{
      text: 'Bitcoin to the moon!',
      ts: Date.now(),
      url: 'http://test.com',
      author: 'satoshi'
    }]);

    const pulse = await generatePulse('bitcoin');
    
    expect(pulse.label).toBe('BULL');
    expect(pulse.score).toBe(75);
    expect(pulse.drivers).toContain('Strong volume');
    expect(pulse.meta.model).toBe('grok-beta');
  });

  it('stores and retrieves pulse from KV', async () => {
    const mockPulse = {
      query: 'solana',
      ts: Date.now(),
      label: PulseLabel.STRONG_BULL,
      score: 90,
      confidence: 0.95,
      drivers: [],
      sources: [],
      meta: { model: 'test', latency_ms: 10, version: 'v1', cache: 'miss' as const }
    };

    await savePulse(mockPulse);
    
    const retrieved = await getPulse('solana');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.label).toBe(PulseLabel.STRONG_BULL);
  });
});

