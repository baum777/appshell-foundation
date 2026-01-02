import webpush from 'web-push';
import { env } from '../env';
import { pool } from '../db/pool';

if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
}

export interface PushPayload {
  title: string;
  body: string;
  data: any;
  ts: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const res = await pool.query(
    'SELECT * FROM device_push_subscriptions WHERE user_id = $1 AND enabled = true',
    [userId]
  );

  const promises = res.rows.map(async (sub) => {
    const subscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    };

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Gone, disable
        await pool.query('UPDATE device_push_subscriptions SET enabled = false WHERE id = $1', [sub.id]);
      } else {
        console.error(`Push error for user ${userId} device ${sub.id}:`, err);
      }
    }
  });

  await Promise.allSettled(promises);
}

