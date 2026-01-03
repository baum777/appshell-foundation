import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../lib/http/retry.js';

describe('Retry', () => {
  it('should return result on success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ status: 500 })
      .mockResolvedValue('ok');
      
    const result = await withRetry(fn, { baseMs: 1, attempts: 3 }); 
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should fail after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 500 });
    await expect(withRetry(fn, { attempts: 2, baseMs: 1 })).rejects.toEqual({ status: 500 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable error (e.g. 400)', async () => {
      const fn = vi.fn().mockRejectedValue({ status: 400 });
      await expect(withRetry(fn, { attempts: 3, baseMs: 1 })).rejects.toEqual({ status: 400 });
      expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should respect Retry-After header (seconds)', async () => {
    const errorWithHeader = {
        status: 429,
        headers: { get: (k: string) => k === 'retry-after' ? '1' : null }
    };
    
    vi.useFakeTimers();
    const fn = vi.fn()
      .mockRejectedValueOnce(errorWithHeader)
      .mockResolvedValue('ok');
      
    const promise = withRetry(fn, { attempts: 2, baseMs: 10 });
    
    // It should call once, then wait 1s
    expect(fn).toHaveBeenCalledTimes(1);
    
    await vi.advanceTimersByTimeAsync(1100); 
    
    await expect(promise).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
    
    vi.useRealTimers();
  });
});

