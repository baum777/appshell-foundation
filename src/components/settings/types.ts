// Settings Store Types & Constants
// LocalStorage key: app_settings_v1

export type TierLevel = 'FREE' | 'PRO' | 'VIP' | 'ADMIN';
export type Provider = 'openai' | 'deepseek' | 'grok';
export type UseCase = 'journal' | 'insights' | 'charts' | 'reasoning' | 'reasoning_critic' | 'grok_pulse';

export interface BudgetRow {
  provider: Provider;
  useCase: UseCase;
  callsPerDay: number;
  custom: boolean; // VIP/ADMIN: if true, persists across tier changes
}

export interface TierConfig {
  level: TierLevel;
  maxCallsPerMinute: number;
  maxConcurrentCalls: number;
  adminFailOpen?: boolean; // ADMIN only
  customThrottles?: boolean; // VIP/ADMIN: if true, throttles persist
}

export interface ProviderConfig {
  openai: {
    modelJournal: string;
    modelInsights: string;
    modelCharts: string;
    timeoutMs: number;
    maxRetries: number;
    jsonStrict: boolean;
  };
  deepseek: {
    modelReasoning: string;
    timeoutMs: number;
    maxRetries: number;
    jsonStrict: boolean; // locked read-only
  };
  grok: {
    modelPulse: string;
    refreshIntervalMin: number;
    timeoutMs: number;
    maxRetries: number;
    jsonStrict: boolean;
  };
}

export interface CacheConfig {
  enableIndexedDB: boolean;
  maxEntries: number;
  reasoning: { ttlMin: number };
  grokPulse: { ttlMin: number };
}

export interface AlertsConfig {
  cooldownMin: number;
  maxActive: number;
}

export interface PushConfig {
  enabled: boolean;
}

export interface DiagnosticsConfig {
  enableMetrics: boolean;
  storeLastNEvents: number;
}

export interface PrivacyConfig {
  redactPromptsInLogs: boolean;
}

export interface RiskConfig {
  defaultPercent: number;
  maxPosition: number;
  stopType: 'percent' | 'atr' | 'fixed';
}

export interface UIConfig {
  theme: 'dark';
  reduceMotion: boolean;
  compactMode: boolean;
}

export interface ChartConfig {
  defaultTimeframe: string;
  candleStyle: 'candles' | 'heikin-ashi' | 'bars';
  showVolume: boolean;
}

export interface BackupConfig {
  lastExportAt: string | null;
}

export interface ConnectedWallet {
  address: string;
  label?: string;
  connectedAt: string;
}

export interface AppSettingsV1 {
  version: 1;
  tier: TierConfig;
  budgets: BudgetRow[];
  providers: ProviderConfig;
  cache: CacheConfig;
  alerts: AlertsConfig;
  push: PushConfig;
  diagnostics: DiagnosticsConfig;
  privacy: PrivacyConfig;
  risk: RiskConfig;
  ui: UIConfig;
  chart: ChartConfig;
  backup: BackupConfig;
  connectedWallets: ConnectedWallet[];
}

