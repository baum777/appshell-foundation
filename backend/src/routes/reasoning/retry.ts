export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  cfg: RetryConfig,
  isRetryable: (error: unknown) => boolean
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt >= cfg.maxAttempts || !isRetryable(err)) {
        break;
      }

      const exp = cfg.baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(exp * (0.1 * (Math.random() * 2 - 1))); // ±10%
      const delay = Math.min(cfg.maxDelayMs, Math.max(0, exp + jitter));
      await sleep(delay);
    }
  }

  throw lastError;
}


