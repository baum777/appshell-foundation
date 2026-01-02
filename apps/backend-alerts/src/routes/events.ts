import { Router } from 'express';
import { pool } from '../db/pool';
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { userId, since, limit } = req.query;
  
  if (!userId) return res.status(400).json({ error: 'userId required' });
  
  const limitVal = Math.min(parseInt(limit as string) || 20, 200);
  
  let events;
  if (since) {
    const result = await pool.query(
      `SELECT * FROM alert_events WHERE user_id = $1 AND created_at > $2 ORDER BY created_at ASC LIMIT $3`,
      [userId, since, limitVal]
    );
    events = result.rows;
  } else {
    const result = await pool.query(
      `SELECT * FROM alert_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limitVal]
    );
    events = result.rows;
  }
  
  let nextSince = since;
  if (events.length > 0) {
     const newest = since ? events[events.length - 1] : events[0];
     nextSince = newest.created_at;
  } else if (!since) {
      nextSince = new Date().toISOString();
  }
  
  res.json({ events, nextSince });
});

export const eventsRouter = router;

