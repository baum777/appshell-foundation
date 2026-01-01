import { z } from 'zod';

/**
 * Backend Environment Configuration
 * Validates and provides typed access to environment variables
 */

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  BACKEND_PORT: z.coerce.number().int().positive().default(3000),
  API_BASE_PATH: z.string().default('/api'),
  DATABASE_URL: z.string().default('sqlite:./.data/tradeapp.sqlite'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type BackendEnv = z.infer<typeof envSchema>;

let cachedEnv: BackendEnv | null = null;

export function loadEnv(): BackendEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function getEnv(): BackendEnv {
  if (!cachedEnv) {
    return loadEnv();
  }
  return cachedEnv;
}

export function resetEnvCache(): void {
  cachedEnv = null;
}
