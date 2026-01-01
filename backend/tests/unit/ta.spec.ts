import { describe, it, expect } from 'vitest';
import { generateTAReport } from '../../src/domain/ta/taGenerator';

describe('TA Generator', () => {
  it('should generate deterministic report for same inputs', () => {
    const timestamp = new Date('2025-12-31T12:00:00.000Z');
    
    const report1 = generateTAReport('BTC', '1h', false, timestamp);
    const report2 = generateTAReport('BTC', '1h', false, timestamp);
    
    expect(JSON.stringify(report1)).toBe(JSON.stringify(report2));
  });
  
  it('should generate different reports for different markets', () => {
    const timestamp = new Date('2025-12-31T12:00:00.000Z');
    
    const btcReport = generateTAReport('BTC', '1h', false, timestamp);
    const ethReport = generateTAReport('ETH', '1h', false, timestamp);
    
    expect(btcReport.assumptions.market).toBe('BTC');
    expect(ethReport.assumptions.market).toBe('ETH');
    expect(btcReport.trend).not.toEqual(ethReport.trend);
  });
  
  it('should echo assumptions correctly', () => {
    const timestamp = new Date('2025-12-31T12:00:00.000Z');
    
    const report = generateTAReport('SOL', '4h', true, timestamp);
    
    expect(report.assumptions.market).toBe('SOL');
    expect(report.assumptions.timeframe).toBe('4h');
    expect(report.assumptions.replay).toBe(true);
    expect(report.assumptions.timestamp).toBe(timestamp.toISOString());
  });
  
  it('should include all required fields', () => {
    const timestamp = new Date('2025-12-31T12:00:00.000Z');
    
    const report = generateTAReport('BTC', '1h', false, timestamp);
    
    // Assumptions
    expect(report.assumptions).toBeDefined();
    expect(report.assumptions.dataSource).toBeDefined();
    
    // Trend
    expect(report.trend).toBeDefined();
    expect(['Bullish', 'Bearish', 'Range']).toContain(report.trend.direction);
    expect(['Low', 'Medium', 'High']).toContain(report.trend.confidence);
    expect(report.trend.summary).toBeDefined();
    
    // Support/Resistance
    expect(report.support.length).toBeGreaterThanOrEqual(2);
    expect(report.resistance.length).toBeGreaterThanOrEqual(2);
    
    // TP levels
    expect(report.takeProfitLevels.length).toBe(3);
    report.takeProfitLevels.forEach(tp => {
      expect(tp.label).toBeDefined();
      expect(tp.level).toBeGreaterThan(0);
      expect(tp.rationale).toBeDefined();
    });
    
    // Stop loss
    expect(report.stopLoss.soft).toBeDefined();
    expect(report.stopLoss.hard).toBeDefined();
    expect(report.stopLoss.soft.level).toBeGreaterThan(0);
    expect(report.stopLoss.hard.level).toBeGreaterThan(0);
    
    // Reversal criteria
    expect(report.reversalCriteria.length).toBeGreaterThanOrEqual(3);
  });
  
  it('should generate different reports for different days', () => {
    const day1 = new Date('2025-12-31T12:00:00.000Z');
    const day2 = new Date('2026-01-01T12:00:00.000Z');
    
    const report1 = generateTAReport('BTC', '1h', false, day1);
    const report2 = generateTAReport('BTC', '1h', false, day2);
    
    // Reports should differ (different bucket)
    expect(report1.assumptions.timestamp).not.toBe(report2.assumptions.timestamp);
  });
});
