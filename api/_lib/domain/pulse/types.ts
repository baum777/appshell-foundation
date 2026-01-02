/**
 * Grok Pulse Domain Types
 */

export enum PulseLabel {
  MOON = 'MOON',
  STRONG_BULL = 'STRONG_BULL',
  BULL = 'BULL',
  NEUTRAL = 'NEUTRAL',
  BEAR = 'BEAR',
  STRONG_BEAR = 'STRONG_BEAR',
  RUG = 'RUG',
  UNKNOWN = 'UNKNOWN',
}

export interface PulseSource {
  name: string;
  ts?: number;
  url?: string;
}

export interface PulseSnapshot {
  query: string;
  ts: number; // unix ms
  label: PulseLabel;
  score: number; // -100..100
  confidence: number; // 0..1
  drivers: string[]; // max 5 bullets
  sources: PulseSource[]; // max 10
  meta: {
    model: string;
    latency_ms: number;
    version: string;
    cache: 'hit' | 'miss' | 'stale';
  };
}

export interface PulseEnvelope {
  status: 'success' | 'error';
  data: PulseSnapshot | null;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

// Source Adapter Items
export interface PulseSourceItem {
  text: string;
  ts: number;
  url?: string;
  author?: string;
}

export interface PulseSourceAdapter {
  getItems(query: string): Promise<PulseSourceItem[]>;
}

