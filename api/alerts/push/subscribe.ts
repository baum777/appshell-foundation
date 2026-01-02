import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyJson } from '../../_lib/alertsProxy';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface SubscribeBody {
  userId: string;
  deviceId: string;
  subscription: PushSubscription;
  userAgent?: string;
}

function isValidSubscription(sub: unknown): sub is PushSubscription {
  if (!sub || typeof sub !== 'object') return false;
  const s = sub as Record<string, unknown>;
  if (typeof s.endpoint !== 'string' || !s.endpoint) return false;
  if (!s.keys || typeof s.keys !== 'object') return false;
  const keys = s.keys as Record<string, unknown>;
  if (typeof keys.p256dh !== 'string' || !keys.p256dh) return false;
  if (typeof keys.auth !== 'string' || !keys.auth) return false;
  return true;
}

function validateSubscribeBody(body: unknown): body is SubscribeBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (typeof b.userId !== 'string' || !b.userId) return false;
  if (typeof b.deviceId !== 'string' || !b.deviceId) return false;
  if (!isValidSubscription(b.subscription)) return false;
  if (b.userAgent !== undefined && typeof b.userAgent !== 'string') return false;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!validateSubscribeBody(req.body)) {
    res.status(400).json({ 
      error: 'Invalid request body. Required: userId (string), deviceId (string), subscription ({ endpoint, keys: { p256dh, auth } })' 
    });
    return;
  }

  await proxyJson(req, res, '/push/subscribe', 'POST', req.body);
}

