/**
 * GET /api/journal - List journal entries
 * POST /api/journal - Create journal entry
 */

import { createHandler, getQueryParams, getIdempotencyKey } from '../_lib/handler';
import { sendJson, sendCreated, setCacheHeaders } from '../_lib/response';
import { validateBody, validateQuery, journalListQuerySchema, journalCreateRequestSchema } from '../_lib/validation';
import { journalList, journalCreate } from '../_lib/domain/journal/repo';
import { toApiJournalEntryV1, JournalEntryV1 } from '../_lib/domain/journal/mapper';
import { checkRateLimit } from '../_lib/rate-limit';

interface JournalListResponse {
  items: JournalEntryV1[];
  nextCursor?: string;
}

export default createHandler({
  GET: async ({ req, res, userId }) => {
    await checkRateLimit('journal', userId);
    
    const query = validateQuery(journalListQuerySchema, getQueryParams(req));
    
    // Support both 'view' and 'status' query params
    const status = query.view || query.status;
    
    // userId is now REQUIRED for all journal operations (multitenancy)
    const result = await journalList(userId, status, query.limit, query.cursor);
    
    setCacheHeaders(res, { noStore: true });
    
    const response: JournalListResponse = {
      items: result.items.map(toApiJournalEntryV1),
      nextCursor: result.nextCursor,
    };
    
    sendJson(res, response);
  },
  
  POST: async ({ req, res, userId }) => {
    await checkRateLimit('journal', userId);
    
    const body = validateBody(journalCreateRequestSchema, req.body);
    const idempotencyKey = getIdempotencyKey(req);
    
    // userId is now REQUIRED for all journal operations (multitenancy)
    const entry = await journalCreate(userId, body, idempotencyKey);
    
    setCacheHeaders(res, { noStore: true });
    sendCreated(res, toApiJournalEntryV1(entry));
  },
});
