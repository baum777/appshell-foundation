import { describe, it, expect } from 'vitest';
import { mapSentimentTerm, mapCtaPhrase } from '../../domain/grokPulse/lexicon.js';
import { calculateFallbackSentiment } from '../../domain/grokPulse/fallback-sentiment.js';
import type { GrokSentimentSnapshot, PulseGlobalToken } from '../../domain/grokPulse/types.js';

describe('Grok Pulse Lexicon', () => {
  it('maps sentiment terms correctly', () => {
    expect(mapSentimentTerm({ score: 85, label: 'MOON', low_confidence: false })).toBe('moon potential');
    expect(mapSentimentTerm({ score: -75, label: 'DEAD', low_confidence: false })).toBe('dead project');
    expect(mapSentimentTerm({ score: 70, label: 'STRONG_BULL', low_confidence: false })).toBe('strong bull momentum');
    expect(mapSentimentTerm({ score: 0, label: 'NEUTRAL', low_confidence: false })).toBe('neutral stagnation');
    expect(mapSentimentTerm({ score: 0, label: 'NEUTRAL', low_confidence: false, delta: 30 })).toBe('choppy market');
  });

  it('maps CTA phrases correctly', () => {
    expect(mapCtaPhrase({ cta: 'APE', score: 60, label: 'BULL' })).toBe('ape in');
    expect(mapCtaPhrase({ cta: 'APE', score: 20, label: 'BULL' })).toBe('position early');
    expect(mapCtaPhrase({ cta: 'DUMP', score: -50, label: 'BEAR' })).toBe('dump fast');
    expect(mapCtaPhrase({ cta: 'AVOID', score: -60, label: 'RUG' })).toBe('avoid rugs');
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



