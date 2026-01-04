import { describe, it, expect } from 'vitest';
import { mapSentimentTerm, mapCtaPhrase } from '../../src/domain/grokPulse/lexicon.js';
import { calculateFallbackSentiment } from '../../src/domain/grokPulse/fallback-sentiment.js';
import type { GrokSentimentSnapshot, PulseGlobalToken } from '../../src/domain/grokPulse/types.js';

describe('Grok Pulse Lexicon', () => {
  it('maps sentiment terms correctly', () => {
    // Keep confidence < 0.9 so the "conviction high" confidenceRule does not override score bands.
    expect(mapSentimentTerm({ score: 85, label: 'MOON', confidence: 0.5, low_confidence: false })).toBe('moon potential');
    expect(mapSentimentTerm({ score: -75, label: 'DEAD', confidence: 0.5, low_confidence: false })).toBe('dead project');
    expect(mapSentimentTerm({ score: 70, label: 'STRONG_BULL', confidence: 0.5, low_confidence: false })).toBe('strong bull momentum');
    expect(mapSentimentTerm({ score: 0, label: 'NEUTRAL', confidence: 0.5, low_confidence: false })).toBe('neutral stagnation');
    // Delta rules: large positive delta on a positive score triggers a "fomo incoming" override.
    expect(mapSentimentTerm({ score: 50, label: 'BULL', confidence: 0.5, low_confidence: false, delta: 30 })).toBe('fomo incoming');
  });

  it('maps CTA phrases correctly', () => {
    expect(mapCtaPhrase({ cta: 'APE', score: 85, label: 'MOON', confidence: 0.5, low_confidence: false })).toBe('ape in');
    expect(mapCtaPhrase({ cta: 'APE', score: 45, label: 'BULL', confidence: 0.5, low_confidence: false })).toBe('position early');
    expect(mapCtaPhrase({ cta: 'DUMP', score: -50, label: 'BEAR', confidence: 0.5, low_confidence: false })).toBe('dump fast');
    expect(mapCtaPhrase({ cta: 'AVOID', score: -60, label: 'RUG', confidence: 0.5, low_confidence: false })).toBe('avoid rugs');
  });
});

describe('Fallback Sentiment Heuristics', () => {
  const baseToken: PulseGlobalToken = {
    address: 'addr',
    symbol: 'TEST',
    chain: 'solana'
  };

  it('decays previous score', () => {
    const prev: GrokSentimentSnapshot = {
      score: 50, label: 'BULL', confidence: 1, cta: 'HOLD', one_liner: '', top_snippet: '', ts: 0, low_confidence: false, source: 'grok'
    };
    
    const result = calculateFallbackSentiment(baseToken, prev);
    expect(result.score).toBe(45); // 50 * 0.9
  });

  it('penalizes low volume old tokens', () => {
    const token = { ...baseToken, volume24h: 5000, ageMinutes: 2000 };
    const result = calculateFallbackSentiment(token, null);
    expect(result.score).toBe(-20);
  });

  it('boosts high cap high vol tokens', () => {
    const token = { ...baseToken, volume24h: 2_000_000, marketCap: 15_000_000 };
    const result = calculateFallbackSentiment(token, null);
    expect(result.score).toBe(10);
  });
});

