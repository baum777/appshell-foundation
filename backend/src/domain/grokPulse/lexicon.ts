import type { GrokSentimentSnapshot } from './types.js';

export const SENTIMENT_TERMS = [
  'bullish vibes', 'bearish dumps', 'neutral stagnation', 'moon potential', 'rug risk', 'dead project',
  'strong bull momentum', 'strong bear decline', 'fomo incoming', 'panic sell', 'accumulation phase',
  'hype building', 'washed out', 'conviction high', 'choppy market'
] as const;

export const CTA_PHRASES = [
  'ape in', 'dca now', 'watch closely', 'dump fast', 'avoid rugs', 'hold strong', 'buy the dip', 'sell high',
  'raid live', 'jeet out', 'position early', 'scout gems', 'rotate positions', 'accumulate dips', 'fade the hype'
] as const;

export function mapSentimentTerm(snapshot: Pick<GrokSentimentSnapshot, 'score' | 'label' | 'low_confidence' | 'delta' | 'confidence'>): string {
  const { score, label, low_confidence, delta = 0, confidence } = snapshot;

  if (label === 'DEAD' || score <= -70) return 'dead project';
  if (label === 'RUG' || (score <= -55 && low_confidence)) return 'rug risk';
  
  if (score >= 80) return 'moon potential';
  if (score >= 60) return 'strong bull momentum';
  if (score >= 40) return 'bullish vibes';
  
  if (score >= 15 && score <= 39) {
    return delta >= 20 ? 'hype building' : 'accumulation phase';
  }
  
  if (score >= -14 && score <= 14) {
    return Math.abs(delta) >= 25 ? 'choppy market' : 'neutral stagnation';
  }
  
  if (score >= -39 && score <= -15) return 'bearish dumps';
  if (score <= -40) {
    if (score <= -60 && delta <= -20) return 'panic sell';
    if (score <= -55 && delta >= 15) return 'washed out';
    return 'strong bear decline';
  }

  if (score >= 50 && delta <= -15) return 'fomo incoming';
  if (confidence >= 0.9 && score >= 40) return 'conviction high';

  return 'choppy market';
}

export function mapCtaPhrase(snapshot: Pick<GrokSentimentSnapshot, 'cta' | 'score' | 'label' | 'delta'>): string {
  const { cta, score, label, delta = 0 } = snapshot;
  const upperCta = cta.toUpperCase();

  if (label === 'RUG') return 'avoid rugs';
  if (label === 'DEAD') return 'jeet out';

  if (upperCta.includes('APE')) return score >= 55 ? 'ape in' : 'position early';
  if (upperCta.includes('DCA')) return score >= 15 ? 'dca now' : 'accumulate dips';
  
  if (upperCta.includes('WATCH')) {
    return delta >= 25 ? 'raid live' : 'scout gems'; // "watch closely" is implicit fallback
  }

  if (upperCta.includes('DUMP')) return score >= 40 ? 'sell high' : 'dump fast';
  
  if (upperCta.includes('AVOID')) {
    return score > -25 ? 'fade the hype' : 'jeet out';
  }

  // Fallback heuristic based on generic mapping if CTA is unknown
  if (score >= 60) return 'ape in';
  if (score >= 30) return 'dca now';
  if (score <= -40) return 'dump fast';
  
  return 'watch closely';
}
