import { badRequest } from '../http/error.js';

export function normalizeAssetId(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    throw badRequest('Invalid asset ID: missing or not a string');
  }

  const trimmed = raw.trim().toLowerCase();

  if (trimmed.length === 0) {
    throw badRequest('Invalid asset ID: empty');
  }

  if (trimmed.length > 128) {
    throw badRequest('Invalid asset ID: too long');
  }

  return trimmed;
}

