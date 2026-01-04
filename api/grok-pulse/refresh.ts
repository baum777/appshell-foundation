import { createHandler } from '../_lib/handler';
import { generatePulse } from '../_lib/domain/pulse/engine';
import { savePulse, acquireRefreshLock } from '../_lib/domain/pulse/repo';
import { getEnv } from '../_lib/env';
import { logger } from '../_lib/logger';
import { sendJson } from '../_lib/response';
import { unauthorized, badRequest, internalError } from '../_lib/errors';

export default createHandler({
  auth: 'none',
  POST: async ({ req, res }) => {
    const env = getEnv();
    const secret = req.headers['x-refresh-secret'];
    
    // Auth Check
    // If env var is set, enforce it.
    if (env.GROK_PULSE_REFRESH_SECRET && secret !== env.GROK_PULSE_REFRESH_SECRET) {
      throw unauthorized('Invalid refresh secret');
    }

    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      throw badRequest('Missing query');
    }

    try {
      // Force refresh, but respect lock to avoid stampede even on force
      await acquireRefreshLock(query);
      
      const pulse = await generatePulse(query);
      await savePulse(pulse);
      
      sendJson(res, pulse);
      
    } catch (error) {
      logger.error('Pulse Force Refresh Error', { error: String(error) });
      throw internalError('Refresh failed');
    }
  }
});
