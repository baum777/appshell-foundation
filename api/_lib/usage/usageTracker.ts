import { kv } from '../kv';
import type { Provider, UseCase } from '../budget/types';

export class UsageTracker {
  private static instance: UsageTracker;

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  private getDayKey(now: number): string {
    return new Date(now).toISOString().split('T')[0];
  }

  private getKeyPrefix(date: string, provider: Provider, useCase: UseCase): string {
    return `usage:v1:day:${date}:${provider}:${useCase}`;
  }

  async recordCall(provider: Provider, useCase: UseCase, now: number = Date.now()): Promise<void> {
    const date = this.getDayKey(now);
    const key = `${this.getKeyPrefix(date, provider, useCase)}:calls`;
    await kv.incr(key, 1, 35 * 24 * 3600); 
  }

  async recordError(provider: Provider, useCase: UseCase, now: number = Date.now()): Promise<void> {
    const date = this.getDayKey(now);
    const key = `${this.getKeyPrefix(date, provider, useCase)}:errors`;
    await kv.incr(key, 1, 35 * 24 * 3600);
  }

  async recordCacheHit(provider: Provider, useCase: UseCase, now: number = Date.now()): Promise<void> {
    const date = this.getDayKey(now);
    const key = `${this.getKeyPrefix(date, provider, useCase)}:cacheHit`;
    await kv.incr(key, 1, 35 * 24 * 3600);
  }

  async recordLatency(provider: Provider, useCase: UseCase, latencyMs: number, now: number = Date.now()): Promise<void> {
    const date = this.getDayKey(now);
    const prefix = this.getKeyPrefix(date, provider, useCase);
    
    await Promise.all([
      kv.incr(`${prefix}:latencySumMs`, latencyMs, 35 * 24 * 3600),
      kv.incr(`${prefix}:latencyCount`, 1, 35 * 24 * 3600)
    ]);
  }

  async recordTokens(provider: Provider, useCase: UseCase, tokensIn: number | null, tokensOut: number | null, now: number = Date.now()): Promise<void> {
    const date = this.getDayKey(now);
    const prefix = this.getKeyPrefix(date, provider, useCase);

    const promises: Promise<any>[] = [];
    if (tokensIn !== null) {
      promises.push(kv.incr(`${prefix}:tokensIn`, tokensIn, 35 * 24 * 3600));
    }
    if (tokensOut !== null) {
      promises.push(kv.incr(`${prefix}:tokensOut`, tokensOut, 35 * 24 * 3600));
    }
    await Promise.all(promises);
  }

  async getUsage(provider: Provider, useCase: UseCase, now: number = Date.now()): Promise<number> {
    const date = this.getDayKey(now);
    const key = `${this.getKeyPrefix(date, provider, useCase)}:calls`;
    const val = await kv.get<number>(key);
    return val || 0;
  }
  
  async getUseCaseStats(provider: Provider, useCase: UseCase, now: number = Date.now()) {
      const date = this.getDayKey(now);
      const prefix = this.getKeyPrefix(date, provider, useCase);
      
      const [calls, errors, cacheHit, latencySum, latencyCount, tokensIn, tokensOut] = await Promise.all([
          kv.get<number>(`${prefix}:calls`),
          kv.get<number>(`${prefix}:errors`),
          kv.get<number>(`${prefix}:cacheHit`),
          kv.get<number>(`${prefix}:latencySumMs`),
          kv.get<number>(`${prefix}:latencyCount`),
          kv.get<number>(`${prefix}:tokensIn`),
          kv.get<number>(`${prefix}:tokensOut`),
      ]);
      
      return {
          calls: calls || 0,
          errors: errors || 0,
          cacheHit: cacheHit || 0,
          latencyMean: latencyCount ? (latencySum || 0) / latencyCount : 0,
          latencySum: latencySum || 0,
          latencyCount: latencyCount || 0,
          tokensIn: tokensIn || 0,
          tokensOut: tokensOut || 0
      };
  }
}

export const usageTracker = UsageTracker.getInstance();

