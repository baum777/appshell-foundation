import { getEnv } from '../../config/env.js';
import { logger } from '../../observability/logger.js';
import { callGrok } from '../../clients/grokClient.js';
import { 
  getPulseSnapshot, 
  setPulseSnapshot, 
  pushPulseHistory, 
  incrementDailyUsage, 
  setLastRun 
} from './kv.js';
import { getGlobalTokenList } from './sources.js';
import { buildGrokContext } from './contextBuilder.js';
import { calculateFallbackSentiment } from './fallback-sentiment.js';
import { mapSentimentTerm, mapCtaPhrase } from './lexicon.js';
import type { GrokSentimentSnapshot, PulseGlobalToken } from './types.js';

export async function runGrokPulseEngine(): Promise<{ processed: number, quota: number }> {
  const env = getEnv();
  const tokens = await getGlobalTokenList();
  
  // 1. Check Quota
  const usage = await incrementDailyUsage();
  const limit = env.MAX_DAILY_GROK_CALLS;
  const hasQuota = usage <= limit;

  if (!hasQuota) {
    logger.warn('Grok Pulse quota exceeded', { usage, limit });
  }

  let processed = 0;

  for (const token of tokens) {
    try {
      await processToken(token, hasQuota);
      processed++;
    } catch (error) {
      logger.error('Failed to process token pulse', { token: token.symbol, error: String(error) });
    }
  }

  await setLastRun(Date.now());
  return { processed, quota: usage };
}

async function processToken(token: PulseGlobalToken, hasQuota: boolean) {
  const previous = await getPulseSnapshot(token.address);
  
  let snapshot: GrokSentimentSnapshot;

  if (hasQuota) {
    try {
      // Real Call
      const context = buildGrokContext(token);
      const llmRes = await callGrok({
        model: 'grok-beta', // or from env
        prompt: context,
        system: 'You are a crypto sentiment analyst. Analyze the provided token metrics and return JSON.',
        timeoutMs: 20000,
        jsonOnly: true
      });
      
      const parsed = llmRes.parsed as any; // Validation normally here
      
      // Basic validation
      if (typeof parsed.score !== 'number' || !parsed.label) {
        throw new Error('Invalid Grok response shape');
      }

      snapshot = {
        ...parsed,
        ts: Date.now(),
        delta: previous ? parsed.score - previous.score : 0,
        low_confidence: parsed.confidence < 0.5,
        source: 'grok'
      };

    } catch (error) {
      logger.error('Grok call failed, falling back', { error: String(error) });
      snapshot = calculateFallbackSentiment(token, previous);
    }
  } else {
    // Fallback due to quota
    snapshot = calculateFallbackSentiment(token, previous);
  }

  // 3. Apply Lexicon (Deterministic UI helpers)
  snapshot.sentiment_term = mapSentimentTerm(snapshot);
  snapshot.cta_phrase = mapCtaPhrase(snapshot);

  // 4. Save
  await setPulseSnapshot(token.address, snapshot);
  await pushPulseHistory(token.address, {
    ts: snapshot.ts,
    score: snapshot.score,
    label: snapshot.label
  });
}

