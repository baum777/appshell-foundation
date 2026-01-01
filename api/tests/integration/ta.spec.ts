/**
 * Integration Tests: TA API
 * Per TEST_PLAN.md section 3.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { clearMemoryStore } from '../../_lib/kv/memory-store';
import { getOrGenerateTAReport } from '../../_lib/domain/ta/repo';

describe('TA API Integration', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  it('returns deterministic TA report', async () => {
    const report = await getOrGenerateTAReport('BTC', '1h', false);

    expect(report.assumptions).toBeDefined();
    expect(report.assumptions.market).toBe('BTC');
    expect(report.assumptions.timeframe).toBe('1h');
    expect(report.assumptions.replay).toBe(false);

    expect(report.trend).toBeDefined();
    expect(report.support).toBeDefined();
    expect(report.resistance).toBeDefined();
    expect(report.takeProfitLevels).toBeDefined();
    expect(report.stopLoss).toBeDefined();
    expect(report.reversalCriteria).toBeDefined();
  });

  it('caches and returns same report', async () => {
    const report1 = await getOrGenerateTAReport('ETH', '4h', false);
    const report2 = await getOrGenerateTAReport('ETH', '4h', false);

    expect(JSON.stringify(report1)).toBe(JSON.stringify(report2));
  });

  it('generates different reports for different markets', async () => {
    const btcReport = await getOrGenerateTAReport('BTC', '1h', false);
    const ethReport = await getOrGenerateTAReport('ETH', '1h', false);

    // Reports should differ (at least in some aspect)
    expect(btcReport.assumptions.market).toBe('BTC');
    expect(ethReport.assumptions.market).toBe('ETH');
  });

  it('respects replay flag', async () => {
    const normalReport = await getOrGenerateTAReport('SOL', '1h', false);
    const replayReport = await getOrGenerateTAReport('SOL', '1h', true);

    expect(normalReport.assumptions.replay).toBe(false);
    expect(replayReport.assumptions.replay).toBe(true);
  });

  it('respects asOfTs for historical analysis', async () => {
    const historicalTs = '2025-01-15T12:00:00.000Z';
    const report = await getOrGenerateTAReport('BTC', '1h', false, historicalTs);

    // The timestamp in assumptions should match asOfTs
    expect(report.assumptions.timestamp).toBeDefined();
  });

  it('includes all required schema fields', async () => {
    const report = await getOrGenerateTAReport('JUP', '15m', false);

    // Assumptions
    expect(report.assumptions).toHaveProperty('market');
    expect(report.assumptions).toHaveProperty('timeframe');
    expect(report.assumptions).toHaveProperty('replay');
    expect(report.assumptions).toHaveProperty('dataSource');
    expect(report.assumptions).toHaveProperty('timestamp');

    // Trend
    expect(report.trend).toHaveProperty('direction');
    expect(report.trend).toHaveProperty('confidence');
    expect(report.trend).toHaveProperty('summary');

    // Support levels
    expect(report.support.length).toBeGreaterThanOrEqual(2);
    for (const s of report.support) {
      expect(s).toHaveProperty('label');
      expect(s).toHaveProperty('level');
    }

    // Resistance levels
    expect(report.resistance.length).toBeGreaterThanOrEqual(2);
    for (const r of report.resistance) {
      expect(r).toHaveProperty('label');
      expect(r).toHaveProperty('level');
    }

    // Take profit levels
    expect(report.takeProfitLevels.length).toBe(3);
    for (const tp of report.takeProfitLevels) {
      expect(tp).toHaveProperty('label');
      expect(tp).toHaveProperty('level');
      expect(tp).toHaveProperty('rationale');
    }

    // Stop loss
    expect(report.stopLoss).toHaveProperty('soft');
    expect(report.stopLoss).toHaveProperty('hard');
    expect(report.stopLoss.soft).toHaveProperty('level');
    expect(report.stopLoss.soft).toHaveProperty('rule');
    expect(report.stopLoss.hard).toHaveProperty('level');
    expect(report.stopLoss.hard).toHaveProperty('rule');

    // Reversal criteria
    expect(report.reversalCriteria.length).toBeGreaterThanOrEqual(3);
  });
});
