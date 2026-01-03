import { z } from "zod";

// Evidence reference for findings and improvements
const EvidenceSchema = z.object({
  entryId: z.string(),
  field: z.string(),
  value: z.string().optional(),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// Finding represents an observation about the entry
const FindingSchema = z.object({
  title: z.string(),
  detail: z.string(),
  evidence: z.array(EvidenceSchema),
});

export type Finding = z.infer<typeof FindingSchema>;

// Improvement represents an actionable suggestion
const ImprovementSchema = z.object({
  action: z.string(),
  why: z.string(),
  priority: z.enum(["P1", "P2", "P3"]),
  evidence: z.array(EvidenceSchema),
});

export type Improvement = z.infer<typeof ImprovementSchema>;

// Meta information about the insight generation
const MetaSchema = z.object({
  cache: z.enum(["hit", "miss"]),
  latencyMs: z.number(),
});

export type InsightMeta = z.infer<typeof MetaSchema>;

// Main insight schema
export const JournalInsightV1Schema = z.object({
  insightId: z.string(),
  version: z.literal("insight_v1"),
  entryId: z.string(),
  createdAt: z.number(),

  summary: z.string().max(200), // ~160 chars target, allow some buffer
  confidence: z.number().min(0).max(1),
  strength: z.enum(["low", "medium", "high"]),

  findings: z.array(FindingSchema),
  improvements: z.array(ImprovementSchema),

  meta: MetaSchema,
});

export type JournalInsightV1 = z.infer<typeof JournalInsightV1Schema>;

// Insight card states
export type InsightCardState = "idle" | "loading" | "ready" | "error" | "blocked";

// Error record for debugging
export interface InsightError {
  message: string;
  timestamp: number;
}
