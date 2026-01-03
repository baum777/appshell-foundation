import { getMarketSnapshot, type MarketSnapshot } from '../../adapters/market/marketAdapter.js';
import { getOnchainSnapshot, type OnchainSnapshot } from '../../adapters/onchain/onchainAdapter.js';
import { generateGrokJson } from '../llm/grokJson.js';
import type { FeedCard, Impact } from '../../domain/signals/types.js';
import { calculateFreshness, TTL } from '../../lib/time/freshness.js';
import { logger } from '../../observability/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Baseline generation logic
function generateBaselineOracleCards(
  assetId: string, 
  market: MarketSnapshot, 
  onchain: OnchainSnapshot
): FeedCard[] {
  const cards: FeedCard[] = [];
  const now = new Date().toISOString();

  // 1. Price Momentum
  if (market.change1hPct && Math.abs(market.change1hPct) > 5) {
    cards.push({
      id: uuidv4(),
      kind: 'oracle',
      scope: 'user',
      assetId,
      title: market.change1hPct > 0 ? 'Price Surge' : 'Price Drop',
      why: `${assetId} moved ${market.change1hPct}% in the last hour.`,
      impact: Math.abs(market.change1hPct) > 10 ? 'high' : 'medium',
      confidence: 0.9,
      asOf: market.asOf,
      freshness: calculateFreshness(market.asOf, TTL.PRICE_FAST),
      facts: [{ label: '1h Change', value: `${market.change1hPct}%` }]
    });
  }

  // 2. Volume Check
  if (market.vol24hUsd && market.vol24hUsd > 1000000) {
     cards.push({
      id: uuidv4(),
      kind: 'oracle',
      scope: 'user',
      assetId,
      title: 'High Volume',
      why: `24h Volume is significant at $${(market.vol24hUsd / 1000000).toFixed(1)}M.`,
      impact: 'medium',
      confidence: 0.8,
      asOf: market.asOf,
      freshness: calculateFreshness(market.asOf, TTL.MARKET_MEDIUM),
    });
  }

  // 3. Onchain Holders
  if (onchain.holders && onchain.holders > 1000) {
      cards.push({
      id: uuidv4(),
      kind: 'oracle',
      scope: 'user',
      assetId,
      title: 'Strong Holder Base',
      why: `${onchain.holders} addresses hold this asset.`,
      impact: 'low',
      confidence: 0.7,
      asOf: onchain.asOf,
      freshness: calculateFreshness(onchain.asOf, TTL.ONCHAIN_SLOW),
    });
  }

  return cards;
}

export async function getOracleCards(assetId: string, userId: string, tier: string = 'free'): Promise<FeedCard[]> {
  const [market, onchain] = await Promise.all([
    getMarketSnapshot(assetId),
    getOnchainSnapshot(assetId)
  ]);

  // Generate baseline
  let cards = generateBaselineOracleCards(assetId, market, onchain);

  // Optional: Grok Enrichment
  // Only for pro/vip or if baseline is empty/boring?
  // For now, let's say we use Grok to "phrase" them if Tier allows, or generate a summary card.
  // The plan says "Oracle relevance is deterministic... but Grok may generate the why sentence".
  
  // Minimal implementation: If we have cards, return them. 
  // If we want Grok to improve them, we'd pass them to Grok.
  // Implementing a simple "Grok Summary" card if list is non-empty.

  if (cards.length > 0 && (tier === 'pro' || tier === 'vip')) {
    try {
        const prompt = `
            Summarize these signals for asset ${assetId}:
            ${JSON.stringify(cards.map(c => ({ title: c.title, why: c.why })))}
            
            Return a single JSON object with: { "title": "...", "why": "..." }
        `;
        
        const summary = await generateGrokJson<{ title: string; why: string }>(
            'You are a crypto trading assistant. Be concise.',
            prompt,
            'grok_pulse', // re-using existing useCase or add 'oracle'
            { timeoutMs: 3000 }
        );

        if (summary) {
            // Replace or add summary card?
            // Spec says "return FeedCard[]".
            // Maybe add a high-level summary card.
            cards.unshift({
                id: uuidv4(),
                kind: 'oracle',
                scope: 'user',
                assetId,
                title: summary.title,
                why: summary.why,
                impact: 'high',
                confidence: 0.85,
                asOf: new Date().toISOString(),
                freshness: { status: 'fresh', ageSec: 0 }
            });
        }
    } catch (e) {
        // Ignore Grok failure, fall back to baseline
    }
  }

  return cards;
}

