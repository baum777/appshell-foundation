import { describe, it, expect, vi } from 'vitest';
import { verifyToken, signToken } from '../../lib/auth/jwt.js';

// Mock env
vi.mock('../../config/env.js', () => ({
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
    const jwt = require('jsonwebtoken'); // use real jwt to sign with wrong secret
    const token = jwt.sign({ sub: 'user-123' }, 'wrong-secret');
    
    const user = verifyToken(token);
    expect(user).toBeNull();
  });

  it('should return null for expired token', () => {
     // We can't easily force signToken to create expired token without modifying it or mocking Date
     // Use jsonwebtoken directly
     const jwt = require('jsonwebtoken');
     const token = jwt.sign({ sub: 'user-123' }, 'test-secret', { expiresIn: '-1s' });
     
     const user = verifyToken(token);
     expect(user).toBeNull();
  });

  it('should return null for malformed token', () => {
      const user = verifyToken('invalid.token');
      expect(user).toBeNull();
  });
});
