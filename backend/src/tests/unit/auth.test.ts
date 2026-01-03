import { describe, it, expect, vi } from 'vitest';
import { verifyToken, AuthError } from '../../lib/auth/jwt.js';
import { createHmac } from 'crypto';

// Mock env
vi.mock('../../config/env.js', () => ({
  getEnv: () => ({ JWT_SECRET: 'test-secret' }),
}));

function createToken(payload: any, secret = 'test-secret') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = Buffer.from(JSON.stringify(header)).toString('base64url');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${h}.${p}`;
  const signature = createHmac('sha256', secret).update(signatureInput).digest('base64url');
  return `${h}.${p}.${signature}`;
}

describe('Auth / JWT', () => {
  it('should verify a valid token', () => {
    const token = createToken({ sub: 'user-123', exp: Math.floor(Date.now() / 1000) + 3600 });
    const user = verifyToken(token);
    expect(user.userId).toBe('user-123');
  });

  it('should verify a valid token with userId claim (legacy)', () => {
    const token = createToken({ userId: 'user-123', exp: Math.floor(Date.now() / 1000) + 3600 });
    const user = verifyToken(token);
    expect(user.userId).toBe('user-123');
  });

  it('should reject expired token', () => {
    const token = createToken({ sub: 'user-123', exp: Math.floor(Date.now() / 1000) - 10 });
    expect(() => verifyToken(token)).toThrow(AuthError);
    expect(() => verifyToken(token)).toThrow('Token expired');
  });

  it('should reject invalid signature', () => {
    const token = createToken({ sub: 'user-123' }, 'wrong-secret');
    expect(() => verifyToken(token)).toThrow('Invalid signature');
  });

  it('should reject missing sub/userId', () => {
    const token = createToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(() => verifyToken(token)).toThrow('Missing user ID');
  });
  
  it('should reject malformed token', () => {
      expect(() => verifyToken('invalid.token')).toThrow('Invalid token format');
  });
});

