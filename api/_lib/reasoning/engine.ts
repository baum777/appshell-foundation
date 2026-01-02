import type { HandlerContext } from '../handler';
import { kv, kvTTL, kvKeys, getStoreType } from '../kv';
import { getEnv } from '../env';
import type {
  BoardScenariosInsight,
  InsightCriticOnlyResult,
  InsightCriticReport,
  InsightCriticRequest,
  JsonObject,
  ReasoningBaseRequest,
  ReasoningErrorCode,
  ReasoningResponse,
  ReasoningType,
  SessionReviewInsight,
  TradeReviewInsight,
} from './types';
import { REASONING_CONTRACT_VERSION } from './types';
import { buildReasoningCacheKey } from './cacheKey';
import { withRetry } from './retry';
import { callOpenAiJson } from './openaiClient';
import {
  boardScenariosInsightSchema,
  insightCriticOnlyResultSchema,
  insightCriticReportSchema,
  sessionReviewInsightSchema,
  tradeReviewInsightSchema,
} from './schemas';
import { buildCriticPrompt, buildGeneratorPrompt } from './prompts';
import { deterministicCritic, deterministicGenerate } from './deterministic';

type AnyInsight = TradeReviewInsight | SessionReviewInsight | BoardScenariosInsight;

function ok<T>(ctx: HandlerContext, data: T, input: {
  model: string;
  latencyMs: number;
  version: string;
  cache?: ReasoningResponse<T>['meta']['cache'];
  warnings?: string[];
  confidence?: number;
}): ReasoningResponse<T> {
  return {
    status: 'ok',
    data,
    warnings: input.warnings ?? [],
    confidence: input.confidence ?? 0.7,
    meta: {
      latency_ms: input.latencyMs,
      model: input.model,
      version: input.version,
      requestId: ctx.requestId,
      cache: input.cache,
    },
  };
}

function err<T>(ctx: HandlerContext, input: {
  code: ReasoningErrorCode;
  message: string;
  retryable: boolean;
  latencyMs: number;
  model: string;
  version: string;
  warnings?: string[];
}): ReasoningResponse<T> {
  return {
    status: 'error',
    data: null,
    warnings: input.warnings ?? [],
    confidence: 0,
    meta: {
      latency_ms: input.latencyMs,
      model: input.model,
      version: input.version,
      requestId: ctx.requestId,
    },
    error: {
      code: input.code,
      message: input.message,
      retryable: input.retryable,
    },
  };
}

function isRetryableUpstream(error: unknown): boolean {
  const status = (error as any)?.status;
  if (status === 429) return true;
  if (typeof status === 'number' && status >= 500) return true;
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes('fetch failed') || msg.includes('ECONN') || msg.includes('ENOTFOUND');
}

async function maybeGetCached<T>(key: string): Promise<T | null> {
  return kv.get<T>(key);
}

async function maybeSetCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await kv.set(key, value, ttlSeconds);
}

function isApiEnvelope(value: unknown): value is { data: unknown } {
  return Boolean(value && typeof value === 'object' && 'data' in value);
}

function criticOutputSchemaJson(): string {
  return JSON.stringify(
    {
      issues: [{ kind: 'missing_data', message: '...', fields: ['context.someField'] }],
      adjustedConfidence: 0.7,
      notes: ['...'],
    },
    null,
    2
  );
}

function tradeReviewOutputSchemaJson(): string {
  return JSON.stringify(
    {
      type: 'trade-review',
      referenceId: 'string',
      verdict: 'GOOD_PROCESS | MIXED | BAD_PROCESS',
      decision: { shouldRepeat: true, reason: 'string' },
      highlights: ['string'],
      risks: [{ label: 'string', severity: 'low|medium|high', evidence: ['string'] }],
      fixes: [{ action: 'string', why: 'string' }],
      questions: ['string'],
      critic: {
        issues: [{ kind: 'missing_data|overreach|contradiction', message: 'string', fields: ['string?'] }],
        adjustedConfidence: 0.7,
        notes: ['string'],
      },
    },
    null,
    2
  );
}

function sessionReviewOutputSchemaJson(): string {
  return JSON.stringify(
    {
      type: 'session-review',
      referenceId: 'string',
      summary: 'string',
      decisions: [{ decision: 'string', rationale: 'string' }],
      patterns: [{ pattern: 'string', evidence: ['string'] }],
      nextSessionPlan: [{ action: 'string', trigger: 'string' }],
      critic: {
        issues: [{ kind: 'missing_data|overreach|contradiction', message: 'string', fields: ['string?'] }],
        adjustedConfidence: 0.7,
        notes: ['string'],
      },
    },
    null,
    2
  );
}

