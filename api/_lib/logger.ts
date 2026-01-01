/**
 * Structured Logging Helper
 * Per VERCEL_COMPATIBLE_BACKEND.md - log requestId + route + duration
 * Never log secrets or raw wallet addresses
 */

import { getRequestId } from './request-id';
import { getEnv } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  requestId: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function shouldLog(level: LogLevel): boolean {
  const env = getEnv();
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const configuredLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';
  return levels.indexOf(level) >= levels.indexOf(configuredLevel);
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    requestId: getRequestId(),
    timestamp: new Date().toISOString(),
    data,
  };

  // Use structured JSON logging for Vercel
  const output = JSON.stringify(entry);
  
  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
};
