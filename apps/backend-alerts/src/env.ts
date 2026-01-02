import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  API_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().min(1),
  VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  WATCHER_INTERVAL_MS: z.coerce.number().default(5000),
  EVALUATION_BATCH_SIZE: z.coerce.number().default(200),
  EVENT_RETENTION_DAYS: z.coerce.number().default(30),
  SSE_HEARTBEAT_MS: z.coerce.number().default(20000),
  ERROR_DEDUPE_MINUTES: z.coerce.number().default(10),
});

export const env = envSchema.parse(process.env);

