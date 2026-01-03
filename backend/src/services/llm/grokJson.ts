import { callGrok } from '../../clients/grokClient.js';
import type { LLMRequest, LLMUseCase } from '../../routes/reasoning/types.js';
import { logger } from '../../observability/logger.js';

export async function generateGrokJson<T>(
  system: string,
  prompt: string,
  useCase: LLMUseCase,
  options: Partial<LLMRequest> = {}
): Promise<T | null> {
  const request: LLMRequest = {
    model: options.model || 'grok-beta',
    timeoutMs: options.timeoutMs || 10000,
    prompt,
    system,
    jsonOnly: true,
    ...options
  };

  try {
    const response = await callGrok(request, { useCase });
    
    if (response.parsed) {
      return response.parsed as T;
    }
    
    // Fallback if parsed is missing but rawText exists (should be handled by callGrok but double check)
    if (response.rawText) {
        try {
            return JSON.parse(response.rawText) as T;
        } catch {
            logger.warn('Grok JSON parsing failed manually', { rawText: response.rawText });
            return null;
        }
    }
    
    return null;
  } catch (error) {
    logger.warn('Grok generation failed', { error: String(error), useCase });
    return null;
  }
}

