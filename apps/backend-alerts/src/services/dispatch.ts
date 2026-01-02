import { pool } from '../db/pool';
import { streamHub } from './streamHub';
import { sendPushToUser } from './push';
import { nowISO } from '../utils/time';

interface DispatchEvent {
  alertId: string;
  userId: string;
  type: string;
  stage: number;
  payload: any;
  channels: {
    inApp: boolean;
    push: boolean;
  };
  name: string; // for push title/body
}

export async function dispatchEvent(evt: DispatchEvent) {
  // 1. Insert into DB
  const client = await pool.connect();
  let eventId: string;
  try {
    const res = await client.query(
      `INSERT INTO alert_events (alert_id, user_id, type, stage, payload)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [evt.alertId, evt.userId, evt.type, evt.stage, evt.payload]
    );
    eventId = res.rows[0].id;
  } finally {
    client.release();
  }

  // 2. Broadcast In-App (SSE)
  if (evt.channels.inApp) {
    streamHub.broadcast(evt.userId, {
      id: eventId,
      alertId: evt.alertId,
      type: evt.type,
      stage: evt.stage,
      payload: evt.payload,
      createdAt: nowISO()
    });
  }

  // 3. Send Push
  if (evt.channels.push) {
    await sendPushToUser(evt.userId, {
      title: 'Sparkfined Alert',
      body: `${evt.name} — Stage ${evt.stage} (${evt.type})`,
      data: {
        alertId: evt.alertId,
        eventId,
        stage: evt.stage,
        type: evt.type
      },
      ts: nowISO()
    });
  }
}

