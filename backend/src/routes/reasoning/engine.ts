import type { ParsedRequest } from '../../http/router.js';
import { getRequestId } from '../../http/requestId.js';
import { kvGet, kvSet, kvKeys, kvTTL } from '../../db/kv.js';
import { getEnv } from '../../config/env.js';
import { buildReasoningContext } from '../../context/contextBuilder.js';
import { opusCallJson } from '../../clients/opusClient.js';
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
} from './types.js';
import { REASONING_CONTRACT_VERSION } from './types.js';
import { buildReasoningCacheKey } from './cacheKey.js';
import { withRetry } from './retry.js';
import {
  boardScenariosInsightSchema,
  insightCriticOnlyResultSchema,
  insightCriticReportSchema,
  sessionReviewInsightSchema,
  tradeReviewInsightSchema,
} from './schemas.js';
import { buildCriticPrompt, buildGeneratorPrompt } from './prompts.js';
import { deterministicCritic, deterministicGenerate } from './deterministic.js';

type AnyInsight = TradeReviewInsight | SessionReviewInsight | BoardScenariosInsight;

function ok<T>(data: T, input: {
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
      requestId: getRequestId(),
      cache: input.cache,
    },
  };
}

function err<T>(input: {
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
      requestId: getRequestId(),
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
}): Promise<InsightCriticReport> {
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

    const result = await opusCallJson(prompt, { model: input.model, timeoutMs: input.timeoutMs });
    return insightCriticReportSchema.parse(result.parsed);
  }

  const fallback = deterministicCritic({
    referenceId: input.referenceId,
    version: input.version,
    context: input.context,
    insight: input.insight,
  });
  return insightCriticReportSchema.parse(fallback.report);
}

export async function runReasoning(
  req: ParsedRequest,
  type: Exclude<ReasoningType, 'insight-critic'>,
  body: ReasoningBaseRequest
): Promise<ReasoningResponse<AnyInsight>> {
  const started = Date.now();
  const env = getEnv();
  const version = body.version || REASONING_CONTRACT_VERSION;
  const model = env.OPUS_MODEL || 'gpt-4o-mini';

  const builtContext = buildReasoningContext({
    userId: req.userId,
    type,
    referenceId: body.referenceId,
    context: body.context,
  });

  const { key: cacheKey } = buildReasoningCacheKey({
    type,
    referenceId: body.referenceId,
    version,
    context: builtContext,
  });

  const kvKey = kvKeys.reasoningCache(type, body.referenceId, version, cacheKey);
  const cached = kvGet<ReasoningResponse<AnyInsight>>(kvKey);
  if (cached) {
    return {
      ...cached,
      meta: {
        ...cached.meta,
        requestId: getRequestId(),
        cache: { key: cacheKey, hit: true, isStale: true, source: 'backend' },
      },
    };
  }

  try {
    const insight = await withRetry(
      async () => {
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
            context: builtContext,
            outputSchemaJson,
          });

          const result = await opusCallJson(prompt, { model, timeoutMs: 12000 });
          const parsed = result.parsed;

          if (type === 'trade-review') return tradeReviewInsightSchema.parse(parsed);
          if (type === 'session-review') return sessionReviewInsightSchema.parse(parsed);
          return boardScenariosInsightSchema.parse(parsed);
        }

        const fallback = deterministicGenerate(type, {
          referenceId: body.referenceId,
          version,
          context: builtContext,
        });

        if (type === 'trade-review') return tradeReviewInsightSchema.parse(fallback);
        if (type === 'session-review') return sessionReviewInsightSchema.parse(fallback);
        return boardScenariosInsightSchema.parse(fallback);
      },
      { maxAttempts: 3, baseDelayMs: 250, maxDelayMs: 2000 },
      isRetryableUpstream
    );

    const critic = await runCritic({
      referenceId: body.referenceId,
      version,
      context: builtContext,
      insight: insight as unknown as JsonObject,
      timeoutMs: 8000,
      model,
    });

    const finalInsight = {
      ...insight,
      critic,
    } as AnyInsight;

    const latencyMs = Date.now() - started;
    const response = ok(finalInsight, {
      model: env.OPENAI_API_KEY ? model : 'stub-deterministic',
      latencyMs,
      version,
      confidence: critic.adjustedConfidence,
      warnings: critic.issues.length ? critic.notes : [],
      cache: { key: cacheKey, hit: false, isStale: false, source: env.OPENAI_API_KEY ? 'llm' : 'llm' },
    });

    kvSet(kvKey, response, kvTTL.reasoningCache);

    return response;
  } catch (e) {
    const latencyMs = Date.now() - started;
    const mapped = mapEngineError(e);
    return err({
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
  req: ParsedRequest,
  body: InsightCriticRequest
): Promise<ReasoningResponse<InsightCriticOnlyResult>> {
  const started = Date.now();
  const env = getEnv();
  const version = body.version || REASONING_CONTRACT_VERSION;
  const model = env.OPUS_MODEL || 'gpt-4o-mini';

  const builtContext = buildReasoningContext({
    userId: req.userId,
    type: 'insight-critic',
    referenceId: body.referenceId,
    context: body.context,
  });

  const { key: cacheKey } = buildReasoningCacheKey({
    type: 'insight-critic',
    referenceId: body.referenceId,
    version,
    context: builtContext,
  });

  const kvKey = kvKeys.reasoningCache('insight-critic', body.referenceId, version, cacheKey);
  const cached = kvGet<ReasoningResponse<InsightCriticOnlyResult>>(kvKey);
  if (cached) {
    return {
      ...cached,
      meta: {
        ...cached.meta,
        requestId: getRequestId(),
        cache: { key: cacheKey, hit: true, isStale: true, source: 'backend' },
      },
    };
  }

  try {
    const report = await runCritic({
      referenceId: body.referenceId,
      version,
      context: builtContext,
      insight: body.insight,
      timeoutMs: 8000,
      model,
    });

    const payload = insightCriticOnlyResultSchema.parse({
      type: 'insight-critic',
      referenceId: body.referenceId,
      report,
    });

    const latencyMs = Date.now() - started;
    const response = ok(payload, {
      model: env.OPENAI_API_KEY ? model : 'stub-deterministic',
      latencyMs,
      version,
      confidence: report.adjustedConfidence,
      warnings: report.issues.length ? report.notes : [],
      cache: { key: cacheKey, hit: false, isStale: false, source: env.OPENAI_API_KEY ? 'llm' : 'llm' },
    });

    kvSet(kvKey, response, kvTTL.reasoningCache);

    return response;
  } catch (e) {
    const latencyMs = Date.now() - started;
    const mapped = mapEngineError(e);
    return err({
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


