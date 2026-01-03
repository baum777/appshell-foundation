import { z } from 'zod';

// Insight V1 schema
export const JournalInsightV1Schema = z.object({
  insightId: z.string(),
  version: z.literal('insight_v1'),
  entryId: z.string(),
  createdAt: z.number(),

  summary: z.string().max(200),
  confidence: z.number().min(0).max(1),
  strength: z.enum(['low', 'medium', 'high']),

  findings: z.array(z.object({
    title: z.string(),
    detail: z.string(),
    evidence: z.array(z.object({
      entryId: z.string(),
      field: z.string(),
      value: z.string().optional(),
    })),
  })),

  improvements: z.array(z.object({
    action: z.string(),
    why: z.string(),
    priority: z.enum(['P1', 'P2', 'P3']),
    evidence: z.array(z.object({
      entryId: z.string(),
      field: z.string(),
    })),
  })),

  meta: z.object({
    cache: z.enum(['hit', 'miss']),
    latencyMs: z.number(),
  }),
});

export type JournalInsightV1 = z.infer<typeof JournalInsightV1Schema>;

// Card states
export type InsightCardState = 'idle' | 'loading' | 'ready' | 'error' | 'blocked';

// Extended entry fields for insight generation
export interface ExtendedJournalEntry {
  id: string;
  side: 'BUY' | 'SELL';
  status: 'pending' | 'confirmed' | 'archived';
  timestamp: string;
  summary: string;
  // Optional fields the insight engine checks
  entryPrice?: number;
  exitPrice?: number;
  result?: 'win' | 'loss' | 'breakeven';
  riskPercent?: number;
  stopLoss?: number;
  takeProfit?: number;
  emotionTag?: string;
  sessionTag?: string;
  notes?: string;
  attachments?: string[];
  chartLink?: string;
  invalidation?: string;
}
