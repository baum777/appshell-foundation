import type { FeedCard } from '../../domain/signals/types.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateFreshness, TTL } from '../../lib/time/freshness.js';

export async function getDailyBias(): Promise<FeedCard> {
  // In a real impl, fetch SOL trends, meme breadth, etc.
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    kind: 'pulse', // Spec says "market-related" so kind=pulse fits, or maybe a new kind? Spec says "Daily Bias (market regime)"
                   // Spec "Daily Bias ... Bias must be a single FeedCard"
                   // Use kind='pulse' scope='market' seems appropriate.
    scope: 'market',
    title: 'Daily Bias: Neutral',
    why: 'Market is consolidating. SOL liquidity is stable. Meme sector shows mixed signals.',
    impact: 'medium',
    confidence: 0.6,
    asOf: now,
    freshness: calculateFreshness(now, TTL.DAILY_BIAS),
    facts: [
      { label: 'Trend', value: 'Sideways' },
      { label: 'Sector', value: 'Mixed' }
    ]
  };
}

