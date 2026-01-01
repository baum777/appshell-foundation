/**
 * GET /api/alerts - List alerts
 * POST /api/alerts - Create alert
 */

import { createHandler, getQueryParams } from '../_lib/handler';
import { sendJson, sendCreated, setCacheHeaders } from '../_lib/response';
import { validateBody, validateQuery, alertsListQuerySchema, createAlertRequestSchema } from '../_lib/validation';
import { alertList, alertCreate } from '../_lib/domain/alerts/repo';
import { checkRateLimit } from '../_lib/rate-limit';
import type { Alert } from '../_lib/types';

interface AlertsListResponse {
  items: Alert[];
}

export default createHandler({
  GET: async ({ req, res, userId }) => {
    await checkRateLimit('alerts', userId);
    
    const query = validateQuery(alertsListQuerySchema, getQueryParams(req));
    
    const alerts = await alertList(query.filter, query.symbolOrAddress);
    
    setCacheHeaders(res, { noStore: true });
    
    const response: AlertsListResponse = {
      items: alerts,
    };
    
    sendJson(res, response);
  },
  
  POST: async ({ req, res, userId }) => {
    await checkRateLimit('alerts', userId);
    
    const body = validateBody(createAlertRequestSchema, req.body);
    
    const alert = await alertCreate(body);
    
    setCacheHeaders(res, { noStore: true });
    sendCreated(res, alert);
  },
});
