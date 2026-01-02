import type { VercelRequest, VercelResponse } from '@vercel/node';
import { proxyJson } from '../../_lib/alertsProxy';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Basic validation that body exists; upstream handles deep validation
  if (!req.body || !req.body.userId) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  await proxyJson(req, res, '/push/subscribe', 'POST', req.body);
}

