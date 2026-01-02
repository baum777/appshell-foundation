/**
 * POST /api/journal/:id/restore - Restore journal entry to pending
 */

import { createHandler } from '../../_lib/handler';
import { sendJson, setCacheHeaders } from '../../_lib/response';
import { notFound, ErrorCodes } from '../../_lib/errors';
import { journalGetById, journalRestore } from '../../_lib/domain/journal/repo';
import { checkRateLimit } from '../../_lib/rate-limit';

export default createHandler({
  POST: async ({ req, res, userId }) => {
    await checkRateLimit('journal', userId);
    
    const id = req.query.id as string;
    
    // userId is now REQUIRED for all journal operations (multitenancy)
    const existing = await journalGetById(userId, id);
    if (!existing) {
      throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
    }
    
    const entry = await journalRestore(userId, id);
    
    if (!entry) {
      throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
    }
    
    setCacheHeaders(res, { noStore: true });
    sendJson(res, entry);
  },
});
