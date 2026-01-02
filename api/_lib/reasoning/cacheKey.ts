import type { JsonObject, ReasoningType } from './types';
import { stableStringify } from './stableJson';
import { sha256Hex } from './hash';

export function buildReasoningCacheKey(input: {
  type: ReasoningType;
  referenceId: string;
  version: string;
  context: JsonObject;
}): { key: string; contextHash: string } {
  const contextJson = stableStringify(input.context);
  const contextHash = sha256Hex(contextJson);
  const key = `${input.type}:${input.referenceId}:${input.version}:${contextHash}`;
  return { key, contextHash };
}


