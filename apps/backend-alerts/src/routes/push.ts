import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();
router.use(authMiddleware);

const SubscribeSchema = z.object({
  userId: z.string(),
  deviceId: z.string(),
  subscription: z.object({
    endpoint: z.string(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  }),
  userAgent: z.string().optional()
});

router.post('/subscribe', async (req, res) => {
  try {
    const data = SubscribeSchema.parse(req.body);
    
    await pool.query(`
      INSERT INTO device_push_subscriptions (user_id, device_id, endpoint, p256dh, auth, user_agent, enabled)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT (user_id, device_id) DO UPDATE SET
        endpoint = EXCLUDED.endpoint,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent,
        enabled = true,
        updated_at = NOW()
    `, [data.userId, data.deviceId, data.subscription.endpoint, data.subscription.keys.p256dh, data.subscription.keys.auth, data.userAgent]);
    
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  const { userId, deviceId } = req.body;
  if (!userId || !deviceId) return res.status(400).json({ error: 'Missing userId or deviceId' });
  
  await pool.query(
    'UPDATE device_push_subscriptions SET enabled = false WHERE user_id = $1 AND device_id = $2',
    [userId, deviceId]
  );
  
  res.json({ ok: true });
});

export const pushRouter = router;

