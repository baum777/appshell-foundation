import { getEnv } from '../config/env.js';
import type { LLMUseCase, LLMRequest, LLMResponse } from '../routes/reasoning/types.js';
import { callOpenAI } from './openaiClient.js';
import { callDeepSeek } from './deepseekClient.js';
import { callGrok } from './grokClient.js';

export async function routeLLMRequest(
  useCase: LLMUseCase,
  request: Omit<LLMRequest, 'model'> & { model?: string }
): Promise<LLMResponse> {
  const env = getEnv();
  const baseRequest: LLMRequest = {
    ...request,
    model: request.model || 'gpt-4o-mini', // default placeholder, overridden below
  };

  switch (useCase) {
    case 'journal':
      baseRequest.model = request.model || env.OPENAI_MODEL_JOURNAL || 'gpt-4o-mini';
      return callOpenAI(baseRequest);
      
    case 'insights':
      baseRequest.model = request.model || env.OPENAI_MODEL_INSIGHTS || 'gpt-4o-mini';
      return callOpenAI(baseRequest);
      
    case 'charts':
      baseRequest.model = request.model || env.OPENAI_MODEL_CHARTS || 'gpt-4o-mini';
      return callOpenAI(baseRequest);
      
    case 'reasoning':
    case 'reasoning_critic':
      // Enforce DeepSeek
      if (!env.DEEPSEEK_API_KEY) {
        throw new Error('MISSING_DEEPSEEK_KEY');
      }
      baseRequest.model = request.model || env.DEEPSEEK_MODEL_REASONING || env.OPUS_MODEL || 'deepseek-reasoner';
      return callDeepSeek(baseRequest);
      
    case 'grok_pulse':
      return callGrok(baseRequest);
      
    default:
      throw new Error(`Unknown use-case: ${useCase}`);
  }
}

