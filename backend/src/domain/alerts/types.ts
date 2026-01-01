/**
 * Alert Domain Types
 * Matches CONTRACTS.md Alert schemas
 */

export type AlertType = 'SIMPLE' | 'TWO_STAGE_CONFIRMED' | 'DEAD_TOKEN_AWAKENING_V2';
export type AlertStage = 'INITIAL' | 'WATCHING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
export type AlertStatus = 'active' | 'paused' | 'triggered';
export type SimpleCondition = 'ABOVE' | 'BELOW' | 'CROSS';
export type TwoStageTemplate =
  | 'TREND_MOMENTUM_STRUCTURE'
  | 'MACD_RSI_VOLUME'
  | 'BREAKOUT_RETEST_VOLUME';
export type DeadTokenStage =
  | 'INITIAL'
  | 'AWAKENING'
  | 'SUSTAINED'
  | 'SECOND_SURGE'
  | 'SESSION_ENDED';

export interface IndicatorState {
  id: string;
  label: string;
  category: 'Trend' | 'Momentum' | 'Structure' | 'Volume';
  params: string;
  triggered: boolean;
  lastValue?: string;
}

export interface DeadTokenParams {
  DEAD_VOL: number;
  DEAD_TRADES: number;
  DEAD_HOLDER_DELTA_6H: number;
  AWAKE_VOL_MULT: number;
  AWAKE_TRADES_MULT: number;
  AWAKE_HOLDER_DELTA_30M: number;
  STAGE2_WINDOW_MIN: number;
  COOLDOWN_MIN: number;
  STAGE3_WINDOW_H: number;
  STAGE3_VOL_MULT: number;
  STAGE3_TRADES_MULT: number;
  STAGE3_HOLDER_DELTA: number;
}

export interface BaseAlert {
  id: string;
  type: AlertType;
  symbolOrAddress: string;
  timeframe: string;
  enabled: boolean;
  status: AlertStatus;
  stage: AlertStage;
  createdAt: string;
  note?: string;
}

export interface SimpleAlert extends BaseAlert {
  type: 'SIMPLE';
  condition: SimpleCondition;
  targetPrice: number;
  triggeredAt?: string;
}

export interface TwoStageAlert extends BaseAlert {
  type: 'TWO_STAGE_CONFIRMED';
  template: TwoStageTemplate;
  windowCandles?: number;
  windowMinutes?: number;
  expiryMinutes: number;
  cooldownMinutes: number;
  indicators: IndicatorState[];
  triggeredCount: number;
  lastTriggeredAt?: string;
  expiresAt?: string;
}

export interface DeadTokenAlert extends BaseAlert {
  type: 'DEAD_TOKEN_AWAKENING_V2';
  params: DeadTokenParams;
  deadTokenStage: DeadTokenStage;
  sessionStart?: string;
  sessionEndsAt?: string;
  windowEndsAt?: string;
  cooldownEndsAt?: string;
}

export type Alert = SimpleAlert | TwoStageAlert | DeadTokenAlert;

// Alert Events
export type AlertEmittedType =
  | 'SIMPLE_TRIGGERED'
  | 'TWO_STAGE_PROGRESS'
  | 'TWO_STAGE_CONFIRMED'
  | 'TWO_STAGE_EXPIRED'
  | 'DEAD_TOKEN_STAGE'
  | 'DEAD_TOKEN_SESSION_ENDED';

export interface SimpleEventDetail {
  kind: 'simple';
  condition: SimpleCondition;
  targetPrice: number;
  lastPrice: number;
}

export interface TwoStageEventDetail {
  kind: 'twoStage';
  template: TwoStageTemplate;
  triggeredCount: number;
  indicators: IndicatorState[];
  windowEndsAt?: string;
  expiresAt?: string;
}

export interface DeadTokenEventDetail {
  kind: 'deadToken';
  deadTokenStage: DeadTokenStage;
  sessionStart?: string;
  sessionEndsAt?: string;
  windowEndsAt?: string;
}

export type AlertEventDetail = SimpleEventDetail | TwoStageEventDetail | DeadTokenEventDetail;

export interface AlertEmitted {
  eventId: string;
  type: AlertEmittedType;
  occurredAt: string;
  alertId: string;
  alertType: AlertType;
  symbolOrAddress: string;
  timeframe: string;
  stage: AlertStage;
  status: AlertStatus;
  detail?: AlertEventDetail;
}

// Database row representation
export interface AlertRow {
  id: string;
  type: string;
  symbol_or_address: string;
  timeframe: string;
  enabled: number;
  status: string;
  stage: string;
  created_at: string;
  note: string | null;
  payload_json: string;
  expires_at: string | null;
  cooldown_ends_at: string | null;
  updated_at: string;
}

// Template indicators configuration
export const TEMPLATE_INDICATORS: Record<TwoStageTemplate, Omit<IndicatorState, 'triggered' | 'lastValue'>[]> = {
  TREND_MOMENTUM_STRUCTURE: [
    { id: 'ema_cross', label: 'EMA 9/21 Cross', category: 'Trend', params: 'EMA(9) > EMA(21)' },
    { id: 'rsi_momentum', label: 'RSI Momentum', category: 'Momentum', params: 'RSI(14) > 50' },
    { id: 'structure_hh', label: 'Higher High', category: 'Structure', params: 'New swing high' },
  ],
  MACD_RSI_VOLUME: [
    { id: 'macd_signal', label: 'MACD Signal', category: 'Trend', params: 'MACD > Signal' },
    { id: 'rsi_threshold', label: 'RSI Above 55', category: 'Momentum', params: 'RSI(14) > 55' },
    { id: 'volume_spike', label: 'Volume Spike', category: 'Volume', params: 'Vol > 1.5x avg' },
  ],
  BREAKOUT_RETEST_VOLUME: [
    { id: 'breakout', label: 'Resistance Break', category: 'Structure', params: 'Close > R1' },
    { id: 'retest', label: 'Successful Retest', category: 'Structure', params: 'Retest support' },
    { id: 'breakout_vol', label: 'Breakout Volume', category: 'Volume', params: 'Vol > 2x avg' },
  ],
};

export const DEFAULT_DEAD_TOKEN_PARAMS: DeadTokenParams = {
  DEAD_VOL: 100,
  DEAD_TRADES: 5,
  DEAD_HOLDER_DELTA_6H: 0,
  AWAKE_VOL_MULT: 3,
  AWAKE_TRADES_MULT: 2,
  AWAKE_HOLDER_DELTA_30M: 5,
  STAGE2_WINDOW_MIN: 30,
  COOLDOWN_MIN: 15,
  STAGE3_WINDOW_H: 6,
  STAGE3_VOL_MULT: 2,
  STAGE3_TRADES_MULT: 1.5,
  STAGE3_HOLDER_DELTA: 10,
};
