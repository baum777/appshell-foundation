import type { IncomingMessage, ServerResponse } from 'http';
import { verifyToken, type AuthUser } from '../../lib/auth/jwt.js';
import { sendError, unauthorized } from '../../http/error.js';

export interface AuthenticatedRequest extends IncomingMessage {
  user: AuthUser;
  userId: string;
}

export function requireAuth(
  req: IncomingMessage, 
  res: ServerResponse, 
  next: (req: AuthenticatedRequest) => void | Promise<void>
): void {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, unauthorized('Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.slice(7);
  const user = verifyToken(token);

  if (!user) {
    sendError(res, unauthorized('Invalid or expired token'));
    return;
  }

  const authReq = req as AuthenticatedRequest;
  authReq.user = user;
  authReq.userId = user.userId;

  // Execute next handler
  next(authReq);
}

