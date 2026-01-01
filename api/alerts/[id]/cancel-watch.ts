/**
 * POST /api/alerts/:id/cancel-watch - Cancel alert watch
 */

import { createHandler } from '../../_lib/handler';
import { sendJson, setCacheHeaders } from '../../_lib/response';
import { notFound, ErrorCodes } from '../../_lib/errors';
import { alertCancelWatch } from '../../_lib/domain/alerts/repo';
import { checkRateLimit } from '../../_lib/rate-limit';

export default createHandler({
  POST: async ({ req, res, userId }) => {
    await checkRateLimit('alerts', userId);
    
    const id = req.query.id as string;
    
    const alert = await alertCancelWatch(id);
    
    if (!alert) {
      throw notFound(`Alert not found: ${id}`, ErrorCodes.ALERT_NOT_FOUND);
    }
    
    setCacheHeaders(res, { noStore: true });
    sendJson(res, alert);
  },
});
