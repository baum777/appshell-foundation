import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildRailwayUrl, getEnvOrThrow } from '../_lib/alertsProxy';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId, since, limit } = req.query;

  // Validate userId (required)
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  // Validate and normalize limit
  let parsedLimit = DEFAULT_LIMIT;
  if (typeof limit === 'string') {
    const num = parseInt(limit, 10);
    if (!isNaN(num) && num > 0) {
      parsedLimit = Math.min(num, MAX_LIMIT);
    }
  }

  try {
    const apiKey = getEnvOrThrow('ALERTS_API_KEY');
    const queryParams: Record<string, string> = { 
      userId,
      limit: String(parsedLimit)
    };
    if (typeof since === 'string') queryParams.since = since;

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
    if (error.message?.includes('Missing environment variable')) {
      res.status(500).json({ error: 'Configuration error' });
    } else {
      res.status(502).json({ error: 'Upstream error' });
    }
  }
}
