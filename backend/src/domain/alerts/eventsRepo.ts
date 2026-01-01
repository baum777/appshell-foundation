import { getDatabase } from '../../db/sqlite.js';
import type { AlertEmitted } from './types.js';

/**
 * Alert Events Repository
 * Handles persistence for alert emitted events
 */

export function alertEventCreate(event: AlertEmitted): void {
  const db = getDatabase();
  
  db.prepare(`
    INSERT INTO alert_events_v1 (event_id, occurred_at, alert_id, payload_json)
    VALUES (?, ?, ?, ?)
  `).run(
    event.eventId,
    event.occurredAt,
    event.alertId,
    JSON.stringify(event)
  );
}

export function alertEventsQuery(
  since?: string,
  limit = 100
): AlertEmitted[] {
  const db = getDatabase();
  
  const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const rows = db.prepare(`
    SELECT payload_json FROM alert_events_v1
    WHERE occurred_at > ?
    ORDER BY occurred_at ASC
    LIMIT ?
  `).all(sinceDate, limit) as Array<{ payload_json: string }>;
  
  return rows.map(row => JSON.parse(row.payload_json) as AlertEmitted);
}

export function alertEventsCleanup(retentionDays = 30): number {
  const db = getDatabase();
  
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  
  const result = db.prepare(`
    DELETE FROM alert_events_v1 WHERE occurred_at < ?
  `).run(cutoff);
  
  return result.changes;
}

export function alertEventExists(eventId: string): boolean {
  const db = getDatabase();
  
  const row = db.prepare(`
    SELECT 1 FROM alert_events_v1 WHERE event_id = ? LIMIT 1
  `).get(eventId);
  
  return row !== undefined;
}
