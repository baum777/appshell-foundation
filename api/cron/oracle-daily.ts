/**
 * GET /api/cron/oracle-daily - Vercel Cron endpoint for daily oracle refresh
 * 
 * Scheduled via vercel.json: "0 6 * * *" (6 AM UTC daily)
 * 
 * Must be:
 * - Stateless per run
 * - Idempotent (safe to call multiple times)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { oracleRefreshDaily } from '../_lib/domain/oracle/repo';
import { logger } from '../_lib/logger';
import { sendJson } from '../_lib/response';
import { setCurrentRequestId, generateRequestId, clearRequestId } from '../_lib/request-id';

interface CronResponse {
  ok: boolean;
  date: string;
  generated: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = generateRequestId();
  setCurrentRequestId(requestId);
  
  try {
    // Verify cron authorization (Vercel sets this header)
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET;
    
    // In production, verify the cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron request');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    logger.info('Oracle daily cron started');
    
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
    res.status(500).json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  } finally {
    clearRequestId();
  }
}
