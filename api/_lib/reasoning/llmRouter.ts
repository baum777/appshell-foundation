import { getEnv } from '../env';
import type { LLMUseCase, LLMRequest, LLMResponse } from './types';
import { callOpenAI } from './openaiClient';
import { callDeepSeek } from './deepseekClient';
import { callGrok } from './grokClient';
import { checkGlobalRateLimit } from '../rate-limit';
import { checkAndConsumeBudget, releaseConcurrency } from '../budget/budgetGate';
import { getUserSettings } from '../budget/settings';
import { AppError, ErrorCodes } from '../errors';

export async function routeLLMRequest(
  useCase: LLMUseCase,
  request: Omit<LLMRequest, 'model'> & { model?: string },
  context?: { userId?: string, ip?: string }
): Promise<LLMResponse> {
  const env = getEnv();
  const userId = context?.userId || 'anon';
  
  // 1. Rate Limit (Global)
  const rlResult = await checkGlobalRateLimit(context?.ip, userId);
  if (!rlResult.allowed) {
      throw new AppError(rlResult.reason || 'Rate limit exceeded', 429, ErrorCodes.RATE_LIMITED);
  }

  // 2. Budget Gate
  const settings = await getUserSettings(userId);
  
  let provider: 'openai' | 'deepseek' | 'grok';
  switch (useCase) {
    case 'journal':
    case 'insights':
    case 'charts':
      provider = 'openai';
      break;
    case 'reasoning':
    case 'reasoning_critic':
      provider = 'deepseek';
      break;
    case 'grok_pulse':
      provider = 'grok';
      break;
    default:
       throw new AppError(`Unknown use-case: ${useCase}`, 400, ErrorCodes.VALIDATION_FAILED);
  }

  const budgetResult = await checkAndConsumeBudget({
      provider,
      useCase,
      userId,
      ip: context?.ip,
      now: Date.now(),
      settings
  });

  if (!budgetResult.allowed) {
      throw new AppError(budgetResult.reason || 'Budget exceeded', 429, ErrorCodes.BUDGET_EXCEEDED);
  }
  
  const baseRequest: LLMRequest = {
    ...request,
    model: request.model || 'gpt-4o-mini', 
  };

  try {
    switch (useCase) {
      case 'journal':
        baseRequest.model = request.model || env.OPENAI_MODEL_JOURNAL || 'gpt-4o-mini';
        // @ts-ignore - Step 4 will update signature
        return await callOpenAI(baseRequest, { useCase });
        
      case 'insights':
        baseRequest.model = request.model || env.OPENAI_MODEL_INSIGHTS || 'gpt-4o-mini';
        // @ts-ignore
        return await callOpenAI(baseRequest, { useCase });
        
      case 'charts':
        baseRequest.model = request.model || env.OPENAI_MODEL_CHARTS || 'gpt-4o-mini';
        // @ts-ignore
        return await callOpenAI(baseRequest, { useCase });
        
      case 'reasoning':
      case 'reasoning_critic':
        if (!env.DEEPSEEK_API_KEY) {
           throw new AppError('DeepSeek API key missing', 500, ErrorCodes.INTERNAL_ERROR);
        }
        baseRequest.model = request.model || env.DEEPSEEK_MODEL_REASONING || env.OPUS_MODEL || 'deepseek-reasoner';
        // @ts-ignore
        return await callDeepSeek(baseRequest, { useCase });
        
      case 'grok_pulse':
        // @ts-ignore
        return await callGrok(baseRequest, { useCase });
        
      default:
        throw new AppError(`Unknown use-case: ${useCase}`, 400, ErrorCodes.VALIDATION_FAILED);
    }
  } finally {
      // 6. Release Concurrency
      await releaseConcurrency(userId);
  }
}
