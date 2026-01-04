import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../http/router.js';
import { sendJson, sendCreated, sendNoContent, setCacheHeaders } from '../http/response.js';
import { notFound, conflict, ErrorCodes } from '../http/error.js';
import { validateBody, validateQuery } from '../validation/validate.js';
import {
  journalCreateRequestSchema,
  journalConfirmPayloadSchema,
  journalArchiveRequestSchema,
  journalListQuerySchema,
} from '../validation/schemas.js';
import { journalService } from '../domain/journal/service.js';
import type { JournalEvent } from '../domain/journal/types.js';

/**
 * Journal Routes
 * Per API_SPEC.md section 1
 */

// Helper to map Internal Domain Status (UPPERCASE) to API Contract Status (lowercase)
function toApiEvent(event: JournalEvent) {
  return {
    ...event,
    status: event.status.toLowerCase(),
  };
}

export async function handleJournalList(req: ParsedRequest, res: ServerResponse): Promise<void> {
  const query = validateQuery(journalListQuerySchema, req.query);
  
  // Support both 'view' and 'status' query params
  const status = query.view || query.status;
  
  // userId is now REQUIRED for all journal operations (multitenancy)
  const result = await journalService.listEntries(req.userId, status, query.limit, query.cursor);
  
  setCacheHeaders(res, { noStore: true });
  
  const response = {
    items: result.items.map(toApiEvent),
    nextCursor: result.nextCursor,
  };
  
  sendJson(res, response);
}

export async function handleJournalGetById(req: ParsedRequest, res: ServerResponse): Promise<void> {
  const { id } = req.params;
  
  // userId is now REQUIRED for all journal operations (multitenancy)
  const entry = await journalService.getEntry(req.userId, id);
  
  if (!entry) {
    throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
  }
  
  setCacheHeaders(res, { noStore: true });
  sendJson(res, toApiEvent(entry));
}

export async function handleJournalCreate(req: ParsedRequest, res: ServerResponse): Promise<void> {
  const body = validateBody(journalCreateRequestSchema, req.body);
  
  // Check for idempotency key
  const idempotencyKey = req.query['idempotency-key'] as string | undefined;
  
  // userId is now REQUIRED for all journal operations (multitenancy)
  const entry = await journalService.createEntry(req.userId, body, idempotencyKey);
  
  setCacheHeaders(res, { noStore: true });
  sendCreated(res, toApiEvent(entry));
}

export async function handleJournalConfirm(req: ParsedRequest, res: ServerResponse): Promise<void> {
  const { id } = req.params;
  const payload = validateBody(journalConfirmPayloadSchema, req.body);
  
  // userId is now REQUIRED for all journal operations (multitenancy)
  // First check if entry exists
  const existing = await journalService.getEntry(req.userId, id);
  if (!existing) {
    throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
  }
  
  // Check for invalid state (can't confirm archived)
  if (existing.status === 'ARCHIVED') {
    throw conflict(
      'Cannot confirm an archived entry',
      ErrorCodes.JOURNAL_INVALID_STATE
    );
  }
  
  const entry = await journalService.confirmEntry(req.userId, id, payload);
  
  // journalConfirm can return null if entry disappeared or status mismatch (concurrent)
  if (!entry) {
     throw notFound(`Journal entry not found or invalid state`, ErrorCodes.JOURNAL_NOT_FOUND);
  }

  setCacheHeaders(res, { noStore: true });
  sendJson(res, toApiEvent(entry));
}

export async function handleJournalArchive(req: ParsedRequest, res: ServerResponse): Promise<void> {
  const { id } = req.params;
  const body = validateBody(journalArchiveRequestSchema, req.body);
  
  // userId is now REQUIRED for all journal operations (multitenancy)
  const existing = await journalService.getEntry(req.userId, id);
  if (!existing) {
    throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
  }
  
  const entry = await journalService.archiveEntry(req.userId, id, body.reason);
  
  if (!entry) {
      throw notFound(`Journal entry not found`, ErrorCodes.JOURNAL_NOT_FOUND);
  }

  setCacheHeaders(res, { noStore: true });
  sendJson(res, toApiEvent(entry));
}

export async function handleJournalRestore(req: ParsedRequest, res: ServerResponse): Promise<void> {
  const { id } = req.params;
  
  // userId is now REQUIRED for all journal operations (multitenancy)
  const existing = await journalService.getEntry(req.userId, id);
  if (!existing) {
    throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
  }
  
  const entry = await journalService.restoreEntry(req.userId, id);
  
  if (!entry) {
      throw notFound(`Journal entry not found`, ErrorCodes.JOURNAL_NOT_FOUND);
  }

  setCacheHeaders(res, { noStore: true });
  sendJson(res, toApiEvent(entry));
}

export async function handleJournalDelete(req: ParsedRequest, res: ServerResponse): Promise<void> {
  const { id } = req.params;
  
  // userId is now REQUIRED for all journal operations (multitenancy)
  const deleted = await journalService.deleteEntry(req.userId, id);
  
  if (!deleted) {
    throw notFound(`Journal entry not found: ${id}`, ErrorCodes.JOURNAL_NOT_FOUND);
  }
  
  sendNoContent(res);
}
