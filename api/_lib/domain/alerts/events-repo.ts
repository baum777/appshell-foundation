/**
 * Alert Events Repository
 * KV-backed storage for alert emitted events with dedupe
 */

import { kv, kvKeys, kvTTL } from '../../kv';
import type { AlertEmitted } from '../../types';

// ─────────────────────────────────────────────────────────────
// EVENT INDEX MANAGEMENT
// ─────────────────────────────────────────────────────────────

interface EventIndexEntry {
  eventId: string;
  occurredAt: string;
  alertId: string;
}

async function getEventIndex(): Promise<EventIndexEntry[]> {
  const index = await kv.get<EventIndexEntry[]>(kvKeys.alertEventsIndex());
  return index || [];
}

async function setEventIndex(entries: EventIndexEntry[]): Promise<void> {
  await kv.set(kvKeys.alertEventsIndex(), entries, kvTTL.alertEvent);
}

// ─────────────────────────────────────────────────────────────
// EVENT CRUD
// ─────────────────────────────────────────────────────────────

export async function alertEventCreate(event: AlertEmitted): Promise<void> {
  // Store the event
  await kv.set(kvKeys.alertEvent(event.eventId), event, kvTTL.alertEvent);
  
  // Add to index
  const index = await getEventIndex();
  index.push({
    eventId: event.eventId,
    occurredAt: event.occurredAt,
    alertId: event.alertId,
  });
  
  // Clean up old entries (older than 30 days)
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const filtered = index.filter(e => e.occurredAt > cutoff);
  
  await setEventIndex(filtered);
}

export async function alertEventsQuery(
  since?: string,
  limit = 100
): Promise<AlertEmitted[]> {
  const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const index = await getEventIndex();
  
  // Filter and sort by occurredAt
  const filtered = index
    .filter(e => e.occurredAt > sinceDate)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .slice(0, limit);
  
  // Fetch full events
  const events: AlertEmitted[] = [];
  for (const entry of filtered) {
    const event = await kv.get<AlertEmitted>(kvKeys.alertEvent(entry.eventId));
    if (event) {
      events.push(event);
    }
  }
  
  return events;
}

export async function alertEventExists(eventId: string): Promise<boolean> {
  return kv.exists(kvKeys.alertEvent(eventId));
}

// ─────────────────────────────────────────────────────────────
// DEDUPE HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Check if an emit has already been sent for this alert+stage+window
 * Used to prevent duplicate notifications
 */
export async function isEmitDeduped(
  alertId: string,
  stage: string,
  windowId: string
): Promise<boolean> {
  const key = kvKeys.alertEmitDedupe(alertId, stage, windowId);
  return kv.exists(key);
}

/**
 * Mark an emit as sent for dedupe purposes
 */
export async function markEmitDeduped(
  alertId: string,
  stage: string,
  windowId: string
): Promise<void> {
  const key = kvKeys.alertEmitDedupe(alertId, stage, windowId);
  await kv.set(key, { emittedAt: new Date().toISOString() }, kvTTL.alertEmitDedupe);
}

/**
 * Create event with dedupe check
 * Returns true if event was created, false if already exists (deduped)
 */
export async function alertEventCreateDeduped(
  event: AlertEmitted,
  windowId: string
): Promise<boolean> {
  const stage = event.detail?.kind === 'deadToken' 
    ? (event.detail as { deadTokenStage: string }).deadTokenStage 
    : event.type;
  
  // Check dedupe
  if (await isEmitDeduped(event.alertId, stage, windowId)) {
    return false;
  }
  
  // Create event
  await alertEventCreate(event);
  
  // Mark as deduped
  await markEmitDeduped(event.alertId, stage, windowId);
  
  return true;
}
