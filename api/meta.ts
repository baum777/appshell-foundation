/**
 * GET /api/meta
 * API metadata endpoint
 */

import { createHandler } from './_lib/handler';
import { sendJson } from './_lib/response';
import { getEnv } from './_lib/env';

interface MetaResponse {
  apiBasePath: '/api';
  environment: 'development' | 'test' | 'production';
  features: {
    watchlistSync: boolean;
    serviceWorkerJobs: boolean;
  };
}

export default createHandler({
  auth: 'none',
  GET: async ({ res }) => {
    const env = getEnv();
    
    const response: MetaResponse = {
      apiBasePath: '/api',
      environment: env.NODE_ENV,
      features: {
        watchlistSync: false, // BACKEND_TODO: future feature
        serviceWorkerJobs: true,
      },
    };
    
    sendJson(res, response);
  },
});
