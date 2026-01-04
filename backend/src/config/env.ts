import { z } from 'zod';
import { logger } from '../observability/logger.js';
import dotenv from 'dotenv';

// Load environment variables
export function loadEnv() {
  const result = dotenv.config();
  if (result.error) {
    logger.warn('Failed to load .env file', { error: String(result.error) });
  }
}

// Environment Schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_PATH: z.string().default('./.data/tradeapp.sqlite'),
  // Optional explicit DB URL (preferred by config.ts). Keep default aligned with DATABASE_PATH.
  DATABASE_URL: z.string().default('sqlite:./.data/tradeapp.sqlite'),
  API_BASE_PATH: z.string().default('/api'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Compat: some modules expect BACKEND_PORT (fallback to PORT in config.ts)
  BACKEND_PORT: z.string().transform(Number).optional(),
  
  // Auth
  API_KEY: z.string().optional(),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  
  // Push
  VAPID_SUBJECT: z.string().default('mailto:admin@example.com'),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  
  // AI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  OPENAI_MODEL_JOURNAL: z.string().optional(),
  OPENAI_MODEL_INSIGHTS: z.string().optional(),
  OPENAI_MODEL_CHARTS: z.string().optional(),
  
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().default('https://api.deepseek.com'),
  DEEPSEEK_MODEL_REASONING: z.string().default('deepseek-reasoner'),

  // xAI (Grok)
  GROK_API_KEY: z.string().optional(),
  GROK_BASE_URL: z.string().optional(),

  // Optional override model name used by some code paths
  OPUS_MODEL: z.string().optional(),

  // DexPaprika
  DEXPAPRIKA_BASE_URL: z.string().default('https://api.dexpaprika.com/v1'), // Adjust default as needed
  DEXPAPRIKA_API_KEY: z.string().optional(),

  // Moralis
  MORALIS_API_KEY: z.string().optional(),
  MORALIS_BASE_URL: z.string().optional(),
  GROK_PULSE_CRON_SECRET: z.string().optional(),
  MAX_DAILY_GROK_CALLS: z.string().transform(Number).default('900'),
  PULSE_TOKEN_ADDRESSES: z.string().default(''), // comma-separated
  
  // Rate limiting defaults
  REFRESH_LOCK_TTL_SECONDS: z.string().transform(Number).default('60'),
  SNAPSHOT_TTL_SECONDS: z.string().transform(Number).default('300'),
  PROVIDER_COOLDOWN_SECONDS: z.string().transform(Number).default('30'),

  // Vercel KV
  KV_REST_API_URL: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),

  // Monitoring
  WATCHER_INTERVAL_MS: z.string().transform(Number).default('5000'),
  EVALUATION_BATCH_SIZE: z.string().transform(Number).default('200'),
  EVENT_RETENTION_DAYS: z.string().transform(Number).default('30'),
  SSE_HEARTBEAT_MS: z.string().transform(Number).default('20000'),
});

export type Env = z.infer<typeof envSchema>;
// Backwards-compat alias used by config/logger typing in some branches.
export type BackendEnv = Env;

let envCache: Env | null = null;

export function getEnv(): Env {
  if (envCache) return envCache;
  
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    logger.error('Invalid environment variables', { errors: parsed.error.format() });
    throw new Error('Invalid environment variables');
  }
  
  envCache = parsed.data;
  return envCache;
}

export function resetEnvCache(): void {
  envCache = null;
}
