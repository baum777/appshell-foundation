import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyStream } from '../_lib/alertsProxy';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  proxyStream(req, res, '/stream', { userId });
}

