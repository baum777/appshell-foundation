import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Frontend usually exposes VITE_VAPID_PUBLIC_KEY at build time,
  // but this endpoint allows runtime retrieval if secrets are managed in Vercel Env
  const publicKey = process.env.VITE_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  if (!publicKey) {
    res.status(404).json({ error: 'VAPID public key not configured' });
    return;
  }

  res.json({ publicKey });
}

