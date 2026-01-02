import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyJson } from '../../_lib/alertsProxy';

interface UnsubscribeBody {
  userId: string;
  deviceId: string;
}

function validateUnsubscribeBody(body: unknown): body is UnsubscribeBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  if (typeof b.userId !== 'string' || !b.userId) return false;
  if (typeof b.deviceId !== 'string' || !b.deviceId) return false;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!validateUnsubscribeBody(req.body)) {
    res.status(400).json({ 
      error: 'Invalid request body. Required: userId (string), deviceId (string)' 
    });
    return;
  }

  await proxyJson(req, res, '/push/unsubscribe', 'POST', req.body);
}

