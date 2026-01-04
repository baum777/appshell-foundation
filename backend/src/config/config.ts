import { getEnv, type Env } from './env.js';

/**
 * Application Configuration
 * Derives configuration values from environment
 */

export interface AppConfig {
  env: Env;
  isDev: boolean;
  isTest: boolean;
  isProd: boolean;
  server: {
    port: number;
    apiBasePath: string;
  };
  database: {
    url: string;
    path: string;
  };
  logging: {
    level: Env['LOG_LEVEL'];
  };
  version: string;
}

export function createConfig(): AppConfig {
  const env = getEnv();

  // Prefer DATABASE_URL (format: sqlite:./path/to/file.sqlite), fall back to DATABASE_PATH.
  const dbUrl = env.DATABASE_URL || `sqlite:${env.DATABASE_PATH}`;
  const dbPath = dbUrl.replace(/^sqlite:/, '');

  return {
    env,
    isDev: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    isProd: env.NODE_ENV === 'production',
    server: {
      port: env.BACKEND_PORT ?? env.PORT,
      apiBasePath: env.API_BASE_PATH,
    },
    database: {
      url: dbUrl,
      path: dbPath,
    },
    logging: {
      level: env.LOG_LEVEL,
    },
    version: process.env.npm_package_version || '1.0.0',
  };
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = createConfig();
  }
  return cachedConfig;
}

export function resetConfigCache(): void {
  cachedConfig = null;
}
