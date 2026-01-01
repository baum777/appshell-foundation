/**
 * Service Worker Contracts
 * Per SW_SPEC.md
 */

// Database configuration
export const SW_IDB_NAME = 'sparkfined_sw_v1';
export const SW_IDB_VERSION = 1;

// Store names
export const STORE_KV = 'kv';
export const STORE_DEDUPE = 'dedupe';

// Key-Value store row
export interface SwKeyValueRow {
  key: string;
  value: unknown;
  updatedAt: string;
}

// Dedupe store row
export interface SwDedupeRow {
  dedupeKey: string;
  eventId: string;
  createdAt: string;
  expiresAt: string;
}

// Dedupe namespaces
export type SwDedupeNamespace = 'alert' | 'oracle';

// Dedupe TTL in milliseconds
export const DEDUPE_TTL = {
  alert: 24 * 60 * 60 * 1000, // 24 hours
  oracle: 36 * 60 * 60 * 1000, // 36 hours
} as const;

// Poll intervals in milliseconds
export const POLL_INTERVALS = {
  alerts: 30 * 1000, // 30 seconds
  oracle: 10 * 60 * 1000, // 10 minutes
} as const;

// Max backoff values
export const MAX_BACKOFF = {
  alerts: 10 * 60 * 1000, // 10 minutes
  oracle: 60 * 60 * 1000, // 60 minutes
} as const;

// Notification types
export type SwNotificationType = 'ALERT' | 'ORACLE';

// Notification data payload
export interface SwNotificationData {
  type: SwNotificationType;
  url: string;
  eventId: string;
  alertId?: string;
  oracleId?: string;
}

// Auth update message from UI
export interface SwAuthUpdateMessage {
  type: 'SW_AUTH_UPDATE';
  accessToken: string | null;
}

// Tick message from UI
export interface SwTickMessage {
  type: 'SW_TICK';
}

// SW status message to UI
export interface SwStatusMessage {
  type: 'SW_STATUS';
  status: 'ready' | 'authRequired' | 'error';
  error?: string;
}

export type SwMessage = SwAuthUpdateMessage | SwTickMessage | SwStatusMessage;

// Alert event types (from backend)
export type AlertEmittedType =
  | 'SIMPLE_TRIGGERED'
  | 'TWO_STAGE_PROGRESS'
  | 'TWO_STAGE_CONFIRMED'
  | 'TWO_STAGE_EXPIRED'
  | 'DEAD_TOKEN_STAGE'
  | 'DEAD_TOKEN_SESSION_ENDED';

// Alert emitted event (from backend)
export interface AlertEmitted {
  eventId: string;
  type: AlertEmittedType;
  occurredAt: string;
  alertId: string;
  alertType: string;
  symbolOrAddress: string;
  timeframe: string;
  stage: string;
  status: string;
  detail?: {
    kind: string;
    [key: string]: unknown;
  };
}

// Oracle insight (from backend)
export interface OracleInsight {
  id: string;
  title: string;
  summary: string;
  theme: string;
  isRead: boolean;
  createdAt: string;
}

// Oracle daily feed (from backend)
export interface OracleDailyFeed {
  pinned: {
    id: 'today-takeaway';
    title: string;
    summary: string;
    isRead: boolean;
    createdAt: string;
  };
  insights: OracleInsight[];
}
