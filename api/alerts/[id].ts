/**
 * GET /api/alerts/:id - Get alert by ID
 * PATCH /api/alerts/:id - Update alert
 * DELETE /api/alerts/:id - Delete alert
 */

import { createHandler } from '../_lib/handler';
import { sendJson, sendNoContent, setCacheHeaders } from '../_lib/response';
import { notFound, ErrorCodes } from '../_lib/errors';
import { validateBody, updateAlertRequestSchema } from '../_lib/validation';
import { alertGetById, alertUpdate, alertDelete } from '../_lib/domain/alerts/repo';
import { checkRateLimit } from '../_lib/rate-limit';

export default createHandler({
  GET: async ({ req, res, userId }) => {
    await checkRateLimit('alerts', userId);
    
    const id = req.query.id as string;
    
    const alert = await alertGetById(id);
    
    if (!alert) {
      throw notFound(`Alert not found: ${id}`, ErrorCodes.ALERT_NOT_FOUND);
    }
    
    setCacheHeaders(res, { noStore: true });
    sendJson(res, alert);
  },
  
  PATCH: async ({ req, res, userId }) => {
    await checkRateLimit('alerts', userId);
    
    const id = req.query.id as string;
    const updates = validateBody(updateAlertRequestSchema, req.body);
    
    const alert = await alertUpdate(id, updates);
    
    if (!alert) {
      throw notFound(`Alert not found: ${id}`, ErrorCodes.ALERT_NOT_FOUND);
    }
    
    setCacheHeaders(res, { noStore: true });
    sendJson(res, alert);
  },
  
  DELETE: async ({ req, res, userId }) => {
    await checkRateLimit('alerts', userId);
    
    const id = req.query.id as string;
    
    const deleted = await alertDelete(id);
    
    if (!deleted) {
      throw notFound(`Alert not found: ${id}`, ErrorCodes.ALERT_NOT_FOUND);
    }
    
    sendNoContent(res);
  },
});