function boardScenariosOutputSchemaJson(): string {
  return JSON.stringify(
    {
      type: 'board-scenarios',
      referenceId: 'string',
      scenarios: [
        {
          name: 'string',
          probability: 0.5,
          triggers: ['string'],
          plan: { actions: ['string'], invalidation: 'string', riskRule: 'string' },
        },
      ],
      critic: {
        issues: [{ kind: 'missing_data|overreach|contradiction', message: 'string', fields: ['string?'] }],
        adjustedConfidence: 0.7,
        notes: ['string'],
      },
    },
    null,
    2
  );
}

async function runCritic(input: {
  referenceId: string;
  version: string;
  context: JsonObject;
  insight: JsonObject;
  timeoutMs: number;
  model: string;
}): Promise<{ report: InsightCriticReport; modelUsed: string }> {
  const env = getEnv();
  const schemaJson = criticOutputSchemaJson();

  if (env.OPENAI_API_KEY) {
    const prompt = buildCriticPrompt({
      referenceId: input.referenceId,
      version: input.version,
      context: input.context,
      insight: input.insight,
      outputSchemaJson: schemaJson,
    });

    const result = await callOpenAiJson(prompt, { model: input.model, timeoutMs: input.timeoutMs });
    const report = insightCriticReportSchema.parse(result.parsed);
    return { report, modelUsed: result.model };
  }

  const fallback = deterministicCritic({
    referenceId: input.referenceId,
    version: input.version,
    context: input.context,
    insight: input.insight,
  });
  const report = insightCriticReportSchema.parse(fallback.report);
  return { report, modelUsed: 'stub-deterministic' };
}

