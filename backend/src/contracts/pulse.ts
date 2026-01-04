export interface PulseSnapshot {
  assetId: string;
  updatedAt: string; // ISO-8601
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentLabel: string;
  cta: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  drivers: Array<{
    key: string;
    label: string;
    value: string | number;
  }>;
  status: 'ok' | 'stale' | 'degraded' | 'error';
  error?: {
    code: string;
    message: string;
  };
}

