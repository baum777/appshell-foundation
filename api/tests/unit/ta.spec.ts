/**
 * Unit Tests: Deterministic TA Generator
 * Per TEST_PLAN.md section 2.4
 */

import { describe, it, expect } from 'vitest';
import { generateTAReport } from '../../_lib/domain/ta/generator';

describe('Deterministic TA Generator', () => {
  const fixedDate = new Date('2025-12-31T12:00:00.000Z');

  it('produces deterministic output for same inputs', () => {
    const report1 = generateTAReport('BTC', '1h', false, fixedDate);
    const report2 = generateTAReport('BTC', '1h', false, fixedDate);
    
    expect(JSON.stringify(report1)).toBe(JSON.stringify(report2));
  });

  it('produces different output for different markets', () => {
    const btcReport = generateTAReport('BTC', '1h', false, fixedDate);
    const solReport = generateTAReport('SOL', '1h', false, fixedDate);
    
    expect(btcReport.trend.direction).not.toEqual(solReport.trend.direction);
  });

  it('produces different output for different timeframes', () => {
    const hourlyReport = generateTAReport('BTC', '1h', false, fixedDate);
    const dailyReport = generateTAReport('BTC', '1d', false, fixedDate);
    
    // At least one field should differ
    const hourlyJson = JSON.stringify(hourlyReport);
    const dailyJson = JSON.stringify(dailyReport);
    expect(hourlyJson).not.toBe(dailyJson);
  });

  it('includes all required fields in assumptions', () => {
    const report = generateTAReport('ETH', '4h', true, fixedDate);
    
    expect(report.assumptions).toHaveProperty('market', 'ETH');
    expect(report.assumptions).toHaveProperty('timeframe', '4h');
    expect(report.assumptions).toHaveProperty('replay', true);
    expect(report.assumptions).toHaveProperty('dataSource');
    expect(report.assumptions).toHaveProperty('timestamp');
    expect(report.assumptions.dataSource).toContain('Deterministic');
  });

  it('generates valid support levels', () => {
    const report = generateTAReport('BTC', '1h', false, fixedDate);
    
    expect(report.support.length).toBeGreaterThanOrEqual(2);
    expect(report.support.length).toBeLessThanOrEqual(3);
    
    for (const level of report.support) {
      expect(level).toHaveProperty('label');
      expect(level).toHaveProperty('level');
      expect(typeof level.level).toBe('number');
    }
  });

  it('generates valid resistance levels', () => {
    const report = generateTAReport('BTC', '1h', false, fixedDate);
    
    expect(report.resistance.length).toBeGreaterThanOrEqual(2);
    expect(report.resistance.length).toBeLessThanOrEqual(3);
    
    for (const level of report.resistance) {
      expect(level).toHaveProperty('label');
      expect(level).toHaveProperty('level');
      expect(typeof level.level).toBe('number');
    }
  });

  it('generates take profit levels', () => {
    const report = generateTAReport('BTC', '1h', false, fixedDate);
    
    expect(report.takeProfitLevels.length).toBe(3);
    
    for (const tp of report.takeProfitLevels) {
      expect(tp).toHaveProperty('label');
      expect(tp).toHaveProperty('level');
      expect(tp).toHaveProperty('rationale');
    }
  });

  it('generates stop loss levels', () => {
    const report = generateTAReport('BTC', '1h', false, fixedDate);
    
    expect(report.stopLoss).toHaveProperty('soft');
    expect(report.stopLoss).toHaveProperty('hard');
    expect(report.stopLoss.soft).toHaveProperty('level');
    expect(report.stopLoss.soft).toHaveProperty('rule');
    expect(report.stopLoss.hard).toHaveProperty('level');
    expect(report.stopLoss.hard).toHaveProperty('rule');
  });

  it('generates reversal criteria', () => {
    const report = generateTAReport('BTC', '1h', false, fixedDate);
    
    expect(report.reversalCriteria.length).toBeGreaterThanOrEqual(3);
    expect(report.reversalCriteria.length).toBeLessThanOrEqual(4);
    
    for (const criteria of report.reversalCriteria) {
      expect(typeof criteria).toBe('string');
      expect(criteria.length).toBeGreaterThan(0);
    }
  });

  it('generates valid trend information', () => {
    const report = generateTAReport('BTC', '1h', false, fixedDate);
    
    expect(['Bullish', 'Bearish', 'Range']).toContain(report.trend.direction);
    expect(['Low', 'Medium', 'High']).toContain(report.trend.confidence);
    expect(report.trend.summary.length).toBeGreaterThan(0);
  });
});
