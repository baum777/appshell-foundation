/**
 * Unit Tests: State Machines
 * Per TEST_PLAN.md section 2.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { clearMemoryStore } from '../../_lib/kv/memory-store';
import type { TwoStageAlert, DeadTokenAlert } from '../../_lib/types';
import { evaluateTwoStageAlert, type TwoStageEvaluationContext } from '../../_lib/domain/alerts/two-stage-machine';
import { evaluateDeadTokenAlert, isTokenDead, type DeadTokenEvaluationContext, type TokenMetrics } from '../../_lib/domain/alerts/dead-token-machine';
import { DEFAULT_DEAD_TOKEN_PARAMS } from '../../_lib/types';

// Clear KV store before each test
beforeEach(() => {
  clearMemoryStore();
});

describe('TWO_STAGE_CONFIRMED State Machine', () => {
  const createTwoStageAlert = (overrides?: Partial<TwoStageAlert>): TwoStageAlert => ({
    id: 'alert-test-123',
    type: 'TWO_STAGE_CONFIRMED',
    symbolOrAddress: 'SOL',
    timeframe: '15m',
    enabled: true,
    status: 'active',
    stage: 'WATCHING',
    createdAt: '2025-12-31T12:00:00.000Z',
    triggerCount: 0,
    template: 'TREND_MOMENTUM_STRUCTURE',
    expiryMinutes: 60,
    cooldownMinutes: 15,
    indicators: [
      { id: 'ema_cross', label: 'EMA Cross', category: 'Trend', params: '', triggered: false },
      { id: 'rsi_momentum', label: 'RSI', category: 'Momentum', params: '', triggered: false },
      { id: 'structure_hh', label: 'Higher High', category: 'Structure', params: '', triggered: false },
    ],
    triggeredCount: 0,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    ...overrides,
  });

  it('transitions to CONFIRMED when 2-of-3 indicators trigger', async () => {
    const alert = createTwoStageAlert();
    
    const ctx: TwoStageEvaluationContext = {
      now: new Date(),
      indicatorValues: new Map([
        ['ema_cross', { triggered: true, value: '1' }],
        ['rsi_momentum', { triggered: true, value: '55' }],
        ['structure_hh', { triggered: false, value: '0' }],
      ]),
    };
    
    const result = await evaluateTwoStageAlert(alert, ctx);
    
    expect(result.transitioned).toBe(true);
    expect(result.alert.stage).toBe('CONFIRMED');
    expect(result.alert.status).toBe('triggered');
    expect(result.event).toBeDefined();
    expect(result.event?.type).toBe('TWO_STAGE_CONFIRMED');
  });

  it('emits progress event when 1-of-3 triggers', async () => {
    const alert = createTwoStageAlert();
    
    const ctx: TwoStageEvaluationContext = {
      now: new Date(),
      indicatorValues: new Map([
        ['ema_cross', { triggered: true, value: '1' }],
        ['rsi_momentum', { triggered: false, value: '45' }],
        ['structure_hh', { triggered: false, value: '0' }],
      ]),
    };
    
    const result = await evaluateTwoStageAlert(alert, ctx);
    
    expect(result.alert.triggeredCount).toBe(1);
    expect(result.event?.type).toBe('TWO_STAGE_PROGRESS');
  });

  it('transitions to EXPIRED when expiry is reached', async () => {
    const alert = createTwoStageAlert({
      expiresAt: new Date(Date.now() - 1000).toISOString(), // Already expired
    });
    
    const ctx: TwoStageEvaluationContext = {
      now: new Date(),
      indicatorValues: new Map(),
    };
    
    const result = await evaluateTwoStageAlert(alert, ctx);
    
    expect(result.transitioned).toBe(true);
    expect(result.alert.stage).toBe('EXPIRED');
    expect(result.alert.status).toBe('paused');
    expect(result.alert.enabled).toBe(false);
    expect(result.event?.type).toBe('TWO_STAGE_EXPIRED');
  });

  it('skips evaluation when disabled', async () => {
    const alert = createTwoStageAlert({ enabled: false });
    
    const ctx: TwoStageEvaluationContext = {
      now: new Date(),
      indicatorValues: new Map([
        ['ema_cross', { triggered: true, value: '1' }],
        ['rsi_momentum', { triggered: true, value: '55' }],
      ]),
    };
    
    const result = await evaluateTwoStageAlert(alert, ctx);
    
    expect(result.transitioned).toBe(false);
    expect(result.alert.stage).toBe('WATCHING');
  });
});

describe('DEAD_TOKEN_AWAKENING_V2 State Machine', () => {
  const params = DEFAULT_DEAD_TOKEN_PARAMS;

  const createDeadTokenAlert = (overrides?: Partial<DeadTokenAlert>): DeadTokenAlert => ({
    id: 'alert-dead-123',
    type: 'DEAD_TOKEN_AWAKENING_V2',
    symbolOrAddress: 'BONK',
    timeframe: '5m',
    enabled: true,
    status: 'active',
    stage: 'WATCHING',
    createdAt: '2025-12-31T12:00:00.000Z',
    triggerCount: 0,
    params,
    deadTokenStage: 'INITIAL',
    ...overrides,
  });

  describe('isTokenDead', () => {
    it('returns true when all conditions met', () => {
      const metrics: TokenMetrics = {
        volume: 50, // <= 100
        trades: 3,  // <= 5
        holderDelta6h: -2, // <= 0
        holderDelta30m: 0,
      };
      
      expect(isTokenDead(metrics, params)).toBe(true);
    });

    it('returns false when volume is too high', () => {
      const metrics: TokenMetrics = {
        volume: 500, // > 100
        trades: 3,
        holderDelta6h: -2,
        holderDelta30m: 0,
      };
      
      expect(isTokenDead(metrics, params)).toBe(false);
    });
  });

  it('stays in INITIAL when token is not dead', async () => {
    const alert = createDeadTokenAlert();
    
    // Not dead - volume too high
    const ctx: DeadTokenEvaluationContext = {
      now: new Date(),
      metrics: {
        volume: 500, // > 100 (not dead)
        trades: 15,
        holderDelta6h: -2,
        holderDelta30m: 10,
      },
    };
    
    const result = await evaluateDeadTokenAlert(alert, ctx);
    
    // Should not transition because token is not dead
    expect(result.transitioned).toBe(false);
    expect(result.alert.deadTokenStage).toBe('INITIAL');
  });

  it('respects 12h session timeout', async () => {
    const sessionStart = new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(); // 13h ago
    const sessionEndsAt = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(); // 1h ago
    
    const alert = createDeadTokenAlert({
      deadTokenStage: 'AWAKENING',
      sessionStart,
      sessionEndsAt,
    });
    
    const ctx: DeadTokenEvaluationContext = {
      now: new Date(),
      metrics: {
        volume: 500,
        trades: 15,
        holderDelta6h: 5,
        holderDelta30m: 10,
      },
    };
    
    const result = await evaluateDeadTokenAlert(alert, ctx);
    
    expect(result.transitioned).toBe(true);
    expect(result.alert.deadTokenStage).toBe('SESSION_ENDED');
    expect(result.event?.type).toBe('DEAD_TOKEN_SESSION_ENDED');
  });

  it('respects cooldown period', async () => {
    const cooldownEndsAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10min in future
    
    const alert = createDeadTokenAlert({
      deadTokenStage: 'SESSION_ENDED',
      cooldownEndsAt,
    });
    
    const ctx: DeadTokenEvaluationContext = {
      now: new Date(),
      metrics: {
        volume: 50,
        trades: 3,
        holderDelta6h: -2,
        holderDelta30m: 0,
      },
    };
    
    const result = await evaluateDeadTokenAlert(alert, ctx);
    
    expect(result.transitioned).toBe(false);
  });
});
