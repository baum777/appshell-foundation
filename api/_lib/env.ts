/**
 * Environment Configuration for Vercel Serverless
 * Validates and provides typed access to environment variables
 */

export interface BackendEnv {
  NODE_ENV: 'development' | 'test' | 'production';
  // Vercel KV (required for production)
  KV_REST_API_URL?: string;
  KV_REST_API_TOKEN?: string;
  KV_REST_API_READ_ONLY_TOKEN?: string;
  // External providers (optional, stub if missing)
  DEXPAPRIKA_API_KEY?: string;
  MORALIS_API_KEY?: string;
  // AI (optional)
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL_JOURNAL?: string;
  OPENAI_MODEL_INSIGHTS?: string;
  OPENAI_MODEL_CHARTS?: string;
  
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_BASE_URL?: string;
  DEEPSEEK_MODEL_REASONING?: string;

  OPUS_MODEL?: string;
  // Optional upstream backend (e.g. Railway) for reasoning routes
  REASONING_BACKEND_URL?: string;
}

let cachedEnv: BackendEnv | null = null;

export function getEnv(): BackendEnv {
  if (cachedEnv) return cachedEnv;

  cachedEnv = {
    NODE_ENV: (process.env.NODE_ENV as BackendEnv['NODE_ENV']) || 'development',
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    DEXPAPRIKA_API_KEY: process.env.DEXPAPRIKA_API_KEY,
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
    
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_MODEL_JOURNAL: process.env.OPENAI_MODEL_JOURNAL,
    OPENAI_MODEL_INSIGHTS: process.env.OPENAI_MODEL_INSIGHTS,
    OPENAI_MODEL_CHARTS: process.env.OPENAI_MODEL_CHARTS,
    
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    DEEPSEEK_MODEL_REASONING: process.env.DEEPSEEK_MODEL_REASONING,

    OPUS_MODEL: process.env.OPUS_MODEL,
    REASONING_BACKEND_URL: process.env.REASONING_BACKEND_URL,
  };

  return cachedEnv;
}

export function resetEnvCache(): void {
  cachedEnv = null;
}

export function hasVercelKV(): boolean {
  const env = getEnv();
  return Boolean(env.KV_REST_API_URL && env.KV_REST_API_TOKEN);
}

export function hasProviderKeys(): boolean {
  const env = getEnv();
  return Boolean(env.DEXPAPRIKA_API_KEY || env.MORALIS_API_KEY);
}

export function isProd(): boolean {
  return getEnv().NODE_ENV === 'production';
}

export function isDev(): boolean {
  return getEnv().NODE_ENV === 'development';
}

export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}
