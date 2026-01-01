/**
 * TA (Technical Analysis) Domain Types
 * Matches CONTRACTS.md TAReport schema
 */

export type TrendDirection = 'Bullish' | 'Bearish' | 'Range';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export interface SupportResistanceLevel {
  label: string;
  level: number;
  note?: string;
}

export interface TPLevel {
  label: string;
  level: number;
  rationale: string;
}

export interface StopLoss {
  soft: { level: number; rule: string };
  hard: { level: number; rule: string };
}

export interface TAAssumptions {
  market: string;
  timeframe: string;
  replay: boolean;
  dataSource: string;
  timestamp: string;
}

export interface TATrend {
  direction: TrendDirection;
  confidence: ConfidenceLevel;
  summary: string;
}

export interface TAReport {
  assumptions: TAAssumptions;
  trend: TATrend;
  support: SupportResistanceLevel[];
  resistance: SupportResistanceLevel[];
  takeProfitLevels: TPLevel[];
  stopLoss: StopLoss;
  reversalCriteria: string[];
}

export interface TARequest {
  market: string;
  timeframe: string;
  replay: boolean;
}
