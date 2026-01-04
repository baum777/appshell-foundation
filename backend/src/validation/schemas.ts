import { z } from 'zod';

/**
 * Shared Validation Schemas
 * Matches CONTRACTS.md definitions
 */

// ─────────────────────────────────────────────────────────────
// JOURNAL SCHEMAS
// ─────────────────────────────────────────────────────────────

export const journalEntrySideSchema = z.enum(['BUY', 'SELL']);
export const journalEntryStatusSchema = z.enum(['pending', 'confirmed', 'archived']);

export const onchainContextSchema = z.object({
  capturedAt: z.string().datetime(),
  priceUsd: z.number().nonnegative(),
  liquidityUsd: z.number().nonnegative(),
  volume24h: z.number().nonnegative(),
  marketCap: z.number().nonnegative(),
  ageMinutes: z.number().nonnegative(),
  holders: z.number().nonnegative(),
  transfers24h: z.number().nonnegative(),
  dexId: z.string().optional(),
});

export const journalCreateRequestSchema = z.object({
  side: journalEntrySideSchema,
  summary: z.string().min(1, 'Summary is required').max(1000),
  timestamp: z.string().datetime().optional(),
  assetId: z.string().optional(),
  onchainContext: onchainContextSchema.optional(),
});

export const journalConfirmPayloadSchema = z.object({
  // Ruleset v1: confirm must work without mandatory reflection fields.
  // We still persist a value for DB NOT NULL columns via defaults.
  mood: z.string().default(''),
  note: z.string().default(''),
  tags: z.array(z.string()).default([]),
});

export const journalArchiveRequestSchema = z.object({
  // Ruleset v1: quickflip archive must work without a required reason.
  // DB expects NOT NULL, so default to empty string.
  reason: z.string().default(''),
});

export const journalListQuerySchema = z.object({
  view: journalEntryStatusSchema.optional(),
  status: journalEntryStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  cursor: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// ALERTS SCHEMAS
// ─────────────────────────────────────────────────────────────

export const alertTypeSchema = z.enum(['SIMPLE', 'TWO_STAGE_CONFIRMED', 'DEAD_TOKEN_AWAKENING_V2']);
export const alertStageSchema = z.enum(['INITIAL', 'WATCHING', 'CONFIRMED', 'EXPIRED', 'CANCELLED']);
export const alertStatusSchema = z.enum(['active', 'paused', 'triggered']);
export const alertStatusFilterSchema = z.enum(['all', 'active', 'paused', 'triggered']);

export const simpleConditionSchema = z.enum(['ABOVE', 'BELOW', 'CROSS']);
export const twoStageTemplateSchema = z.enum([
  'TREND_MOMENTUM_STRUCTURE',
  'MACD_RSI_VOLUME',
  'BREAKOUT_RETEST_VOLUME',
]);
export const deadTokenStageSchema = z.enum([
  'INITIAL',
  'AWAKENING',
  'SUSTAINED',
  'SECOND_SURGE',
  'SESSION_ENDED',
]);

export const deadTokenParamsSchema = z.object({
  DEAD_VOL: z.number().nonnegative(),
  DEAD_TRADES: z.number().nonnegative(),
  DEAD_HOLDER_DELTA_6H: z.number(),
  AWAKE_VOL_MULT: z.number().positive(),
  AWAKE_TRADES_MULT: z.number().positive(),
  AWAKE_HOLDER_DELTA_30M: z.number(),
  STAGE2_WINDOW_MIN: z.number().positive(),
  COOLDOWN_MIN: z.number().positive(),
  STAGE3_WINDOW_H: z.number().positive(),
  STAGE3_VOL_MULT: z.number().positive(),
  STAGE3_TRADES_MULT: z.number().positive(),
  STAGE3_HOLDER_DELTA: z.number(),
});

export const createSimpleAlertSchema = z.object({
  type: z.literal('SIMPLE'),
  symbolOrAddress: z.string().min(1),
  timeframe: z.string().min(1),
  condition: simpleConditionSchema,
  targetPrice: z.number().positive(),
  note: z.string().optional(),
});

export const createTwoStageAlertSchema = z.object({
  type: z.literal('TWO_STAGE_CONFIRMED'),
  symbolOrAddress: z.string().min(1),
  timeframe: z.string().min(1),
  template: twoStageTemplateSchema,
  windowCandles: z.number().int().positive().optional(),
  windowMinutes: z.number().int().positive().optional(),
  expiryMinutes: z.number().int().positive(),
  cooldownMinutes: z.number().int().positive(),
  note: z.string().optional(),
});

export const createDeadTokenAlertSchema = z.object({
  type: z.literal('DEAD_TOKEN_AWAKENING_V2'),
  symbolOrAddress: z.string().min(1),
  timeframe: z.string().min(1),
  params: deadTokenParamsSchema,
  note: z.string().optional(),
});

export const createAlertRequestSchema = z.discriminatedUnion('type', [
  createSimpleAlertSchema,
  createTwoStageAlertSchema,
  createDeadTokenAlertSchema,
]);

export const updateAlertRequestSchema = z.object({
  enabled: z.boolean().optional(),
  note: z.string().optional(),
  condition: simpleConditionSchema.optional(),
  targetPrice: z.number().positive().optional(),
});

export const alertsListQuerySchema = z.object({
  filter: alertStatusFilterSchema.optional().default('all'),
  symbolOrAddress: z.string().optional(),
});

export const alertEventsQuerySchema = z.object({
  since: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
});

// ─────────────────────────────────────────────────────────────
// ORACLE SCHEMAS
// ─────────────────────────────────────────────────────────────

export const oracleDailyQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

export const oracleReadStateRequestSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  isRead: z.boolean(),
});

export const oracleBulkReadStateRequestSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  isRead: z.boolean(),
});

// ─────────────────────────────────────────────────────────────
// CHART TA SCHEMAS
// ─────────────────────────────────────────────────────────────

export const taRequestSchema = z.object({
  market: z.string().min(1, 'Market is required'),
  timeframe: z.string().min(1, 'Timeframe is required'),
  replay: z.boolean(),
});

// ─────────────────────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────────────────────

export type JournalCreateRequest = z.infer<typeof journalCreateRequestSchema>;
export type JournalConfirmPayload = z.infer<typeof journalConfirmPayloadSchema>;
export type JournalArchiveRequest = z.infer<typeof journalArchiveRequestSchema>;
export type JournalListQuery = z.infer<typeof journalListQuerySchema>;
export type OnchainContextValidation = z.infer<typeof onchainContextSchema>;

export type CreateAlertRequest = z.infer<typeof createAlertRequestSchema>;
export type UpdateAlertRequest = z.infer<typeof updateAlertRequestSchema>;
export type AlertsListQuery = z.infer<typeof alertsListQuerySchema>;
export type AlertEventsQuery = z.infer<typeof alertEventsQuerySchema>;

export type OracleDailyQuery = z.infer<typeof oracleDailyQuerySchema>;
export type OracleReadStateRequest = z.infer<typeof oracleReadStateRequestSchema>;
export type OracleBulkReadStateRequest = z.infer<typeof oracleBulkReadStateRequestSchema>;

export type TARequest = z.infer<typeof taRequestSchema>;
