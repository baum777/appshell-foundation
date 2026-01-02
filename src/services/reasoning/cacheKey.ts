import type { JsonObject, ReasoningType } from '@/lib/reasoning/types';
import { stableStringify } from './stableJson';
import { hashSha256Hex } from './hash';

export async function buildReasoningCacheKey(input: {
  type: ReasoningType;
  referenceId: string;
  version: string;
  context: JsonObject;
}): Promise<{ key: string; contextHash: string }> {
  const contextJson = stableStringify(input.context);
  const contextHash = await hashSha256Hex(contextJson);
  const key = `${input.type}:${input.referenceId}:${input.version}:${contextHash}`;
  return { key, contextHash };
}


