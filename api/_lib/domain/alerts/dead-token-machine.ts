/**
 * DEAD_TOKEN_AWAKENING_V2 State Machine
 * 
 * Stages: INITIAL → AWAKENING → SUSTAINED → SECOND_SURGE → SESSION_ENDED
 * 
 * Rules:
 * - Precondition: Token must be "dead" (low volume, low trades, no holder growth)
 * - Session max: 12 hours from first awakening
 * - One-shot emits per stage
 * - Cooldown after SESSION_ENDED or SECOND_SURGE
 */

import { randomUUID } from 'crypto';
import type { DeadTokenAlert, AlertEmitted, DeadTokenParams } from '../../types';
import { alertSave } from './repo';
import { alertEventCreateDeduped } from './events-repo';

const SESSION_MAX_HOURS = 12;

export interface TokenMetrics {
  volume: number;
  trades: number;
  holderDelta6h: number;
  holderDelta30m: number;
}

export interface DeadTokenEvaluationContext {
  now: Date;
  metrics: TokenMetrics;
}

export interface DeadTokenEvaluationResult {
  alert: DeadTokenAlert;
  event?: AlertEmitted;
  transitioned: boolean;
}

/**
 * Check if token is "dead" according to params
 */
export function isTokenDead(metrics: TokenMetrics, params: DeadTokenParams): boolean {
  return (
    metrics.volume <= params.DEAD_VOL &&
    metrics.trades <= params.DEAD_TRADES &&
    metrics.holderDelta6h <= params.DEAD_HOLDER_DELTA_6H
  );
}

/**
 * Check awakening conditions (2-of-3)
 */
function checkAwakeningConditions(
  metrics: TokenMetrics,
  params: DeadTokenParams,
  baseVolume: number,
  baseTrades: number
): { met: boolean; count: number } {
  let count = 0;
  
  // Volume multiplier
  if (metrics.volume >= baseVolume * params.AWAKE_VOL_MULT) count++;
  
  // Trades multiplier  
  if (metrics.trades >= baseTrades * params.AWAKE_TRADES_MULT) count++;
  
  // Holder delta 30m
  if (metrics.holderDelta30m >= params.AWAKE_HOLDER_DELTA_30M) count++;
  
  return { met: count >= 2, count };
}

/**
 * Check second surge conditions (2-of-3)
 */
function checkSecondSurgeConditions(
  metrics: TokenMetrics,
  params: DeadTokenParams,
  baseVolume: number,
  baseTrades: number
): { met: boolean; count: number } {
  let count = 0;
  
  // Stage 3 volume multiplier
  if (metrics.volume >= baseVolume * params.STAGE3_VOL_MULT) count++;
  
  // Stage 3 trades multiplier
  if (metrics.trades >= baseTrades * params.STAGE3_TRADES_MULT) count++;
  
  // Stage 3 holder delta
  if (metrics.holderDelta30m >= params.STAGE3_HOLDER_DELTA) count++;
  
  return { met: count >= 2, count };
}

export async function evaluateDeadTokenAlert(
  alert: DeadTokenAlert,
  ctx: DeadTokenEvaluationContext
): Promise<DeadTokenEvaluationResult> {
  const now = ctx.now;
  const nowIso = now.toISOString();
  const { metrics } = ctx;
  const { params } = alert;
  
  // Skip if not enabled
  if (!alert.enabled) {
    return { alert, transitioned: false };
  }
  
  // Check cooldown
  if (alert.cooldownEndsAt && new Date(alert.cooldownEndsAt) > now) {
    return { alert, transitioned: false };
  }
  
  // Check session timeout (12h max)
  if (alert.sessionEndsAt && new Date(alert.sessionEndsAt) <= now) {
    return endSession(alert, nowIso, 'timeout');
  }
  
  // Base metrics for multipliers (use params as baseline)
  const baseVolume = params.DEAD_VOL;
  const baseTrades = params.DEAD_TRADES;
  
  switch (alert.deadTokenStage) {
    case 'INITIAL':
      return evaluateInitial(alert, metrics, nowIso);
      
    case 'AWAKENING':
      return evaluateAwakening(alert, metrics, baseVolume, baseTrades, nowIso);
      
    case 'SUSTAINED':
      return evaluateSustained(alert, metrics, baseVolume, baseTrades, nowIso);
      
    case 'SECOND_SURGE':
      return endSession(alert, nowIso, 'completed');
      
    case 'SESSION_ENDED':
      // Reset to INITIAL if cooldown passed
      return resetToInitial(alert);
      
    default:
      return { alert, transitioned: false };
  }
}

