import { getRequestId } from '../http/requestId.js';
import { getConfig } from '../config/config.js';

/**
 * Structured Logger
 * Includes request context when available
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

interface LogEntry {
  level: LogLevel;
  message: string;
  requestId?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function shouldLog(level: LogLevel): boolean {
  try {
    const config = getConfig();
    return LOG_LEVELS[level] >= LOG_LEVELS[config.logging.level];
  } catch {
    // Config not loaded yet, default to info
    return LOG_LEVELS[level] >= LOG_LEVELS.info;
  }
}

function formatLog(entry: LogEntry): string {
  const { level, message, requestId, timestamp, data } = entry;
  
  const parts = [
    `[${timestamp}]`,
    `[${level.toUpperCase()}]`,
  ];
  
  if (requestId && requestId !== 'no-request-context') {
    parts.push(`[${requestId}]`);
  }
  
  parts.push(message);
  
  if (data && Object.keys(data).length > 0) {
    parts.push(JSON.stringify(data));
  }
  
  return parts.join(' ');
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) {
    return;
  }
  
  const entry: LogEntry = {
    level,
    message,
    requestId: getRequestId(),
    timestamp: new Date().toISOString(),
    data,
  };
  
  const formatted = formatLog(entry);
  
  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
};
