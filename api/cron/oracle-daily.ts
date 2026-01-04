/**
 * GET /api/cron/oracle-daily - Vercel Cron endpoint for daily oracle refresh
 * 
 * Scheduled via vercel.json: "0 6 * * *" (6 AM UTC daily)
 */

import { createHandler } from '../_lib/handler';
import { oracleRefreshDaily } from '../_lib/domain/oracle/repo';
import { logger } from '../_lib/logger';
import { sendJson } from '../_lib/response';
import { getEnv } from '../_lib/env';
import { unauthorized, internalError } from '../_lib/errors';

interface CronResponse {
  ok: boolean;
  date: string;
  generated: boolean;
}

export default createHandler({
  auth: 'none',
  GET: async ({ req, res }) => {
    // Verify cron authorization (Vercel sets this header)
    const authHeader = req.headers['authorization'];
    const env = getEnv();
    const cronSecret = env.CRON_SECRET;
    
    // In production, verify the cron secret
    // Note: getEnv() enforces CRON_SECRET existence in production
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron request');
      throw unauthorized('Unauthorized cron request');
    }
    
    logger.info('Oracle daily cron started');
    
    try {
      const result = await oracleRefreshDaily();
      
      logger.info('Oracle daily cron completed', {
        date: result.date,
        generated: result.generated,
      });
      
      const response: CronResponse = {
        ok: true,
        date: result.date,
        generated: result.generated,
      };
      
      sendJson(res, response);
    } catch (error) {
      logger.error('Oracle daily cron failed', { error: String(error) });
      throw internalError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
});