export async function runReasoning(
  ctx: HandlerContext,
  type: Exclude<ReasoningType, 'insight-critic'>,
  body: ReasoningBaseRequest
): Promise<ReasoningResponse<AnyInsight>> {
  const started = Date.now();
  const env = getEnv();
  const version = body.version || REASONING_CONTRACT_VERSION;
  const model = env.OPUS_MODEL || 'gpt-4o-mini';

  const { key: cacheKey } = buildReasoningCacheKey({
    type,
    referenceId: body.referenceId,
    version,
    context: body.context,
  });

  const kvKey = kvKeys.reasoningCache(type, body.referenceId, version, cacheKey);
  const cached = await maybeGetCached<ReasoningResponse<AnyInsight>>(kvKey);

  if (cached) {
    return {
      ...cached,
      meta: {
        ...cached.meta,
        requestId: ctx.requestId,
        cache: {
          key: cacheKey,
          hit: true,
          isStale: true,
          source: getStoreType() === 'vercel' ? 'kv' : 'kv',
        },
      },
    };
  }

  const timeoutMs = 12000;

  try {
    const insight = await withRetry(
      async () => {
        // Prefer remote backend (Railway) if configured.
        if (env.REASONING_BACKEND_URL) {
          const controller = new AbortController();
          const to = setTimeout(() => controller.abort(), timeoutMs);
          try {
            const res = await fetch(`${env.REASONING_BACKEND_URL}/api/reasoning/${type}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': reqAuthHeader(ctx),
                'x-request-id': ctx.requestId,
              },
              body: JSON.stringify(body),
              signal: controller.signal,
            });
            const json = (await res.json()) as unknown;
            const payload = (isApiEnvelope(json) ? json.data : null) as ReasoningResponse<AnyInsight> | null;
            if (!payload || typeof payload !== 'object') {
              const error = new Error('Invalid backend response shape');
              (error as any).status = res.status;
              throw error;
            }
            if (payload.status !== 'ok' || !payload.data) {
              const error = new Error(payload.error?.message || 'Backend reasoning failed');
              (error as any).status = res.status;
              throw error;
            }
            return payload.data;
          } finally {
            clearTimeout(to);
          }
        }

        // Direct LLM call (or deterministic fallback)
        if (env.OPENAI_API_KEY) {
          const outputSchemaJson =
            type === 'trade-review'
              ? tradeReviewOutputSchemaJson()
              : type === 'session-review'
                ? sessionReviewOutputSchemaJson()
                : boardScenariosOutputSchemaJson();

          const prompt = buildGeneratorPrompt({
            type,
            referenceId: body.referenceId,
            version,
            context: body.context,
            outputSchemaJson,
          });

          const result = await callOpenAiJson(prompt, { model, timeoutMs });
          const parsed = result.parsed;

          if (type === 'trade-review') return tradeReviewInsightSchema.parse(parsed);
          if (type === 'session-review') return sessionReviewInsightSchema.parse(parsed);
          return boardScenariosInsightSchema.parse(parsed);
        }

        const fallback = deterministicGenerate(type, {
          referenceId: body.referenceId,
          version,
          context: body.context,
        });

        if (type === 'trade-review') return tradeReviewInsightSchema.parse(fallback);
        if (type === 'session-review') return sessionReviewInsightSchema.parse(fallback);
        return boardScenariosInsightSchema.parse(fallback);
      },
      { maxAttempts: 3, baseDelayMs: 250, maxDelayMs: 2000 },
      isRetryableUpstream
    );

    // Insight Critic (final step)
    const critic = await runCritic({
      referenceId: body.referenceId,
      version,
      context: body.context,
      insight: insight as unknown as JsonObject,
      timeoutMs: 8000,
      model,
    });

    const finalInsight = {
      ...insight,
      critic: critic.report,
    } as AnyInsight;

    const latencyMs = Date.now() - started;
    const response = ok(ctx, finalInsight, {
      model: env.OPENAI_API_KEY ? model : 'stub-deterministic',
      latencyMs,
      version,
      confidence: critic.report.adjustedConfidence,
      warnings: critic.report.issues.length ? critic.report.notes : [],
      cache: { key: cacheKey, hit: false, isStale: false, source: env.REASONING_BACKEND_URL ? 'backend' : env.OPENAI_API_KEY ? 'llm' : 'llm' },
    });

    await maybeSetCached(kvKey, response, kvTTL.reasoningCache);

    return response;
  } catch (e) {
    const latencyMs = Date.now() - started;
    const mapped = mapEngineError(e);
    return err(ctx, {
      code: mapped.code,
      message: mapped.message,
      retryable: mapped.retryable,
      latencyMs,
      model: env.OPENAI_API_KEY ? model : 'stub-deterministic',
      version,
    });
  }
}

export async function runInsightCritic(
  ctx: HandlerContext,
  body: InsightCriticRequest
): Promise<ReasoningResponse<InsightCriticOnlyResult>> {
  const started = Date.now();
  const env = getEnv();
  const version = body.version || REASONING_CONTRACT_VERSION;
  const model = env.OPUS_MODEL || 'gpt-4o-mini';

  // Critic depends on both context + insight; include insight in the hashed context to avoid collisions.
  const contextForKey: JsonObject = { ...body.context, __insight: body.insight };
  const { key: cacheKey } = buildReasoningCacheKey({
    type: 'insight-critic',
    referenceId: body.referenceId,
    version,
    context: contextForKey,
  });

  const kvKey = kvKeys.reasoningCache('insight-critic', body.referenceId, version, cacheKey);
  const cached = await maybeGetCached<ReasoningResponse<InsightCriticOnlyResult>>(kvKey);

  if (cached) {
    return {
      ...cached,
      meta: {
        ...cached.meta,
        requestId: ctx.requestId,
        cache: { key: cacheKey, hit: true, isStale: true, source: 'kv' },
      },
    };
  }

  try {
    const report = await runCritic({
      referenceId: body.referenceId,
      version,
      context: body.context,
      insight: body.insight,
      timeoutMs: 8000,
      model,
    });

    const payload = insightCriticOnlyResultSchema.parse({
      type: 'insight-critic',
      referenceId: body.referenceId,
      report: report.report,
    });

    const latencyMs = Date.now() - started;
    const response = ok(ctx, payload, {
      model: env.OPENAI_API_KEY ? model : 'stub-deterministic',
      latencyMs,
      version,
      confidence: report.report.adjustedConfidence,
      warnings: report.report.issues.length ? report.report.notes : [],
      cache: { key: cacheKey, hit: false, isStale: false, source: env.OPENAI_API_KEY ? 'llm' : 'llm' },
    });

    await maybeSetCached(kvKey, response, kvTTL.reasoningCache);

    return response;
  } catch (e) {
    const latencyMs = Date.now() - started;
    const mapped = mapEngineError(e);
    return err(ctx, {
      code: mapped.code,
      message: mapped.message,
      retryable: mapped.retryable,
      latencyMs,
      model: env.OPENAI_API_KEY ? model : 'stub-deterministic',
      version,
    });
  }
}

function mapEngineError(error: unknown): { code: ReasoningErrorCode; message: string; retryable: boolean } {
  const status = (error as any)?.status;
  const msg = error instanceof Error ? error.message : String(error);

  if (error instanceof Error && error.name === 'AbortError') {
    return { code: 'TIMEOUT', message: 'Reasoning request timed out', retryable: true };
  }
  if (status === 429) {
    return { code: 'RATE_LIMITED', message: 'Upstream rate limited', retryable: true };
  }
  if (status && typeof status === 'number' && status >= 500) {
    return { code: 'UPSTREAM_ERROR', message: 'Upstream service error', retryable: true };
  }
  if (msg.includes('No JSON object') || msg.includes('JSON')) {
    return { code: 'PARSING_FAILED', message: 'Failed to parse reasoning output', retryable: false };
  }
  return { code: 'INTERNAL_ERROR', message: 'Internal reasoning error', retryable: false };
}

function reqAuthHeader(ctx: HandlerContext): string {
  const header = ctx.req.headers['authorization'];
  if (Array.isArray(header)) return header[0] || '';
  return header || '';
}


