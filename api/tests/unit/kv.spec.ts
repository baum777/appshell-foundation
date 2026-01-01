/**
 * Unit Tests: KV Store
 * Tests for idempotency, TTL, and basic operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { memoryKVStore, clearMemoryStore } from '../../_lib/kv/memory-store';
import { kvKeys, kvTTL } from '../../_lib/kv/types';

describe('Memory KV Store', () => {
  beforeEach(() => {
    clearMemoryStore();
  });

  describe('Basic Operations', () => {
    it('sets and gets values', async () => {
      await memoryKVStore.set('test:key', { foo: 'bar' });
      const value = await memoryKVStore.get<{ foo: string }>('test:key');
      
      expect(value).toEqual({ foo: 'bar' });
    });

    it('returns null for missing keys', async () => {
      const value = await memoryKVStore.get('nonexistent');
      expect(value).toBeNull();
    });

    it('deletes values', async () => {
      await memoryKVStore.set('test:delete', 'value');
      const deleted = await memoryKVStore.delete('test:delete');
      const value = await memoryKVStore.get('test:delete');
      
      expect(deleted).toBe(true);
      expect(value).toBeNull();
    });

    it('returns false when deleting nonexistent key', async () => {
      const deleted = await memoryKVStore.delete('nonexistent');
      expect(deleted).toBe(false);
    });

    it('checks existence', async () => {
      await memoryKVStore.set('test:exists', 'value');
      
      expect(await memoryKVStore.exists('test:exists')).toBe(true);
      expect(await memoryKVStore.exists('nonexistent')).toBe(false);
    });

    it('increments counters', async () => {
      const v1 = await memoryKVStore.incr('test:counter');
      const v2 = await memoryKVStore.incr('test:counter');
      const v3 = await memoryKVStore.incr('test:counter');
      
      expect(v1).toBe(1);
      expect(v2).toBe(2);
      expect(v3).toBe(3);
    });
  });

  describe('TTL Behavior', () => {
    it('expires keys after TTL', async () => {
      // Set with 1 second TTL
      await memoryKVStore.set('test:ttl', 'value', 1);
      
      // Should exist immediately
      let value = await memoryKVStore.get('test:ttl');
      expect(value).toBe('value');
      
      // Wait for expiry (1.1 seconds)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      value = await memoryKVStore.get('test:ttl');
      expect(value).toBeNull();
    });

    it('does not expire keys without TTL', async () => {
      await memoryKVStore.set('test:no-ttl', 'value');
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const value = await memoryKVStore.get('test:no-ttl');
      expect(value).toBe('value');
    });
  });

  describe('Prefix Queries', () => {
    it('gets values by prefix', async () => {
      await memoryKVStore.set('prefix:a', 1);
      await memoryKVStore.set('prefix:b', 2);
      await memoryKVStore.set('prefix:c', 3);
      await memoryKVStore.set('other:d', 4);
      
      const results = await memoryKVStore.getByPrefix<number>('prefix:');
      
      expect(results.length).toBe(3);
      expect(results.map(r => r.value).sort()).toEqual([1, 2, 3]);
    });

    it('excludes expired keys from prefix queries', async () => {
      await memoryKVStore.set('prefix:expired', 'old', 1);
      await memoryKVStore.set('prefix:valid', 'new');
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const results = await memoryKVStore.getByPrefix('prefix:');
      
      expect(results.length).toBe(1);
      expect(results[0].key).toBe('prefix:valid');
    });
  });

  describe('Idempotency', () => {
    it('returns same value on repeated gets', async () => {
      const data = { id: 'test', value: 42 };
      await memoryKVStore.set('idem:test', data);
      
      const v1 = await memoryKVStore.get('idem:test');
      const v2 = await memoryKVStore.get('idem:test');
      const v3 = await memoryKVStore.get('idem:test');
      
      expect(v1).toEqual(data);
      expect(v2).toEqual(data);
      expect(v3).toEqual(data);
    });

    it('overwrites on repeated sets', async () => {
      await memoryKVStore.set('idem:overwrite', 1);
      await memoryKVStore.set('idem:overwrite', 2);
      
      const value = await memoryKVStore.get('idem:overwrite');
      expect(value).toBe(2);
    });
  });
});

describe('KV Key Builders', () => {
  it('builds alert definition key', () => {
    const key = kvKeys.alertDef('alert-123');
    expect(key).toBe('sf:v1:alerts:def:alert-123');
  });

  it('builds alert emit dedupe key', () => {
    const key = kvKeys.alertEmitDedupe('alert-123', 'CONFIRMED', 'window-456');
    expect(key).toBe('sf:v1:alerts:emit_dedupe:alert-123:CONFIRMED:window-456');
  });

  it('builds oracle snapshot key', () => {
    const key = kvKeys.oracleSnapshot('2025-12-31');
    expect(key).toBe('sf:v1:oracle:snapshot:2025-12-31');
  });

  it('builds TA cache key', () => {
    const key = kvKeys.taCache('BTC', '1h', false, '2025-12-31');
    expect(key).toBe('sf:v1:ta:cache:BTC:1h:false:2025-12-31');
  });
});

describe('KV TTL Constants', () => {
  it('has correct TTL values', () => {
    expect(kvTTL.idempotency).toBe(24 * 60 * 60); // 24h
    expect(kvTTL.alertEmitDedupe).toBe(24 * 60 * 60); // 24h
    expect(kvTTL.deadSession).toBe(13 * 60 * 60); // 13h
    expect(kvTTL.oracleDaily).toBe(36 * 60 * 60); // 36h
    expect(kvTTL.taCache).toBe(24 * 60 * 60); // 24h
  });
});
