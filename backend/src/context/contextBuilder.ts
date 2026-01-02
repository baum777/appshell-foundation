import type { JsonObject, ReasoningType } from '../routes/reasoning/types.js';

export interface ReasoningContextBuildInput {
  userId: string;
  type: ReasoningType;
  referenceId: string;
  context: JsonObject;
}

/**
 * Context Builder (Reasoning)
 * - Normalizes and enriches the incoming UI context with server metadata.
 * - Keeps output strictly JSON-serializable.
 */
export function buildReasoningContext(input: ReasoningContextBuildInput): JsonObject {
  // Defensive cap: keep metadata small and deterministic.
  const meta: JsonObject = {
    userId: input.userId,
    type: input.type,
    referenceId: input.referenceId,
    serverTime: new Date().toISOString(),
  };

  return {
    meta,
    context: input.context,
  };
}


