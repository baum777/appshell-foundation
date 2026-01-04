import type { IncomingMessage, ServerResponse } from 'http';
import { sendJson, sendError } from '../http/response.js';
import { getEnv } from '../config/env.js';
import { getPulseSnapshot, getPulseHistory, getLastRun } from '../domain/grokPulse/kv.js';
import { runGrokPulseEngine } from '../domain/grokPulse/engine.js';
import { logger } from '../observability/logger.js';

export async function handleGrokPulseSnapshot(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // Extract address from URL: /api/grok-pulse/snapshot/:address
  const parts = req.url?.split('/') || [];
  const address = parts[parts.length - 1];

  if (!address || address === 'snapshot') {
    sendError(res, 400, 'BAD_REQUEST', 'Missing token address');
    return;
  }

  const snapshot = await getPulseSnapshot(address);
  
  if (!snapshot) {
    sendError(res, 404, 'NOT_FOUND', 'No pulse data found for this token');
    return;
  }

  sendJson(res, { snapshot });
}

export async function handleGrokPulseHistory(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const parts = req.url?.split('/') || [];
  const address = parts[parts.length - 1];

  if (!address || address === 'history') {
    sendError(res, 400, 'BAD_REQUEST', 'Missing token address');
    return;
  }

  const history = await getPulseHistory(address);
  sendJson(res, { history });
}

export async function handleGrokPulseMeta(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const lastRun = await getLastRun();
  sendJson(res, { lastRun });
}

export async function handleGrokPulseRun(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const env = getEnv();
  const secret = req.headers['x-cron-secret'];

  if (!env.GROK_PULSE_CRON_SECRET || secret !== env.GROK_PULSE_CRON_SECRET) {
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid or missing cron secret');
    return;
  }

  try {
    const result = await runGrokPulseEngine();
    sendJson(res, { 
      ok: true, 
      meta: {
        processed: result.processed,
        quotaUsed: result.quota,
        ts: Date.now()
      } 
    });
  } catch (error) {
    logger.error('Manual Grok Pulse run failed', { error: String(error) });
    sendError(res, 500, 'INTERNAL_ERROR', 'Pulse engine run failed');
  }
}




