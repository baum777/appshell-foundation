import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Request ID middleware and helpers
 * Ensures every request has a unique identifier for tracing
 */

const REQUEST_ID_HEADER = 'x-request-id';

// Store for async context (simple implementation)
let currentRequestId: string | null = null;

export function generateRequestId(): string {
  return randomUUID();
}

export function getRequestId(): string {
  return currentRequestId || 'no-request-context';
}

export function setRequestId(id: string): void {
  currentRequestId = id;
}

export function clearRequestId(): void {
  currentRequestId = null;
}

export function extractOrGenerateRequestId(req: IncomingMessage): string {
  const existing = req.headers[REQUEST_ID_HEADER];
  if (typeof existing === 'string' && existing.length > 0) {
    return existing;
  }
  return generateRequestId();
}

export function setRequestIdHeader(res: ServerResponse, requestId: string): void {
  res.setHeader(REQUEST_ID_HEADER, requestId);
}

export interface RequestContext {
  requestId: string;
  method: string;
  url: string;
  startTime: number;
}

export function createRequestContext(req: IncomingMessage): RequestContext {
  const requestId = extractOrGenerateRequestId(req);
  setRequestId(requestId);
  
  return {
    requestId,
    method: req.method || 'UNKNOWN',
    url: req.url || '/',
    startTime: Date.now(),
  };
}
