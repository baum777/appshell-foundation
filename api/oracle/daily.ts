/**
 * GET /api/oracle/daily - Get daily oracle feed
 */

import { createHandler, getQueryParams } from '../_lib/handler';
import { sendJson, setCacheHeaders } from '../_lib/response';
import { validateQuery, oracleDailyQuerySchema } from '../_lib/validation';
import { oracleGetDaily } from '../_lib/domain/oracle/repo';
import { checkRateLimit } from '../_lib/rate-limit';

export default createHandler({
  GET: async ({ req, res, userId }) => {
    await checkRateLimit('oracle', userId);
    
    const query = validateQuery(oracleDailyQuerySchema, getQueryParams(req));
    
    // Parse date or use today
    let date: Date;
    if (query.date) {
      date = new Date(query.date + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    } else {
      date = new Date();
    }
    
    const feed = await oracleGetDaily(date, userId);
    
    // Cache headers per API_SPEC.md
    // User-specific read states mean we use private caching
    setCacheHeaders(res, { public: false, maxAge: 60 });
    
    sendJson(res, feed);
  },
});
