/**
 * Grok Pulse Contracts - Shared types between frontend and backend
 * DO NOT MODIFY without coordinating with backend
 */

// Sentiment labels enum
export enum PulseSentimentLabel {
  MOON = 'MOON',
  STRONG_BULL = 'STRONG_BULL',
  BULL = 'BULL',
  NEUTRAL = 'NEUTRAL',
  BEAR = 'BEAR',
  STRONG_BEAR = 'STRONG_BEAR',
  RUG = 'RUG',
  DEAD = 'DEAD',
  UNKNOWN = 'UNKNOWN',
}

// CTA action enum
export enum PulseCTA {
  BUY = 'BUY',
  HOLD = 'HOLD',
  SELL = 'SELL',
  AVOID = 'AVOID',
  WATCH = 'WATCH',
  RESEARCH = 'RESEARCH',
}

// Main snapshot interface from backend
export interface GrokSentimentSnapshot {
  score: number; // -100..100
  label: PulseSentimentLabel;
  sentiment_term: string;
  confidence: number; // 0..1
  delta?: number; // Optional score change
  cta: PulseCTA;
  cta_phrase: string;
  one_liner: string;
  top_snippet: string;
  ts: number; // Unix timestamp ms
  source: 'grok' | 'keyword_fallback';
  low_confidence?: boolean;
  reason?: string;
}

// History point for sparkline
export interface PulseHistoryPoint {
  ts: number;
  score: number;
}

// Last run metadata
export interface PulseMetaLastRun {
  ts: number;
  success: boolean;
  tokensProcessed: number;
  duration_ms?: number;
}

// API Response wrappers
export interface GrokSnapshotResponse {
  snapshot: GrokSentimentSnapshot | null;
}

export interface GrokHistoryResponse {
  history: PulseHistoryPoint[];
}

export interface GrokLastRunResponse {
  lastRun: PulseMetaLastRun | null;
}

// API Error shape
export interface GrokPulseApiError {
  code: string;
  message: string;
  details?: unknown;
}