async function evaluateInitial(
  alert: DeadTokenAlert,
  metrics: TokenMetrics,
  nowIso: string
): Promise<DeadTokenEvaluationResult> {
  const { params } = alert;
  
  // Check deadness precondition
  if (!isTokenDead(metrics, params)) {
    return { alert, transitioned: false };
  }
  
  // Check awakening conditions (2-of-3)
  const baseVolume = params.DEAD_VOL;
  const baseTrades = params.DEAD_TRADES;
  const { met } = checkAwakeningConditions(metrics, params, baseVolume, baseTrades);
  
  if (!met) {
    return { alert, transitioned: false };
  }
  
  // Transition to AWAKENING
  const sessionStart = nowIso;
  const sessionEndsAt = new Date(
    Date.now() + SESSION_MAX_HOURS * 60 * 60 * 1000
  ).toISOString();
  const windowEndsAt = new Date(
    Date.now() + params.STAGE2_WINDOW_MIN * 60 * 1000
  ).toISOString();
  
  alert.deadTokenStage = 'AWAKENING';
  alert.sessionStart = sessionStart;
  alert.sessionEndsAt = sessionEndsAt;
  alert.windowEndsAt = windowEndsAt;
  
  await alertSave(alert);
  
  const event: AlertEmitted = {
    eventId: randomUUID(),
    type: 'DEAD_TOKEN_STAGE',
    occurredAt: nowIso,
    alertId: alert.id,
    alertType: 'DEAD_TOKEN_AWAKENING_V2',
    symbolOrAddress: alert.symbolOrAddress,
    timeframe: alert.timeframe,
    stage: 'WATCHING',
    status: 'active',
    detail: {
      kind: 'deadToken',
      deadTokenStage: 'AWAKENING',
      sessionStart,
      sessionEndsAt,
      windowEndsAt,
    },
  };
  
  // Use sessionStart as windowId for dedupe
  await alertEventCreateDeduped(event, sessionStart);
  
  return {
    alert,
    event,
    transitioned: true,
  };
}

async function evaluateAwakening(
  alert: DeadTokenAlert,
  metrics: TokenMetrics,
  baseVolume: number,
  baseTrades: number,
  nowIso: string
): Promise<DeadTokenEvaluationResult> {
  const { params } = alert;
  
  // Check if window expired
  if (alert.windowEndsAt && new Date(alert.windowEndsAt) <= new Date(nowIso)) {
    return endSession(alert, nowIso, 'window_expired');
  }
  
  // Check sustained conditions
  const { met } = checkAwakeningConditions(metrics, params, baseVolume, baseTrades);
  
  if (!met) {
    return { alert, transitioned: false };
  }
  
  // Transition to SUSTAINED
  const windowEndsAt = new Date(
    Date.now() + params.STAGE3_WINDOW_H * 60 * 60 * 1000
  ).toISOString();
  
  alert.deadTokenStage = 'SUSTAINED';
  alert.windowEndsAt = windowEndsAt;
  
  await alertSave(alert);
  
  const event: AlertEmitted = {
    eventId: randomUUID(),
    type: 'DEAD_TOKEN_STAGE',
    occurredAt: nowIso,
    alertId: alert.id,
    alertType: 'DEAD_TOKEN_AWAKENING_V2',
    symbolOrAddress: alert.symbolOrAddress,
    timeframe: alert.timeframe,
    stage: 'WATCHING',
    status: 'active',
    detail: {
      kind: 'deadToken',
      deadTokenStage: 'SUSTAINED',
      sessionStart: alert.sessionStart,
      sessionEndsAt: alert.sessionEndsAt,
      windowEndsAt,
    },
  };
  
  // Use sessionStart as windowId for dedupe
  await alertEventCreateDeduped(event, alert.sessionStart || nowIso);
  
  return {
    alert,
    event,
    transitioned: true,
  };
}

