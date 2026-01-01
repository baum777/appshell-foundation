/**
 * POST /api/alerts/evaluate - Evaluate alerts against current market data
 * 
 * This is the core evaluation endpoint called by SW
 * Returns updated alert states and emit events
 */

import { createHandler } from '../_lib/handler';
import { sendJson, setCacheHeaders } from '../_lib/response';
import { validateBody, alertEvaluateRequestSchema } from '../_lib/validation';
import { 
  evaluateAlerts, 
  evaluateAlertsByIds,
  createDeterministicEvaluatorContext 
} from '../_lib/domain/alerts/evaluator';
import { checkRateLimit } from '../_lib/rate-limit';
import type { AlertEmitted } from '../_lib/types';

interface EvaluateResponse {
  evaluated: number;
  events: AlertEmitted[];
  recommendedNextPollSeconds?: number;
}

export default createHandler({
  POST: async ({ req, res, userId }) => {
    await checkRateLimit('evaluate', userId);
    
    const body = validateBody(alertEvaluateRequestSchema, req.body);
    
    // Create evaluation context
    // Uses deterministic stub providers when external APIs unavailable
    const ctx = createDeterministicEvaluatorContext();
    
    let result;
    
    if (body.alertIds && body.alertIds.length > 0) {
      // Evaluate specific alerts
      result = await evaluateAlertsByIds(body.alertIds, ctx);
    } else {
      // Evaluate all active alerts
      result = await evaluateAlerts(ctx);
    }
    
    setCacheHeaders(res, { noStore: true });
    
    const response: EvaluateResponse = {
      evaluated: result.evaluated,
      events: result.events,
      recommendedNextPollSeconds: result.recommendedNextPollSeconds,
    };
    
    sendJson(res, response);
  },
});
