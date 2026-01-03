export interface OracleSnapshot {
  assetId: string;
  updatedAt: string; // ISO-8601
  price: number;
  confidence: number;
  source: string;
  status: 'ok' | 'stale' | 'degraded' | 'error';
  error?: {
    code: string;
    message: string;
  };
}

