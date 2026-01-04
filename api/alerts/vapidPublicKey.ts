import { createHandler } from '../_lib/handler';
import { sendJson } from '../_lib/response';

export default createHandler({
  auth: 'none',
  GET: async ({ res }) => {
    // Frontend usually exposes VITE_VAPID_PUBLIC_KEY at build time,
    // but this endpoint allows runtime retrieval if secrets are managed in Vercel Env
    const publicKey = process.env.VITE_VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

    if (!publicKey) {
      res.status(404).json({ error: 'VAPID public key not configured' });
      return;
    }

    sendJson(res, { publicKey });
  },
});

