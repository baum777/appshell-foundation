import type { ReasoningResponse, ReasoningType } from '@/lib/reasoning/types';

export interface ReasoningCacheRow {
  key: string;
  type: ReasoningType;
  referenceId: string;
  version: string;
  contextHash: string;
  updatedAt: string; // ISO
  response: ReasoningResponse<unknown>;
}


