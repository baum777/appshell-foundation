import { describe, it, expect, vi } from 'vitest';
import { generatePulseCards } from '../../src/services/signals/pulseService.js';

vi.mock('../../src/services/llm/grokJson.js', () => ({
  generateGrokJson: vi.fn().mockImplementation(async (sys, prompt, useCase) => {
    return {
      cards: [
        { title: 'Grok Pulse', why: 'Because', impact: 'high', confidence: 0.9 }
      ]
    };
  })
}));

describe('pulseService', () => {
  it('should return generated cards on success', async () => {
    const cards = await generatePulseCards('SOL');
    expect(cards.length).toBe(1);
    expect(cards[0].title).toBe('Grok Pulse');
  });

  it('should fallback if Grok fails', async () => {
    // Override mock to fail or return null
    vi.mocked(await import('../../src/services/llm/grokJson.js')).generateGrokJson.mockResolvedValueOnce(null);
    
    const cards = await generatePulseCards('SOL');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].kind).toBe('pulse');
    // Baseline title is 'Market Activity'
    expect(cards[0].title).toBe('Market Activity');
  });
});

