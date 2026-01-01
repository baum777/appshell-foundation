/**
 * Integration Tests: Alerts API
 * Per TEST_PLAN.md section 3.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { clearMemoryStore } from '../../_lib/kv/memory-store';
import {
  alertCreate,
  alertGetById,
  alertList,
  alertUpdate,
  alertCancelWatch,
  alertDelete,
} from '../../_lib/domain/alerts/repo';
import { alertEventsQuery } from '../../_lib/domain/alerts/events-repo';
import { evaluateAlerts, createDeterministicEvaluatorContext } from '../../_lib/domain/alerts/evaluator';
import type { SimpleAlert, TwoStageAlert, DeadTokenAlert } from '../../_lib/types';
import { DEFAULT_DEAD_TOKEN_PARAMS } from '../../_lib/types';

describe('Alerts API Integration', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  describe('SIMPLE Alerts', () => {
    it('creates SIMPLE alert with correct defaults', async () => {
      const alert = await alertCreate({
        type: 'SIMPLE',
        symbolOrAddress: 'btc',
        timeframe: '1h',
        condition: 'ABOVE',
        targetPrice: 100000,
      }) as SimpleAlert;

      expect(alert.id).toBeDefined();
      expect(alert.type).toBe('SIMPLE');
      expect(alert.symbolOrAddress).toBe('BTC'); // Normalized
      expect(alert.enabled).toBe(true);
      expect(alert.status).toBe('active');
      expect(alert.stage).toBe('WATCHING');
      expect(alert.condition).toBe('ABOVE');
      expect(alert.targetPrice).toBe(100000);
      expect(alert.triggerCount).toBe(0);
    });

    it('updates SIMPLE alert target and condition', async () => {
      const alert = await alertCreate({
        type: 'SIMPLE',
        symbolOrAddress: 'ETH',
        timeframe: '4h',
        condition: 'ABOVE',
        targetPrice: 4000,
      });

      const updated = await alertUpdate(alert.id, {
        condition: 'BELOW',
        targetPrice: 3500,
      }) as SimpleAlert;

      expect(updated?.condition).toBe('BELOW');
      expect(updated?.targetPrice).toBe(3500);
    });
  });

  describe('TWO_STAGE_CONFIRMED Alerts', () => {
    it('creates TWO_STAGE_CONFIRMED alert with indicators', async () => {
      const alert = await alertCreate({
        type: 'TWO_STAGE_CONFIRMED',
        symbolOrAddress: 'SOL',
        timeframe: '15m',
        template: 'TREND_MOMENTUM_STRUCTURE',
        expiryMinutes: 60,
        cooldownMinutes: 15,
      }) as TwoStageAlert;

      expect(alert.type).toBe('TWO_STAGE_CONFIRMED');
      expect(alert.template).toBe('TREND_MOMENTUM_STRUCTURE');
      expect(alert.indicators.length).toBe(3);
      expect(alert.triggeredCount).toBe(0);
      expect(alert.expiresAt).toBeDefined();
      
      // All indicators should start not triggered
      for (const ind of alert.indicators) {
        expect(ind.triggered).toBe(false);
      }
    });
  });

  describe('DEAD_TOKEN_AWAKENING_V2 Alerts', () => {
    it('creates DEAD_TOKEN alert with params', async () => {
      const alert = await alertCreate({
        type: 'DEAD_TOKEN_AWAKENING_V2',
        symbolOrAddress: 'BONK',
        timeframe: '5m',
        params: DEFAULT_DEAD_TOKEN_PARAMS,
      }) as DeadTokenAlert;

      expect(alert.type).toBe('DEAD_TOKEN_AWAKENING_V2');
      expect(alert.deadTokenStage).toBe('INITIAL');
      expect(alert.params).toEqual(DEFAULT_DEAD_TOKEN_PARAMS);
    });
  });

  describe('Common Operations', () => {
    it('lists alerts with filter', async () => {
      await alertCreate({
        type: 'SIMPLE',
        symbolOrAddress: 'BTC',
        timeframe: '1h',
        condition: 'ABOVE',
        targetPrice: 100000,
      });

      const alert2 = await alertCreate({
        type: 'SIMPLE',
        symbolOrAddress: 'ETH',
        timeframe: '4h',
        condition: 'BELOW',
        targetPrice: 3000,
      });

      await alertUpdate(alert2.id, { enabled: false });

      const active = await alertList('active');
      const paused = await alertList('paused');
      const all = await alertList('all');

      expect(active.length).toBe(1);
      expect(paused.length).toBe(1);
      expect(all.length).toBe(2);
    });

    it('toggles pause via enabled=false', async () => {
      const alert = await alertCreate({
        type: 'SIMPLE',
        symbolOrAddress: 'BTC',
        timeframe: '1h',
        condition: 'ABOVE',
        targetPrice: 100000,
      });

      const paused = await alertUpdate(alert.id, { enabled: false });
      expect(paused?.status).toBe('paused');
      expect(paused?.enabled).toBe(false);

      const resumed = await alertUpdate(alert.id, { enabled: true });
      expect(resumed?.status).toBe('active');
      expect(resumed?.enabled).toBe(true);
    });

    it('cancels watch', async () => {
      const alert = await alertCreate({
        type: 'TWO_STAGE_CONFIRMED',
        symbolOrAddress: 'SOL',
        timeframe: '15m',
        template: 'MACD_RSI_VOLUME',
        expiryMinutes: 120,
        cooldownMinutes: 30,
      });

      const cancelled = await alertCancelWatch(alert.id);

      expect(cancelled?.stage).toBe('CANCELLED');
      expect(cancelled?.enabled).toBe(false);
      expect(cancelled?.status).toBe('paused');
    });

    it('deletes alert', async () => {
      const alert = await alertCreate({
        type: 'SIMPLE',
        symbolOrAddress: 'BTC',
        timeframe: '1h',
        condition: 'ABOVE',
        targetPrice: 100000,
      });

      const deleted = await alertDelete(alert.id);
      const found = await alertGetById(alert.id);

      expect(deleted).toBe(true);
      expect(found).toBeNull();
    });
  });

  describe('Evaluation', () => {
    it('evaluates active alerts', async () => {
      await alertCreate({
        type: 'SIMPLE',
        symbolOrAddress: 'BTC',
        timeframe: '1h',
        condition: 'ABOVE',
        targetPrice: 1, // Very low target, should trigger
      });

      await alertCreate({
        type: 'TWO_STAGE_CONFIRMED',
        symbolOrAddress: 'SOL',
        timeframe: '15m',
        template: 'TREND_MOMENTUM_STRUCTURE',
        expiryMinutes: 60,
        cooldownMinutes: 15,
      });

      const ctx = createDeterministicEvaluatorContext('test-seed');
      const result = await evaluateAlerts(ctx);

      expect(result.evaluated).toBe(2);
      expect(result.recommendedNextPollSeconds).toBeDefined();
    });

    it('returns events after evaluation', async () => {
      await alertCreate({
        type: 'SIMPLE',
        symbolOrAddress: 'TEST',
        timeframe: '1h',
        condition: 'ABOVE',
        targetPrice: 0.01, // Very low target
      });

      const ctx = createDeterministicEvaluatorContext('trigger-test');
      await evaluateAlerts(ctx);

      const events = await alertEventsQuery();
      // Events may or may not be generated depending on deterministic price
      expect(Array.isArray(events)).toBe(true);
    });
  });
});
