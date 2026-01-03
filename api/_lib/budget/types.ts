export type Provider = 'openai' | 'deepseek' | 'grok';
export type UseCase = 'journal' | 'insights' | 'charts' | 'reasoning' | 'reasoning_critic' | 'grok_pulse';
export type Tier = 'free' | 'pro' | 'whale';

export interface AppSettingsV1 {
  tier: Tier;
  customBudgets?: Partial<Record<string, number>>; // key is "provider:useCase"
  adminFailOpen?: boolean;
}

export interface BudgetCheckParams {
  provider: Provider;
  useCase: UseCase;
  userId?: string;
  ip?: string;
  now: number; // timestamp
  settings: AppSettingsV1;
  estimatedTokens?: number;
}

export interface BudgetResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  recoverable?: boolean;
}

export const TIER_LIMITS: Record<Tier, Record<string, number>> = {
  free: {
    'openai:journal': 10,
    'openai:insights': 5,
    'openai:charts': 5,
    'deepseek:reasoning': 2,
    'deepseek:reasoning_critic': 2,
    'grok:grok_pulse': 5,
    'global:maxCallsPerMinute': 5,
    'global:maxConcurrentCalls': 2,
  },
  pro: {
    'openai:journal': 100,
    'openai:insights': 50,
    'openai:charts': 50,
    'deepseek:reasoning': 20,
    'deepseek:reasoning_critic': 20,
    'grok:grok_pulse': 50,
    'global:maxCallsPerMinute': 60,
    'global:maxConcurrentCalls': 10,
  },
  whale: {
    'openai:journal': 1000,
    'openai:insights': 500,
    'openai:charts': 500,
    'deepseek:reasoning': 200,
    'deepseek:reasoning_critic': 200,
    'grok:grok_pulse': 500,
    'global:maxCallsPerMinute': 120,
    'global:maxConcurrentCalls': 20,
  }
};

