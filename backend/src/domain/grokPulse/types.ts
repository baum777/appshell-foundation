/**
 * Grok Pulse Domain Types (Backend)
 */

export type PulseLabel = 
  | 'MOON' 
  | 'STRONG_BULL' 
  | 'BULL' 
  | 'NEUTRAL' 
  | 'BEAR' 
  | 'STRONG_BEAR' 
  | 'RUG' 
  | 'UNKNOWN'
  | 'DEAD'; // Backend specific extension if needed, though usually mapped to strong bear

export interface PulseGlobalToken {
  address: string;
  symbol: string;
  chain: 'solana';
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
  ageMinutes?: number;
  migratedToRaydium?: boolean;
}

export interface PulseSource {
  name: string;
  url?: string;
  ts?: number;
}

export interface GrokSentimentSnapshot {
  score: number; // -100 to 100
  label: PulseLabel;
  confidence: number; // 0 to 1
  cta: string; // "BUY", "SELL", "HOLD", "AVOID" etc (from LLM)
  one_liner: string;
  top_snippet: string;
  ts: number;
  delta?: number;
  low_confidence: boolean;
  source: 'grok' | 'fallback';
  reason?: string;
  validation_hash?: string;
  
  // UI Helpers (Deterministic)
  sentiment_term?: string;
  cta_phrase?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface PulseHistoryEntry {
  ts: number;
  score: number;
  label: PulseLabel;
}

export interface PulseMeta {
  lastRun: number;
  quotaUsed: number;
  quotaLimit: number;
}

