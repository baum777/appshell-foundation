import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../http/router.js';
import { sendJson, setCacheHeaders } from '../http/response.js';
import { getConfig } from '../config/config.js';

/**
 * Health & Meta Routes
 * Per API_SPEC.md sections 0
 */

export interface HealthResponse {
  ok: true;
  now: string;
  version: string;
}

export interface MetaResponse {
  apiBasePath: '/api';
  environment: 'development' | 'test' | 'production';
  features: {
    watchlistSync: boolean;
    serviceWorkerJobs: boolean;
  };
}

export function handleHealth(_req: ParsedRequest, res: ServerResponse): void {
  const config = getConfig();
  
  setCacheHeaders(res, { noStore: true });
  
  const response: HealthResponse = {
    ok: true,
    now: new Date().toISOString(),
    version: config.version,
  };
  
  sendJson(res, response);
}

export function handleMeta(_req: ParsedRequest, res: ServerResponse): void {
  const config = getConfig();
  
  const response: MetaResponse = {
    apiBasePath: '/api',
    environment: config.env.NODE_ENV,
    features: {
      watchlistSync: false, // BACKEND_TODO: Implement watchlist sync
      serviceWorkerJobs: true,
    },
  };
  
  sendJson(res, response);
}
