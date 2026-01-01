/**
 * TWO_STAGE_CONFIRMED State Machine
 * 
 * States: INITIAL → WATCHING → CONFIRMED → EXPIRED/CANCELLED
 * 
 * Rules:
 * - 2-of-3 indicators must trigger within window
 * - One-shot: once CONFIRMED, no further confirmations
 * - Expiry: if window elapses before 2-of-3, transition to EXPIRED
 * - Cooldown: after CONFIRMED, cooldown period before re-arm
 */

import { randomUUID } from 'crypto';
import type { TwoStageAlert, AlertEmitted, IndicatorState } from '../../types';
import { alertSave } from './repo';
import { alertEventCreateDeduped } from './events-repo';

export interface TwoStageEvaluationContext {
  now: Date;
  indicatorValues: Map<string, { triggered: boolean; value?: string }>;
}

export interface TwoStageEvaluationResult {
  alert: TwoStageAlert;
  event?: AlertEmitted;
  transitioned: boolean;
}

export async function evaluateTwoStageAlert(
  alert: TwoStageAlert,
  ctx: TwoStageEvaluationContext
): Promise<TwoStageEvaluationResult> {
  const now = ctx.now;
  const nowIso = now.toISOString();
  
  // Skip if not in active watching state
  if (!alert.enabled || alert.stage !== 'WATCHING') {
    return { alert, transitioned: false };
  }
  
  // Check expiry
  if (alert.expiresAt && new Date(alert.expiresAt) <= now) {
    return expireAlert(alert, nowIso);
  }
  
  // Update indicator states
  const updatedIndicators = alert.indicators.map(ind => {
    const evalResult = ctx.indicatorValues.get(ind.id);
    if (evalResult) {
      return {
        ...ind,
        triggered: evalResult.triggered,
        lastValue: evalResult.value,
      };
    }
    return ind;
  });
  
  const triggeredCount = updatedIndicators.filter(i => i.triggered).length;
  
  // Check for 2-of-3 confirmation
  if (triggeredCount >= 2) {
    return confirmAlert(alert, updatedIndicators, triggeredCount, nowIso);
  }
  
  // Update progress if indicators changed
  const previousCount = alert.triggeredCount;
  if (triggeredCount !== previousCount) {
    return updateProgress(alert, updatedIndicators, triggeredCount, nowIso);
  }
  
  return { alert, transitioned: false };
}

async function expireAlert(
  alert: TwoStageAlert,
  nowIso: string
): Promise<TwoStageEvaluationResult> {
  // Update alert
  alert.stage = 'EXPIRED';
  alert.status = 'paused';
  alert.enabled = false;
  
  await alertSave(alert);
  
  const event: AlertEmitted = {
    eventId: randomUUID(),
    type: 'TWO_STAGE_EXPIRED',
    occurredAt: nowIso,
    alertId: alert.id,
    alertType: 'TWO_STAGE_CONFIRMED',
    symbolOrAddress: alert.symbolOrAddress,
    timeframe: alert.timeframe,
    stage: 'EXPIRED',
    status: 'paused',
    detail: {
      kind: 'twoStage',
      template: alert.template,
      triggeredCount: alert.triggeredCount,
      indicators: alert.indicators,
      expiresAt: alert.expiresAt,
    },
  };
  
  // Use createdAt as windowId for dedupe
  await alertEventCreateDeduped(event, alert.createdAt);
  
  return {
    alert,
    event,
    transitioned: true,
  };
}

async function confirmAlert(
  alert: TwoStageAlert,
  indicators: IndicatorState[],
  triggeredCount: number,
  nowIso: string
): Promise<TwoStageEvaluationResult> {
  // Update alert
  alert.stage = 'CONFIRMED';
  alert.status = 'triggered';
  alert.indicators = indicators;
  alert.triggeredCount = triggeredCount;
  alert.lastTriggeredAt = nowIso;
  alert.triggerCount++;
  
  await alertSave(alert);
  
  const event: AlertEmitted = {
    eventId: randomUUID(),
    type: 'TWO_STAGE_CONFIRMED',
    occurredAt: nowIso,
    alertId: alert.id,
    alertType: 'TWO_STAGE_CONFIRMED',
    symbolOrAddress: alert.symbolOrAddress,
    timeframe: alert.timeframe,
    stage: 'CONFIRMED',
    status: 'triggered',
    detail: {
      kind: 'twoStage',
      template: alert.template,
      triggeredCount,
      indicators,
      expiresAt: alert.expiresAt,
    },
  };
  
  // Use createdAt as windowId for dedupe (one-shot)
  await alertEventCreateDeduped(event, alert.createdAt);
  
  return {
    alert,
    event,
    transitioned: true,
  };
}

async function updateProgress(
  alert: TwoStageAlert,
  indicators: IndicatorState[],
  triggeredCount: number,
  nowIso: string
): Promise<TwoStageEvaluationResult> {
  // Update alert
  alert.indicators = indicators;
  alert.triggeredCount = triggeredCount;
  if (triggeredCount > 0) {
    alert.lastTriggeredAt = nowIso;
  }
  
  await alertSave(alert);
  
  // Emit progress event (optional, for UI updates)
  const event: AlertEmitted = {
    eventId: randomUUID(),
    type: 'TWO_STAGE_PROGRESS',
    occurredAt: nowIso,
    alertId: alert.id,
    alertType: 'TWO_STAGE_CONFIRMED',
    symbolOrAddress: alert.symbolOrAddress,
    timeframe: alert.timeframe,
    stage: 'WATCHING',
    status: 'active',
    detail: {
      kind: 'twoStage',
      template: alert.template,
      triggeredCount,
      indicators,
      windowEndsAt: alert.windowMinutes
        ? new Date(Date.now() + alert.windowMinutes * 60 * 1000).toISOString()
        : undefined,
      expiresAt: alert.expiresAt,
    },
  };
  
  // Progress events can be deduped by minute bucket to avoid spam
  const minuteBucket = Math.floor(Date.now() / 60000).toString();
  await alertEventCreateDeduped(event, minuteBucket);
  
  return {
    alert,
    event,
    transitioned: false,
  };
}

/**
 * Check if alert is in cooldown
 */
export function isInCooldown(alert: TwoStageAlert, now: Date): boolean {
  if (alert.stage !== 'CONFIRMED') return false;
  
  // Check if cooldown has passed since lastTriggeredAt
  if (alert.lastTriggeredAt) {
    const cooldownEnd = new Date(
      new Date(alert.lastTriggeredAt).getTime() + alert.cooldownMinutes * 60 * 1000
    );
    return now < cooldownEnd;
  }
  
  return false;
}
