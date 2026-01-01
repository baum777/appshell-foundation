/**
 * GET /api/alerts/events - Get alert events for SW/UI dedupe
 */

import { createHandler, getQueryParams } from '../_lib/handler';
import { sendJson, setCacheHeaders } from '../_lib/response';
import { validateQuery, alertEventsQuerySchema } from '../_lib/validation';
import { alertEventsQuery } from '../_lib/domain/alerts/events-repo';
import { checkRateLimit } from '../_lib/rate-limit';
import type { AlertEmitted } from '../_lib/types';

interface AlertEventsResponse {
  items: AlertEmitted[];
}

export default createHandler({
  GET: async ({ req, res, userId }) => {
    await checkRateLimit('alerts', userId);
    
    const query = validateQuery(alertEventsQuerySchema, getQueryParams(req));
    
    const events = await alertEventsQuery(query.since, query.limit);
    
    setCacheHeaders(res, { noStore: true });
    
    const response: AlertEventsResponse = {
      items: events,
    };
    
    sendJson(res, response);
  },
});
