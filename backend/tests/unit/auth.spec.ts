import { describe, it, expect, vi } from 'vitest';
import { verifyToken, signToken } from '../../src/lib/auth/jwt.js';
import * as jwtLib from 'jsonwebtoken';

// Mock env used by jwt.ts
vi.mock('../../src/config/env.js', () => ({
  getEnv: () => ({ JWT_SECRET: 'test-secret' }),
}));

describe('Auth / JWT', () => {
  it('should verify a valid token', () => {
    const token = signToken({ userId: 'user-123' });
    const user = verifyToken(token);
    expect(user).not.toBeNull();
    expect(user?.userId).toBe('user-123');
    expect(user?.tier).toBe('free'); // default
  });

  it('should verify a valid token with tier', () => {
    const token = signToken({ userId: 'user-123', tier: 'pro' });
    const user = verifyToken(token);
    expect(user).not.toBeNull();
    expect(user?.userId).toBe('user-123');
    expect(user?.tier).toBe('pro');
  });

  it('should return null for invalid signature', () => {
    // Sign with different secret
    const token = jwtLib.sign({ sub: 'user-123' }, 'wrong-secret');
    const user = verifyToken(token);
    expect(user).toBeNull();
  });

  it('should return null for expired token', () => {
    const token = jwtLib.sign({ sub: 'user-123' }, 'test-secret', { expiresIn: '-1s' });
    const user = verifyToken(token);
    expect(user).toBeNull();
  });

  it('should return null for malformed token', () => {
    const user = verifyToken('invalid.token');
    expect(user).toBeNull();
  });
});


