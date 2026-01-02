import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();

router.use(authMiddleware);

const AlertSchema = z.object({
  userId: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  channels: z.object({
    inApp: z.boolean(),
    push: z.boolean()
  }),
  cooldownSeconds: z.number().default(3600),
  stageMax: z.number().default(3),
  rules: z.object({
    asset: z.object({ type: z.string(), id: z.string() }),
    triggers: z.array(z.object({
      kind: z.enum(['VOLUME_SPIKE', 'PRICE_MOVE']),
      windowMinutes: z.number(),
      minIncreasePct: z.number().optional(),
      minMovePct: z.number().optional()
    })),
    confirm: z.object({
      need: z.number(),
      of: z.number(),
      withinMinutes: z.number()
    })
  })
});

// POST /alerts
router.post('/', async (req, res) => {
  try {
    const data = AlertSchema.parse(req.body);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const resInsert = await client.query(`
        INSERT INTO alerts (user_id, name, enabled, channel_inapp, channel_push, cooldown_seconds, stage_max, rules)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        data.userId, data.name, data.enabled, 
        data.channels.inApp, data.channels.push, 
        data.cooldownSeconds, data.stageMax, JSON.stringify(data.rules)
      ]);
      
      const alert = resInsert.rows[0];
      
      // Upsert run state
      await client.query(`
        INSERT INTO alert_runs (alert_id, stage, updated_at)
        VALUES ($1, 0, NOW())
      `, [alert.id]);
      
      await client.query('COMMIT');
      res.json(alert);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Invalid request' });
  }
});

// GET /alerts
router.get('/', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  
  const result = await pool.query('SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  res.json(result.rows);
});

// PUT /alerts/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  
  try {
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    
    if (body.name !== undefined) { sets.push(`name=$${idx++}`); vals.push(body.name); }
    if (body.enabled !== undefined) { sets.push(`enabled=$${idx++}`); vals.push(body.enabled); }
    if (body.channels) {
      if (body.channels.inApp !== undefined) { sets.push(`channel_inapp=$${idx++}`); vals.push(body.channels.inApp); }
      if (body.channels.push !== undefined) { sets.push(`channel_push=$${idx++}`); vals.push(body.channels.push); }
    }
    if (body.cooldownSeconds !== undefined) { sets.push(`cooldown_seconds=$${idx++}`); vals.push(body.cooldownSeconds); }
    if (body.stageMax !== undefined) { sets.push(`stage_max=$${idx++}`); vals.push(body.stageMax); }
    if (body.rules !== undefined) { sets.push(`rules=$${idx++}`); vals.push(JSON.stringify(body.rules)); }
    
    sets.push(`updated_at=NOW()`);
    
    if (sets.length === 1) return res.json({ ok: true }); 

    vals.push(id);
    const query = `UPDATE alerts SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const result = await pool.query(query, vals);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Update failed' });
  }
});

// POST /alerts/:id/enable
router.post('/:id/enable', async (req, res) => {
  const { id } = req.params;
  const { enabled } = req.body;
  
  if (typeof enabled !== 'boolean') return res.status(400).json({ error: 'enabled boolean required' });

  const result = await pool.query(
    'UPDATE alerts SET enabled = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [enabled, id]
  );
  
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

export const alertsRouter = router;

