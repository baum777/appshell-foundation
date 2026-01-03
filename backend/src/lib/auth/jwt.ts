import jwt from 'jsonwebtoken';
import { getEnv } from '../../config/env.js';

export interface AuthUser {
  userId: string;
  tier?: 'free' | 'pro' | 'vip';
  // Add other claims as needed
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const env = getEnv();
    const secret = env.JWT_SECRET;
    
    const decoded = jwt.verify(token, secret) as any;
    
    if (typeof decoded === 'object' && decoded.sub) {
      return {
        userId: decoded.sub,
        tier: decoded.tier || 'free'
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export function signToken(payload: { userId: string; tier?: string }, expiresIn = '7d'): string {
  const env = getEnv();
  return jwt.sign(
    { sub: payload.userId, tier: payload.tier },
    env.JWT_SECRET,
    { expiresIn }
  );
}
