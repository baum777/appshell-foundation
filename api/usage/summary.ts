import { createHandler } from '../_lib/handler';
import { sendJson, setCacheHeaders } from '../_lib/response';
import { usageTracker } from '../_lib/usage/usageTracker';

export default createHandler({
  GET: async ({ res }) => {
    setCacheHeaders(res, { noStore: true });
    
    const now = Date.now();
    
    const openaiJournal = await usageTracker.getUseCaseStats('openai', 'journal', now);
    const openaiInsights = await usageTracker.getUseCaseStats('openai', 'insights', now);
    const openaiCharts = await usageTracker.getUseCaseStats('openai', 'charts', now);
    
    const deepseekReasoning = await usageTracker.getUseCaseStats('deepseek', 'reasoning', now);
    const deepseekCritic = await usageTracker.getUseCaseStats('deepseek', 'reasoning_critic', now);
    
    const grokPulse = await usageTracker.getUseCaseStats('grok', 'grok_pulse', now);
    
    const totalCalls = openaiJournal.calls + openaiInsights.calls + openaiCharts.calls + 
                       deepseekReasoning.calls + deepseekCritic.calls + grokPulse.calls;
                       
    const totalErrors = openaiJournal.errors + openaiInsights.errors + openaiCharts.errors +
                        deepseekReasoning.errors + deepseekCritic.errors + grokPulse.errors;
    
    const totalLatencySum = openaiJournal.latencySum + openaiInsights.latencySum + openaiCharts.latencySum +
                            deepseekReasoning.latencySum + deepseekCritic.latencySum + grokPulse.latencySum;
                            
    const totalLatencyCount = openaiJournal.latencyCount + openaiInsights.latencyCount + openaiCharts.latencyCount +
                              deepseekReasoning.latencyCount + deepseekCritic.latencyCount + grokPulse.latencyCount;
  
    const avgLatencyMs = totalLatencyCount > 0 ? totalLatencySum / totalLatencyCount : 0;
  
    sendJson(res, {
      status: 'success',
      data: {
        today: {
          openai: {
              journal: openaiJournal,
              insights: openaiInsights,
              charts: openaiCharts
          },
          deepseek: {
              reasoning: deepseekReasoning,
              reasoning_critic: deepseekCritic
          },
          grok: {
              grok_pulse: grokPulse
          }
        },
        totals: {
          calls: totalCalls,
          errors: totalErrors,
          avgLatencyMs
        },
        lastError: null
      }
    });
  },
});

