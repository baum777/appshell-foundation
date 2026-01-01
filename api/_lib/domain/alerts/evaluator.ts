/**
 * Alert Evaluator
 * Processes active alerts against current market data
 * Deterministic and safe under retries
 */

import { randomUUID } from 'crypto';
import type {
  Alert,
  SimpleAlert,
  TwoStageAlert,
  DeadTokenAlert,
  AlertEmitted,
} from '../../types';
import { getActiveAlerts, alertSave } from './repo';
import { alertEventCreateDeduped } from './events-repo';
import { evaluateTwoStageAlert, type TwoStageEvaluationContext } from './two-stage-machine';
import { evaluateDeadTokenAlert, type TokenMetrics, type DeadTokenEvaluationContext } from './dead-token-machine';

// ─────────────────────────────────────────────────────────────
// PROVIDER INTERFACES
// ─────────────────────────────────────────────────────────────

export interface PriceFeedProvider {
  getLastPrice(symbolOrAddress: string, timeframe: string): Promise<number>;
}

export interface TokenMetricsProvider {
  getMetrics(symbolOrAddress: string): Promise<TokenMetrics>;
}

export interface IndicatorProvider {
  evaluateIndicators(
    symbolOrAddress: string,
    timeframe: string,
    indicatorIds: string[]
  ): Promise<Map<string, { triggered: boolean; value?: string }>>;
}

export interface EvaluatorContext {
  now: Date;
  priceFeed: PriceFeedProvider;
  tokenMetrics: TokenMetricsProvider;
  indicators: IndicatorProvider;
}

export interface EvaluationResult {
  evaluated: number;
  events: AlertEmitted[];
  recommendedNextPollSeconds?: number;
}

// ─────────────────────────────────────────────────────────────
// EVALUATION LOGIC
// ─────────────────────────────────────────────────────────────

/**
 * Evaluate all active alerts
 */
export async function evaluateAlerts(ctx: EvaluatorContext): Promise<EvaluationResult> {
  const alerts = await getActiveAlerts();
  const events: AlertEmitted[] = [];
  
  for (const alert of alerts) {
    try {
      const result = await evaluateAlert(alert, ctx);
      if (result) {
        events.push(result);
      }
    } catch (error) {
      // Log but don't fail entire evaluation
      console.error(`Failed to evaluate alert ${alert.id}:`, error);
    }
  }
  
  // Recommend faster polling if there are active watches
  const hasActiveWatches = alerts.some(a => 
    a.stage === 'WATCHING' && a.enabled
  );
  
  return {
    evaluated: alerts.length,
    events,
    recommendedNextPollSeconds: hasActiveWatches ? 30 : 60,
  };
}

/**
 * Evaluate specific alerts by ID
 */
export async function evaluateAlertsByIds(
  alertIds: string[],
  ctx: EvaluatorContext
): Promise<EvaluationResult> {
  const { alertGetById } = await import('./repo');
  const events: AlertEmitted[] = [];
  let evaluated = 0;
  
  for (const id of alertIds) {
    const alert = await alertGetById(id);
    if (!alert || !alert.enabled) continue;
    
    try {
      const result = await evaluateAlert(alert, ctx);
      evaluated++;
      if (result) {
        events.push(result);
      }
    } catch (error) {
      console.error(`Failed to evaluate alert ${id}:`, error);
    }
  }
  
  return {
    evaluated,
    events,
    recommendedNextPollSeconds: 30,
  };
}

async function evaluateAlert(
  alert: Alert,
  ctx: EvaluatorContext
): Promise<AlertEmitted | undefined> {
  switch (alert.type) {
    case 'SIMPLE':
      return evaluateSimpleAlert(alert, ctx);
    case 'TWO_STAGE_CONFIRMED':
      return evaluateTwoStage(alert, ctx);
    case 'DEAD_TOKEN_AWAKENING_V2':
      return evaluateDeadToken(alert, ctx);
    default:
      return undefined;
  }
}