// Tier defaults
export const TIER_DEFAULTS: Record<TierLevel, { budgets: Omit<BudgetRow, 'custom'>[]; maxCallsPerMinute: number; maxConcurrentCalls: number }> = {
  FREE: {
    budgets: [
      { provider: 'openai', useCase: 'journal', callsPerDay: 10 },
      { provider: 'openai', useCase: 'insights', callsPerDay: 10 },
      { provider: 'openai', useCase: 'charts', callsPerDay: 20 },
      { provider: 'deepseek', useCase: 'reasoning', callsPerDay: 15 },
      { provider: 'deepseek', useCase: 'reasoning_critic', callsPerDay: 15 },
      { provider: 'grok', useCase: 'grok_pulse', callsPerDay: 30 },
    ],
    maxCallsPerMinute: 30,
    maxConcurrentCalls: 2,
  },
  PRO: {
    budgets: [
      { provider: 'openai', useCase: 'journal', callsPerDay: 50 },
      { provider: 'openai', useCase: 'insights', callsPerDay: 50 },
      { provider: 'openai', useCase: 'charts', callsPerDay: 200 },
      { provider: 'deepseek', useCase: 'reasoning', callsPerDay: 80 },
      { provider: 'deepseek', useCase: 'reasoning_critic', callsPerDay: 80 },
      { provider: 'grok', useCase: 'grok_pulse', callsPerDay: 200 },
    ],
    maxCallsPerMinute: 60,
    maxConcurrentCalls: 4,
  },
  VIP: {
    budgets: [
      { provider: 'openai', useCase: 'journal', callsPerDay: 200 },
      { provider: 'openai', useCase: 'insights', callsPerDay: 200 },
      { provider: 'openai', useCase: 'charts', callsPerDay: 800 },
      { provider: 'deepseek', useCase: 'reasoning', callsPerDay: 300 },
      { provider: 'deepseek', useCase: 'reasoning_critic', callsPerDay: 300 },
      { provider: 'grok', useCase: 'grok_pulse', callsPerDay: 800 },
    ],
    maxCallsPerMinute: 120,
    maxConcurrentCalls: 6,
  },
  ADMIN: {
    budgets: [
      { provider: 'openai', useCase: 'journal', callsPerDay: 9999 },
      { provider: 'openai', useCase: 'insights', callsPerDay: 9999 },
      { provider: 'openai', useCase: 'charts', callsPerDay: 9999 },
      { provider: 'deepseek', useCase: 'reasoning', callsPerDay: 9999 },
      { provider: 'deepseek', useCase: 'reasoning_critic', callsPerDay: 9999 },
      { provider: 'grok', useCase: 'grok_pulse', callsPerDay: 9999 },
    ],
    maxCallsPerMinute: 999,
    maxConcurrentCalls: 20,
  },
};

export const DEFAULT_SETTINGS: AppSettingsV1 = {
  version: 1,
  tier: {
    level: 'FREE',
    maxCallsPerMinute: TIER_DEFAULTS.FREE.maxCallsPerMinute,
    maxConcurrentCalls: TIER_DEFAULTS.FREE.maxConcurrentCalls,
  },
  budgets: TIER_DEFAULTS.FREE.budgets.map(b => ({ ...b, custom: false })),
  providers: {
    openai: {
      modelJournal: 'gpt-4o-mini',
      modelInsights: 'gpt-4o-mini',
      modelCharts: 'gpt-4o-mini',
      timeoutMs: 12000,
      maxRetries: 2,
      jsonStrict: true,
    },
    deepseek: {
      modelReasoning: 'deepseek-chat',
      timeoutMs: 12000,
      maxRetries: 2,
      jsonStrict: true, // locked read-only
    },
    grok: {
      modelPulse: 'grok-2',
      refreshIntervalMin: 15,
      timeoutMs: 12000,
      maxRetries: 2,
      jsonStrict: true,
    },
  },
  cache: {
    enableIndexedDB: true,
    maxEntries: 500,
    reasoning: { ttlMin: 60 },
    grokPulse: { ttlMin: 15 },
  },
  alerts: {
    cooldownMin: 10,
    maxActive: 50,
  },
  push: {
    enabled: false,
  },
  diagnostics: {
    enableMetrics: true,
    storeLastNEvents: 200,
  },
  privacy: {
    redactPromptsInLogs: true,
  },
  risk: {
    defaultPercent: 2,
    maxPosition: 10,
    stopType: 'percent',
  },
  ui: {
    theme: 'dark',
    reduceMotion: false,
    compactMode: false,
  },
  chart: {
    defaultTimeframe: '1H',
    candleStyle: 'candles',
    showVolume: true,
  },
  backup: {
    lastExportAt: null,
  },
  connectedWallets: [],
};

// Routing map (read-only)
export const ROUTING_MAP: Record<UseCase, Provider> = {
  journal: 'openai',
  insights: 'openai',
  charts: 'openai',
  reasoning: 'deepseek',
  reasoning_critic: 'deepseek',
  grok_pulse: 'grok',
};

// Use case display names
export const USE_CASE_LABELS: Record<UseCase, string> = {
  journal: 'Journal',
  insights: 'Insights',
  charts: 'Charts',
  reasoning: 'Reasoning',
  reasoning_critic: 'Critic',
  grok_pulse: 'Pulse',
};

// Provider display names
export const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  grok: 'Grok',
};
