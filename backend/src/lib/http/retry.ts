import { logger } from '../../observability/logger.js';

export interface RetryOptions {
  attempts?: number; // default 3
  baseMs?: number; // default 250
  maxMs?: number; // default 4000
  retryOn?: (err: unknown) => boolean;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryAfterMs(err: any): number | null {
  const headers = err?.response?.headers || err?.headers;
  if (!headers) return null;
  
  // Headers can be a Headers object or a plain object
  const retryAfter = typeof headers.get === 'function' 
    ? headers.get('retry-after') 
    : (headers['retry-after'] || headers['Retry-After']);
    
  if (!retryAfter) return null;
  
  // Seconds
  if (/^\d+$/.test(String(retryAfter))) {
    return parseInt(String(retryAfter), 10) * 1000;
  }
  
  // Date
  const date = Date.parse(String(retryAfter));
  if (!isNaN(date)) {
    return Math.max(0, date - Date.now());
  }
  
  return null;
}

function isNetworkErrorOr5xx(err: any): boolean {
    if (!err) return false;
    const status = err.status || err.statusCode;
    
    // Retry on 429
    if (status === 429) return true;
    
    // Retry on 5xx
    if (typeof status === 'number' && status >= 500 && status <= 599) return true;
    
    // Network errors
    if (err.code && ['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED'].includes(err.code)) return true;
    
    // Fetch AbortError usually means timeout if caused by AbortController
    if (err.name === 'AbortError') return true; 

    return false;
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const baseMs = opts.baseMs ?? 250;
  const maxMs = opts.maxMs ?? 4000;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err: any) {
      lastError = err;
      
      // If this was the last attempt, rethrow
      if (attempt === attempts) break;
      
      // Check if retryable
      const isRetryable = opts.retryOn ? opts.retryOn(err) : isNetworkErrorOr5xx(err);
      if (!isRetryable) throw err;
      
      // Calculate delay
      let delay = Math.min(maxMs, baseMs * Math.pow(2, attempt - 1));
      
      // Jitter (randomize between 0.8x and 1.2x)
      delay = delay * (0.8 + Math.random() * 0.4);
      
      // Check Retry-After override
      if (err?.status === 429 || err?.statusCode === 429) {
          const retryAfterMs = getRetryAfterMs(err);
          if (retryAfterMs !== null) {
              delay = retryAfterMs;
              // If retry-after is extremely long, maybe we shouldn't retry? 
              // But requirements say "respect Retry-After". 
              // We might want to cap it to avoid hanging forever, but let's stick to simple logic for now.
          }
      }
      
      logger.warn(`Retry attempt ${attempt}/${attempts} failed`, { 
        error: err instanceof Error ? err.message : String(err),
        nextRetryMs: Math.round(delay)
      });
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

