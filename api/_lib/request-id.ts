/**
 * Request ID Generation and Context
 * Per VERCEL_COMPATIBLE_BACKEND.md - all requests must have requestId
 */

import { randomUUID } from 'crypto';
import type { VercelRequest } from '@vercel/node';

let currentRequestId = '';

export function generateRequestId(): string {
  return `req-${randomUUID()}`;
}

export function getRequestIdFromHeader(req: VercelRequest): string {
  const headerValue = req.headers['x-request-id'];
  if (typeof headerValue === 'string' && headerValue.length > 0) {
    return headerValue;
  }
  return generateRequestId();
}

export function setCurrentRequestId(requestId: string): void {
  currentRequestId = requestId;
}

export function getRequestId(): string {
  return currentRequestId || generateRequestId();
}

export function clearRequestId(): void {
  currentRequestId = '';
}