async function evaluateSustained(
  alert: DeadTokenAlert,
  metrics: TokenMetrics,
  baseVolume: number,
  baseTrades: number,
  nowIso: string
): Promise<DeadTokenEvaluationResult> {
  const { params } = alert;
  
  // Check if window expired
  if (alert.windowEndsAt && new Date(alert.windowEndsAt) <= new Date(nowIso)) {
    return endSession(alert, nowIso, 'window_expired');
  }
  
  // Check second surge conditions
  const { met } = checkSecondSurgeConditions(metrics, params, baseVolume, baseTrades);
  
  if (!met) {
    return { alert, transitioned: false };
  }
  
  // Transition to SECOND_SURGE
  alert.deadTokenStage = 'SECOND_SURGE';
  alert.stage = 'CONFIRMED';
  alert.status = 'triggered';
  alert.triggerCount++;
  alert.lastTriggeredAt = nowIso;
  delete alert.windowEndsAt;
  
  await alertSave(alert);
  
  const event: AlertEmitted = {
    eventId: randomUUID(),
    type: 'DEAD_TOKEN_STAGE',
    occurredAt: nowIso,
    alertId: alert.id,
    alertType: 'DEAD_TOKEN_AWAKENING_V2',
    symbolOrAddress: alert.symbolOrAddress,
    timeframe: alert.timeframe,
    stage: 'CONFIRMED',
    status: 'triggered',
    detail: {
      kind: 'deadToken',
      deadTokenStage: 'SECOND_SURGE',
      sessionStart: alert.sessionStart,
      sessionEndsAt: alert.sessionEndsAt,
    },
  };
  
  // Use sessionStart as windowId for dedupe
  await alertEventCreateDeduped(event, alert.sessionStart || nowIso);
  
  return {
    alert,
    event,
    transitioned: true,
  };
}

async function endSession(
  alert: DeadTokenAlert,
  nowIso: string,
  reason: 'timeout' | 'window_expired' | 'completed'
): Promise<DeadTokenEvaluationResult> {
  const cooldownEndsAt = new Date(
    Date.now() + alert.params.COOLDOWN_MIN * 60 * 1000
  ).toISOString();
  
  alert.deadTokenStage = 'SESSION_ENDED';
  alert.stage = reason === 'completed' ? 'CONFIRMED' : 'EXPIRED';
  alert.status = reason === 'completed' ? 'triggered' : 'paused';
  alert.enabled = reason === 'completed';
  alert.cooldownEndsAt = cooldownEndsAt;
  delete alert.windowEndsAt;
  
  await alertSave(alert);
  
  const event: AlertEmitted = {
    eventId: randomUUID(),
    type: 'DEAD_TOKEN_SESSION_ENDED',
    occurredAt: nowIso,
    alertId: alert.id,
    alertType: 'DEAD_TOKEN_AWAKENING_V2',
    symbolOrAddress: alert.symbolOrAddress,
    timeframe: alert.timeframe,
    stage: alert.stage,
    status: alert.status,
    detail: {
      kind: 'deadToken',
      deadTokenStage: 'SESSION_ENDED',
      sessionStart: alert.sessionStart,
      sessionEndsAt: alert.sessionEndsAt,
    },
  };
  
  // Use sessionStart as windowId for dedupe
  await alertEventCreateDeduped(event, alert.sessionStart || nowIso);
  
  return {
    alert,
    event,
    transitioned: true,
  };
}

async function resetToInitial(alert: DeadTokenAlert): Promise<DeadTokenEvaluationResult> {
  alert.deadTokenStage = 'INITIAL';
  alert.stage = 'WATCHING';
  alert.status = 'active';
  alert.enabled = true;
  delete alert.sessionStart;
  delete alert.sessionEndsAt;
  delete alert.windowEndsAt;
  delete alert.cooldownEndsAt;
  
  await alertSave(alert);
  
  return {
    alert,
    transitioned: true,
  };
}
