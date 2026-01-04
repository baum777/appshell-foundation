import { describe, it, expect } from 'vitest';
import { verifyJwtFromAuthHeader } from '../../_lib/auth/jwt';
import { 
  createValidToken, 
  createExpiredToken, 
  createTokenWithWrongIssuer, 
  createTokenWithWrongAudience, 
  createTokenWithWrongSecret 
} from '../helpers/jwt';
import { ErrorCodes } from '../../_lib/errors';

describe('JWT Verification', () => {
  it('verifies valid token successfully', () => {
    const token = createValidToken('user-123');
    const payload = verifyJwtFromAuthHeader(`Bearer ${token}`);
    
    expect(payload.sub).toBe('user-123');
    expect(payload.iss).toBeDefined();
    expect(payload.aud).toBeDefined();
  });

  it('throws UNAUTHORIZED for missing header', () => {
    try {
      verifyJwtFromAuthHeader(undefined);
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.UNAUTHORIZED);
    }
  });

  it('throws INVALID_AUTH_HEADER for malformed header', () => {
    try {
      verifyJwtFromAuthHeader('Basic 123');
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_AUTH_HEADER);
    }
  });

  it('throws TOKEN_EXPIRED for expired token', () => {
    const token = createExpiredToken();
    try {
      verifyJwtFromAuthHeader(`Bearer ${token}`);
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.TOKEN_EXPIRED);
    }
  });

  it('throws INVALID_TOKEN_CLAIMS for wrong issuer', () => {
    const token = createTokenWithWrongIssuer();
    try {
      verifyJwtFromAuthHeader(`Bearer ${token}`);
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_TOKEN_CLAIMS);
    }
  });

  it('throws INVALID_TOKEN_CLAIMS for wrong audience', () => {
    const token = createTokenWithWrongAudience();
    try {
      verifyJwtFromAuthHeader(`Bearer ${token}`);
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_TOKEN_CLAIMS);
    }
  });

  it('throws INVALID_TOKEN for wrong signature (secret mismatch)', () => {
    const token = createTokenWithWrongSecret();
    try {
      verifyJwtFromAuthHeader(`Bearer ${token}`);
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.code).toBe(ErrorCodes.INVALID_TOKEN);
    }
  });
});

