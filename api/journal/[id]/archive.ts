/**
 * POST /api/journal/:id/archive - Archive journal entry
 */

import { createHandler } from '../../_lib/handler';
import { sendJson, setCacheHeaders } from '../../_lib/response';
import { notFound, ErrorCodes } from '../../_lib/errors';
import { validateBody, journalArchiveRequestSchema } from '../../_lib/validation';
import { journalGetById, journalArchive } from '../../_lib/domain/journal/repo';
import { checkRateLimit } from '../../_lib/rate-limit';

export default createHandler({
  POST: async ({ req, res, userId }) => {
    await checkRateLimit('journal', userId);
    
    const id = req.query.id as string;
    const body = validateBody(journalArchiveRequestSchema, req.body);
    
    const existing = await journalGetById(id);
    if (!existing) {
      throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
    }
    
    const entry = await journalArchive(id, body.reason);
    
    if (!entry) {
      throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
    }
    
    setCacheHeaders(res, { noStore: true });
    sendJson(res, entry);
  },
});
