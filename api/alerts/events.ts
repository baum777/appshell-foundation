import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildRailwayUrl, getEnvOrThrow } from '../_lib/alertsProxy';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, since, limit } = req.query;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    const apiKey = getEnvOrThrow('ALERTS_API_KEY');
    const queryParams: Record<string, string> = { userId };
    if (typeof since === 'string') queryParams.since = since;
    if (typeof limit === 'string') queryParams.limit = limit;

    const url = buildRailwayUrl('/events', queryParams);

    const upstreamRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (error: any) {
    console.error('Events proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