async function evaluateSimpleAlert(
  alert: SimpleAlert,
  ctx: EvaluatorContext
): Promise<AlertEmitted | undefined> {
  if (!alert.enabled || alert.stage !== 'WATCHING') {
    return undefined;
  }
  
  const lastPrice = await ctx.priceFeed.getLastPrice(alert.symbolOrAddress, alert.timeframe);
  const triggered = checkSimpleCondition(alert.condition, lastPrice, alert.targetPrice);
  
  if (!triggered) {
    return undefined;
  }
  
  const nowIso = ctx.now.toISOString();
  
  // Update alert
  alert.stage = 'CONFIRMED';
  alert.status = 'triggered';
  alert.triggeredAt = nowIso;
  alert.lastTriggeredAt = nowIso;
  alert.triggerCount++;
  
  await alertSave(alert);
  
  const event: AlertEmitted = {
    eventId: randomUUID(),
    type: 'SIMPLE_TRIGGERED',
    occurredAt: nowIso,
    alertId: alert.id,
    alertType: 'SIMPLE',
    symbolOrAddress: alert.symbolOrAddress,
    timeframe: alert.timeframe,
    stage: 'CONFIRMED',
    status: 'triggered',
    detail: {
      kind: 'simple',
      condition: alert.condition,
      targetPrice: alert.targetPrice,
      lastPrice,
    },
  };
  
  // Use createdAt as windowId for dedupe (one-shot)
  await alertEventCreateDeduped(event, alert.createdAt);
  
  return event;
}

function checkSimpleCondition(
  condition: string,
  lastPrice: number,
  targetPrice: number
): boolean {
  switch (condition) {
    case 'ABOVE':
      return lastPrice >= targetPrice;
    case 'BELOW':
      return lastPrice <= targetPrice;
    case 'CROSS':
      // For CROSS, we check if price is near target (within 0.1%)
      // Full implementation would need previous price to detect crossing
      return Math.abs(lastPrice - targetPrice) / targetPrice < 0.001;
    default:
      return false;
  }
}

async function evaluateTwoStage(
  alert: TwoStageAlert,
  ctx: EvaluatorContext
): Promise<AlertEmitted | undefined> {
  const indicatorIds = alert.indicators.map(i => i.id);
  const indicatorValues = await ctx.indicators.evaluateIndicators(
    alert.symbolOrAddress,
    alert.timeframe,
    indicatorIds
  );
  
  const evalCtx: TwoStageEvaluationContext = {
    now: ctx.now,
    indicatorValues,
  };
  
  const result = await evaluateTwoStageAlert(alert, evalCtx);
  return result.event;
}

async function evaluateDeadToken(
  alert: DeadTokenAlert,
  ctx: EvaluatorContext
): Promise<AlertEmitted | undefined> {
  const metrics = await ctx.tokenMetrics.getMetrics(alert.symbolOrAddress);
  
  const evalCtx: DeadTokenEvaluationContext = {
    now: ctx.now,
    metrics,
  };
  
  const result = await evaluateDeadTokenAlert(alert, evalCtx);
  return result.event;
}

// ─────────────────────────────────────────────────────────────
// DETERMINISTIC STUB PROVIDERS (for testing / missing keys)
// ─────────────────────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function createDeterministicPriceFeed(seed: string): PriceFeedProvider {
  return {
    async getLastPrice(symbolOrAddress: string, timeframe: string): Promise<number> {
      // Deterministic hash-based price
      const hash = simpleHash(`${seed}:${symbolOrAddress}:${timeframe}:${Math.floor(Date.now() / 60000)}`);
      // Generate price between 0.1 and 1000
      return 0.1 + (hash % 100000) / 100;
    },
  };
}

export function createDeterministicTokenMetrics(seed: string): TokenMetricsProvider {
  return {
    async getMetrics(symbolOrAddress: string): Promise<TokenMetrics> {
      const hash = simpleHash(`${seed}:${symbolOrAddress}:${Math.floor(Date.now() / 60000)}`);
      return {
        volume: hash % 1000,
        trades: hash % 100,
        holderDelta6h: (hash % 20) - 10,
        holderDelta30m: (hash % 10) - 5,
      };
    },
  };
}

export function createDeterministicIndicatorProvider(seed: string): IndicatorProvider {
  return {
    async evaluateIndicators(
      symbolOrAddress: string,
      timeframe: string,
      indicatorIds: string[]
    ): Promise<Map<string, { triggered: boolean; value?: string }>> {
      const results = new Map<string, { triggered: boolean; value?: string }>();
      
      for (const id of indicatorIds) {
        const hash = simpleHash(`${seed}:${symbolOrAddress}:${timeframe}:${id}:${Math.floor(Date.now() / 60000)}`);
        results.set(id, {
          triggered: hash % 2 === 0,
          value: (hash % 100).toString(),
        });
      }
      
      return results;
    },
  };
}

export function createDeterministicEvaluatorContext(seed: string = 'test-seed-v1'): EvaluatorContext {
  return {
    now: new Date(),
    priceFeed: createDeterministicPriceFeed(seed),
    tokenMetrics: createDeterministicTokenMetrics(seed),
    indicators: createDeterministicIndicatorProvider(seed),
  };
}
