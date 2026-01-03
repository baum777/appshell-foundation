import { generateGrokJson } from '../llm/grokJson.js';
import type { FeedCard } from '../../domain/signals/types.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateFreshness, TTL } from '../../lib/time/freshness.js';

export async function generatePulseCards(assetId: string): Promise<FeedCard[]> {
  // 1. Gather context (stubbed for now, normally would come from ingestion)
  const context = {
    headlines: [
      "Solana network activity surges",
      "Meme coins seeing rotation"
    ],
    assetId
  };

  try {
    const system = `You are a crypto market analyst. Analyze the market pulse for ${assetId}.
    Return a JSON object with a "cards" array. Each card has: title, why, impact (low/medium/high/critical), confidence (0.0-1.0), facts (array of {label, value}).`;
    
    const prompt = `Context: ${JSON.stringify(context)}`;
    
    const result = await generateGrokJson<{ cards: any[] }>(
        system,
        prompt,
        'grok_pulse',
        { timeoutMs: 15000 }
    );

    if (result && Array.isArray(result.cards)) {
        const now = new Date().toISOString();
        return result.cards.map(c => ({
            id: uuidv4(),
            kind: 'pulse',
            scope: 'market',
            assetId,
            title: c.title,
            why: c.why,
            impact: c.impact || 'medium',
            confidence: c.confidence || 0.5,
            asOf: now,
            freshness: calculateFreshness(now, TTL.PULSE),
            facts: c.facts || []
        }));
    }
  } catch (e) {
      // Fallback
  }

  // Fallback Baseline
  return [
    {
      id: uuidv4(),
      kind: 'pulse',
      scope: 'market',
      assetId,
      title: 'Market Activity',
      why: 'Monitoring market sentiment and news flow.',
      impact: 'low',
      confidence: 0.3,
      asOf: new Date().toISOString(),
      freshness: { status: 'soft_stale', ageSec: 0 }
    }
  ];
}

