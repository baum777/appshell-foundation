import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOffline } from '@/components/offline';
import type { InsightCriticOnlyResult, JsonObject, ReasoningResponse } from '@/lib/reasoning/types';
import { REASONING_CONTRACT_VERSION } from '@/lib/reasoning/types';
import { dbService } from '@/services/db/db';
import { buildReasoningCacheKey } from '@/services/reasoning/cacheKey';
import { reasoningApi, type ReasoningOfflineFirstResult } from '@/services/reasoning/reasoningApi';
import { stableStringify } from '@/services/reasoning/stableJson';

function offlineError(version: string): ReasoningResponse<InsightCriticOnlyResult> {
  return {
    status: 'error',
    data: null,
    warnings: [],
    confidence: 0,
    meta: { latency_ms: 0, model: 'client', version },
    error: { code: 'UPSTREAM_ERROR', message: 'Offline and no cached insight available', retryable: true },
  };
}

export function useInsightCritic(input: {
  referenceId: string;
  context: JsonObject;
  insight: JsonObject;
  version?: string;
}) {
  const { isOnline } = useOffline();
  const queryClient = useQueryClient();
  const version = input.version ?? REASONING_CONTRACT_VERSION;
  const contextKey = stableStringify(input.context);
  const insightKey = stableStringify(input.insight);

  const queryKey = ['reasoning', 'insight-critic', input.referenceId, version, contextKey, insightKey] as const;

  useEffect(() => {
    let cancelled = false;
    async function loadCached() {
      const { key } = await buildReasoningCacheKey({
        type: 'insight-critic',
        referenceId: input.referenceId,
        version,
        context: { ...input.context, __insight: input.insight },
      });

      const cached = await dbService.getReasoning(key);
      if (cancelled) return;

      const existing = queryClient.getQueryData<ReasoningOfflineFirstResult<InsightCriticOnlyResult>>(queryKey);
      if (existing) return;

      if (cached?.response) {
        queryClient.setQueryData(queryKey, {
          response: cached.response as ReasoningResponse<InsightCriticOnlyResult>,
          isStale: true,
          cacheKey: key,
        });
      } else if (!isOnline) {
        queryClient.setQueryData(queryKey, {
          response: offlineError(version),
          isStale: true,
          cacheKey: key,
        });
      }
    }
    if (input.referenceId) {
      loadCached().catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [input.referenceId, version, contextKey, insightKey, isOnline, queryClient]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      reasoningApi.insightCritic({
        referenceId: input.referenceId,
        context: input.context,
        insight: input.insight,
        version,
      }),
    enabled: Boolean(input.referenceId) && isOnline,
  });

  const result = query.data;

  return {
    ...query,
    response: result?.response,
    report: result?.response.data?.report ?? null,
    confidence: result?.response.confidence ?? 0,
    isStale: result?.isStale ?? true,
  };
}


