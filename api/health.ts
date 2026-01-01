/**
 * GET /api/health
 * Health check endpoint
 */

import { createHandler } from './_lib/handler';
import { sendJson, setCacheHeaders } from './_lib/response';
import { getStoreType } from './_lib/kv';

interface HealthResponse {
  ok: true;
  now: string;
  version: string;
  kvStore: 'vercel' | 'memory';
}

export default createHandler({
  GET: async ({ res }) => {
    setCacheHeaders(res, { noStore: true });
    
    const response: HealthResponse = {
      ok: true,
      now: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      kvStore: getStoreType(),
    };
    
    sendJson(res, response);
  },
});
