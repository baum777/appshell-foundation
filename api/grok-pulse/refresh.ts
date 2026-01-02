import { createHandler } from '../_lib/handler';
import { generatePulse } from '../_lib/domain/pulse/engine';
import { savePulse, acquireRefreshLock } from '../_lib/domain/pulse/repo';
import { getEnv } from '../_lib/env';
import { logger } from '../_lib/logger';

export default createHandler({
  post: async (req, res) => {
    const env = getEnv();
    const secret = req.headers['x-refresh-secret'];
    
    // Auth Check
    if (env.GROK_PULSE_REFRESH_SECRET && secret !== env.GROK_PULSE_REFRESH_SECRET) {
      return res.status(401).json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Invalid secret' } });
    }

    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ status: 'error', error: { code: 'BAD_REQUEST', message: 'Missing query' } });
    }

    try {
      // Force refresh, but respect lock to avoid stampede even on force
      const hasLock = await acquireRefreshLock(query);
      
      const pulse = await generatePulse(query);
      await savePulse(pulse);
      
      return res.status(200).json({ status: 'success', data: pulse });
      
    } catch (error) {
      logger.error('Pulse Force Refresh Error', { error: String(error) });
      return res.status(500).json({ status: 'error', error: { code: 'INTERNAL', message: 'Refresh failed' } });
    }
  }
});

