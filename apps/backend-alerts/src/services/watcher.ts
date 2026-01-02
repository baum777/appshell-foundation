import { pool } from '../db/pool';
import { env } from '../env';
import { mockProvider } from './providers/mockProvider';
import { evaluator } from './evaluator';
import { dispatchEvent } from './dispatch';
import { addSeconds } from '../utils/time';

// Error dedupe map: alertId -> lastErrorAt (ms)
const lastErrorMap = new Map<string, number>();

export function startWatcher() {
  console.log('Starting watcher loop...');
  
  let tickCount = 0;

  setInterval(async () => {
    tickCount++;
    try {
      await runTick();
      
      // Retention cleanup every 60 ticks
      if (tickCount % 60 === 0) {
        await cleanupEvents();
      }
    } catch (err) {
      console.error('Watcher tick error:', err);
    }
  }, env.WATCHER_INTERVAL_MS);
}

async function runTick() {
  const client = await pool.connect();
  try {
    // Select enabled alerts
    // Join alert_runs to get state
    const res = await client.query(`
      SELECT a.*, 
             r.stage, r.last_fired_at, r.cooldown_until, r.last_eval_at, r.last_snapshot
      FROM alerts a
      LEFT JOIN alert_runs r ON a.id = r.alert_id
      WHERE a.enabled = true
      LIMIT $1
    `, [env.EVALUATION_BATCH_SIZE]);

    const alerts = res.rows;

    for (const alert of alerts) {
      try {
        await processAlert(alert);
      } catch (e) {
        // Log error but don't spam if persistent
        const now = Date.now();
        const lastErr = lastErrorMap.get(alert.id) || 0;
        if (now - lastErr > env.ERROR_DEDUPE_MINUTES * 60 * 1000) {
          console.error(`Error processing alert ${alert.id}:`, e);
          lastErrorMap.set(alert.id, now);
        }
      }
    }
  } finally {
    client.release();
  }
}

async function processAlert(alert: any) {
  // Check cooldown
  if (alert.cooldown_until && new Date() < new Date(alert.cooldown_until)) {
    return; // Still cooling down
  }

  // Fetch snapshot
  const snapshot = await mockProvider.fetchSnapshot(alert.rules.asset.id);

  // Evaluate
  const result = evaluator.evaluate(alert.rules, alert.last_snapshot, snapshot);

  const now = new Date();
  let nextStage = alert.stage ?? 0;
  let cooldownUntil: Date | null = null;
  let lastFiredAt = alert.last_fired_at;

  if (result.shouldFire) {
    if (nextStage === 0) {
      nextStage = 1;
    } else {
      nextStage++;
    }

    let eventType = result.eventType || 'TRIGGERED';
    
    // Check if stage reset needed
    if (nextStage > alert.stage_max) {
      eventType = 'RESET';
      nextStage = 0;
      // If resetting, maybe no cooldown? Or cooldown after reset?
      // Assuming cooldown applies to the firing event.
    }
    
    // Apply cooldown
    cooldownUntil = addSeconds(now, alert.cooldown_seconds);
    lastFiredAt = now;

    // Update DB
    await pool.query(`
      INSERT INTO alert_runs (alert_id, stage, last_fired_at, cooldown_until, last_eval_at, last_snapshot, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (alert_id) DO UPDATE SET
        stage = EXCLUDED.stage,
        last_fired_at = EXCLUDED.last_fired_at,
        cooldown_until = EXCLUDED.cooldown_until,
        last_eval_at = EXCLUDED.last_eval_at,
        last_snapshot = EXCLUDED.last_snapshot,
        updated_at = NOW()
    `, [alert.id, nextStage, lastFiredAt, cooldownUntil, now, snapshot]);

    // Dispatch
    await dispatchEvent({
      alertId: alert.id,
      userId: alert.user_id,
      type: eventType,
      stage: nextStage,
      payload: result.payload,
      channels: {
        inApp: alert.channel_inapp,
        push: alert.channel_push
      },
      name: alert.name
    });

  } else {
    // Just update snapshot
    await pool.query(`
      INSERT INTO alert_runs (alert_id, last_eval_at, last_snapshot, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (alert_id) DO UPDATE SET
        last_eval_at = EXCLUDED.last_eval_at,
        last_snapshot = EXCLUDED.last_snapshot,
        updated_at = NOW()
    `, [alert.id, now, snapshot]);
  }
}

async function cleanupEvents() {
  try {
    const days = env.EVENT_RETENTION_DAYS;
    await pool.query(`
      DELETE FROM alert_events 
      WHERE created_at < NOW() - INTERVAL '${days} days'
    `);
  } catch (e) {
    console.error('Cleanup error:', e);
  }
}

