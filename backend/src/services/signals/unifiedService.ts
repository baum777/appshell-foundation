import { getWatchlist } from '../user/watchlistService.js';
import { getFocus } from '../user/focusService.js';
import { getOracleCards } from './oracleService.js';
import { getDailyBias } from './dailyBiasService.js';
import { generatePulseCards } from './pulseService.js';
import type { FeedCard, UnifiedSignalsResponse, SignalFilter, SignalSort, Impact, FreshnessStatus } from '../../domain/signals/types.js';

type Tier = "free" | "pro" | "vip";

type TierPolicy = {
  maxHotAssets: number;
  maxWarmAssets: number;
  oracleMaxCardsPerAsset: number;
  pulseMaxCardsPerAsset: number;
};

const POLICIES: Record<Tier, TierPolicy> = {
  free: { maxHotAssets: 1, maxWarmAssets: 10, oracleMaxCardsPerAsset: 6, pulseMaxCardsPerAsset: 6 },
  pro: { maxHotAssets: 5, maxWarmAssets: 50, oracleMaxCardsPerAsset: 10, pulseMaxCardsPerAsset: 10 },
  vip: { maxHotAssets: 20, maxWarmAssets: 200, oracleMaxCardsPerAsset: 20, pulseMaxCardsPerAsset: 20 }
};

const IMPACT_SCORE: Record<Impact, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const FRESHNESS_SCORE: Record<FreshnessStatus, number> = { fresh: 3, soft_stale: 2, hard_stale: 1 };

function sortCards(cards: FeedCard[], sort: SignalSort): FeedCard[] {
  return [...cards].sort((a, b) => {
    switch (sort) {
      case 'impact':
        return IMPACT_SCORE[b.impact] - IMPACT_SCORE[a.impact];
      case 'freshness':
        return FRESHNESS_SCORE[b.freshness.status] - FRESHNESS_SCORE[a.freshness.status];
      case 'confidence':
        return b.confidence - a.confidence;
      case 'newest':
        return new Date(b.asOf).getTime() - new Date(a.asOf).getTime();
      default:
        return 0;
    }
  });
}

export async function getUnifiedSignals(
  userId: string, 
  tier: Tier = 'free', 
  filter: SignalFilter = 'all', 
  sort: SignalSort = 'impact'
): Promise<UnifiedSignalsResponse> {
  const policy = POLICIES[tier];
  
  // 1. Build Active Set
  const focus = await getFocus(userId);
  const watchlist = await getWatchlist(userId);
  
  const hotAssets = focus ? [focus.assetId] : [];
  // Deduplicate and limit
  const warmAssets = watchlist
    .filter(id => !hotAssets.includes(id))
    .slice(0, policy.maxWarmAssets);

  const activeSet = [...hotAssets, ...warmAssets];

  // 2. Fetch User Signals (Oracle)
  let userCards: FeedCard[] = [];
  if (filter === 'all' || filter === 'user') {
    // Parallel fetch for active set
    const promises = activeSet.map(assetId => getOracleCards(assetId, userId, tier));
    const results = await Promise.all(promises);
    userCards = results.flat();
  }

  // 3. Fetch Market Signals (Pulse + Daily Bias)
  let marketCards: FeedCard[] = [];
  if (filter === 'all' || filter === 'market') {
    const dailyBias = await getDailyBias();
    marketCards.push(dailyBias);

    // Pulse for focus asset only to save cost/time in this unified view, 
    // or maybe global pulse? Spec says "small pulse bundle (either per focus asset or global)".
    // Let's do focus asset pulse if exists.
    if (focus) {
        const pulse = await generatePulseCards(focus.assetId);
        marketCards.push(...pulse);
    }
  }

  // 4. Sort
  userCards = sortCards(userCards, sort);
  marketCards = sortCards(marketCards, sort);

  return {
    user: userCards,
    market: marketCards,
    asOf: new Date().toISOString()
  };
}

