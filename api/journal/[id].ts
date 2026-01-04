/**
 * GET /api/journal/:id - Get journal entry by ID
 * DELETE /api/journal/:id - Delete journal entry
 */

import { createHandler } from '../_lib/handler';
import { sendJson, sendNoContent, setCacheHeaders } from '../_lib/response';
import { notFound, ErrorCodes } from '../_lib/errors';
import { journalGetById, journalDelete } from '../_lib/domain/journal/repo';
import { toApiJournalEntryV1 } from '../_lib/domain/journal/mapper';
import { checkRateLimit } from '../_lib/rate-limit';

export default createHandler({
  GET: async ({ req, res, userId }) => {
    await checkRateLimit('journal', userId);
    
    const id = req.query.id as string;
    
    // userId is now REQUIRED for all journal operations (multitenancy)
    const entry = await journalGetById(userId, id);
    
    if (!entry) {
      throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
    }
    
    setCacheHeaders(res, { noStore: true });
    sendJson(res, toApiJournalEntryV1(entry));
  },
  
  DELETE: async ({ req, res, userId }) => {
    await checkRateLimit('journal', userId);
    
    const id = req.query.id as string;
    
    // userId is now REQUIRED for all journal operations (multitenancy)
    const deleted = await journalDelete(userId, id);
    
    if (!deleted) {
      throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
    }
    
    sendNoContent(res);
  },
});
