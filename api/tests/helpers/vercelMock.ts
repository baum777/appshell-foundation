import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vi } from 'vitest';

export function createMockRequest(overrides: Partial<VercelRequest> = {}): VercelRequest {
  return {
    headers: {},
    query: {},
    cookies: {},
    body: {},
    method: 'GET',
    url: '/',
    ...overrides,
  } as unknown as VercelRequest;
}

export function createMockResponse(): VercelResponse {
  const res = {
    statusCode: 200,
    setHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  } as unknown as VercelResponse;
  
  return res;
}

