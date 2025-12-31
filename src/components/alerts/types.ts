// Alert System Types - Local to Alerts module
// No global contracts - all types stay here

// ─────────────────────────────────────────────────────────────
// ENUMS & CONSTANTS
// ─────────────────────────────────────────────────────────────

export type AlertType = 'SIMPLE' | 'TWO_STAGE_CONFIRMED' | 'DEAD_TOKEN_AWAKENING_V2';

export type AlertStage = 
  | 'INITIAL' 
  | 'WATCHING' 
  | 'CONFIRMED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export type DeadTokenStage = 
  | 'INITIAL'
  | 'AWAKENING' 
  | 'SUSTAINED' 
  | 'SECOND_SURGE'
  | 'SESSION_ENDED';

export type SimpleCondition = 'ABOVE' | 'BELOW' | 'CROSS';

export type TwoStageTemplate = 
  | 'TREND_MOMENTUM_STRUCTURE'
  | 'MACD_RSI_VOLUME'
  | 'BREAKOUT_RETEST_VOLUME';

export type AlertStatus = 'active' | 'paused' | 'triggered';

// ─────────────────────────────────────────────────────────────
// INDICATOR TYPES (for Two-Stage Confirmed)
// ─────────────────────────────────────────────────────────────

export interface IndicatorState {
  id: string;
  label: string;
  category: 'Trend' | 'Momentum' | 'Structure' | 'Volume';
  params: string;
  triggered: boolean;
  lastValue?: string;
}

export const TEMPLATE_INDICATORS: Record<TwoStageTemplate, IndicatorState[]> = {
  TREND_MOMENTUM_STRUCTURE: [
    { id: 'ema_cross', label: 'EMA 9/21 Cross', category: 'Trend', params: 'EMA(9) > EMA(21)', triggered: false },
    { id: 'rsi_momentum', label: 'RSI Momentum', category: 'Momentum', params: 'RSI(14) > 50', triggered: false },
    { id: 'structure_hh', label: 'Higher High', category: 'Structure', params: 'New swing high', triggered: false },
  ],
  MACD_RSI_VOLUME: [
    { id: 'macd_signal', label: 'MACD Signal', category: 'Trend', params: 'MACD > Signal', triggered: false },
    { id: 'rsi_threshold', label: 'RSI Above 55', category: 'Momentum', params: 'RSI(14) > 55', triggered: false },
    { id: 'volume_spike', label: 'Volume Spike', category: 'Volume', params: 'Vol > 1.5x avg', triggered: false },
  ],
  BREAKOUT_RETEST_VOLUME: [
    { id: 'breakout', label: 'Resistance Break', category: 'Structure', params: 'Close > R1', triggered: false },
    { id: 'retest', label: 'Successful Retest', category: 'Structure', params: 'Retest support', triggered: false },
    { id: 'breakout_vol', label: 'Breakout Volume', category: 'Volume', params: 'Vol > 2x avg', triggered: false },
  ],
};

// ─────────────────────────────────────────────────────────────
// DEAD TOKEN PRESET PARAMS
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// ALERT DATA STRUCTURES
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// FILTER TYPE
// ─────────────────────────────────────────────────────────────

export type AlertStatusFilter = 'all' | 'active' | 'paused' | 'triggered';

// ─────────────────────────────────────────────────────────────
// PREFILL DATA
// ─────────────────────────────────────────────────────────────

export interface PrefillData {
  symbol?: string;
  timeframe?: string;
  condition?: string;
  target?: number;
  type?: 'simple' | 'twoStage' | 'deadToken';
  template?: 'trendMomentumStructure' | 'macdRsiVolume' | 'breakoutRetestVolume';
  windowCandles?: number;
  expiryMinutes?: number;
  cooldownMinutes?: number;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;
export type Timeframe = typeof TIMEFRAMES[number];

export const SIMPLE_CONDITIONS: { value: SimpleCondition; label: string }[] = [
  { value: 'ABOVE', label: 'Above' },
  { value: 'BELOW', label: 'Below' },
  { value: 'CROSS', label: 'Cross' },
];

export const TWO_STAGE_TEMPLATES: { value: TwoStageTemplate; label: string; description: string }[] = [
  { value: 'TREND_MOMENTUM_STRUCTURE', label: 'Trend + Momentum + Structure', description: 'EMA cross, RSI momentum, higher high' },
  { value: 'MACD_RSI_VOLUME', label: 'MACD + RSI + Volume', description: 'MACD signal, RSI threshold, volume spike' },
  { value: 'BREAKOUT_RETEST_VOLUME', label: 'Breakout + Retest + Volume', description: 'Resistance break, retest, volume confirm' },
];
