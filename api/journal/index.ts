/**
 * GET /api/journal - List journal entries
 * POST /api/journal - Create journal entry
 */

import { createHandler, getQueryParams, getIdempotencyKey } from '../_lib/handler';
import { sendJson, sendCreated, setCacheHeaders } from '../_lib/response';
import { validateBody, validateQuery, journalListQuerySchema, journalCreateRequestSchema } from '../_lib/validation';
import { journalList, journalCreate } from '../_lib/domain/journal/repo';
import { checkRateLimit } from '../_lib/rate-limit';

interface JournalListResponse {
  items: Array<{
    id: string;
    side: string;
    status: string;
    timestamp: string;
    summary: string;
  }>;
  nextCursor?: string;
}

export default createHandler({
  GET: async ({ req, res, userId }) => {
    await checkRateLimit('journal', userId);
    
    const query = validateQuery(journalListQuerySchema, getQueryParams(req));
    
    // Support both 'view' and 'status' query params
    const status = query.view || query.status;
    
    const result = await journalList(status, query.limit, query.cursor);
    
    setCacheHeaders(res, { noStore: true });
    
    const response: JournalListResponse = {
      items: result.items,
      nextCursor: result.nextCursor,
    };
    
    sendJson(res, response);
  },
  
  POST: async ({ req, res, userId }) => {
    await checkRateLimit('journal', userId);
    
    const body = validateBody(journalCreateRequestSchema, req.body);
    const idempotencyKey = getIdempotencyKey(req);
    
    const entry = await journalCreate(body, idempotencyKey);
    
    setCacheHeaders(res, { noStore: true });
    sendCreated(res, entry);
  },
});
