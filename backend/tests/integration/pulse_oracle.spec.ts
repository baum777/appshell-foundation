import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getOracleSnapshot, refreshOracleSnapshot } from '../../src/services/oracle/oracleService';
import { getPulseSnapshot, refreshPulseSnapshot } from '../../src/services/pulse/pulseService';
import { dexPaprika } from '../../src/providers/dexpaprika/client';
import { moralis } from '../../src/providers/moralis/client';
import { getKV } from '../../src/lib/kv/store';

// Mock KV to ensure clean state
const kv = getKV();

describe('Pulse & Oracle Split Integration', () => {
  const userId = 'test-user';
  const assetId = 'solana';

  beforeEach(async () => {
    // Clear KV for test user/asset
    await kv.delete(`oracle:snap:${userId}:${assetId}`);
    await kv.delete(`oracle:lock:${userId}:${assetId}`);
    await kv.delete(`pulse:snap:${userId}:${assetId}`);
    await kv.delete(`pulse:lock:${userId}:${assetId}`);
    await kv.delete(`provider:cooldown:dexpaprika:${userId}`);
    await kv.delete(`provider:cooldown:moralis:${userId}`);
    await kv.delete(`provider:cooldown:pulse:${userId}`);

    // Mock providers
    vi.spyOn(dexPaprika, 'getPrice').mockResolvedValue({
      priceUsd: 150.50,
      liquidityUsd: 1000000,
      volume24h: 500000,
      priceChange24h: 5.2,
      lastUpdated: Date.now()
    });

    vi.spyOn(moralis, 'getTokenStats').mockResolvedValue({
      holders: 1200,
      transfers24h: 300
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Oracle Service', () => {
    it('getOracleSnapshot returns error status when missing', async () => {
      const snap = await getOracleSnapshot(userId, assetId);
      expect(snap.status).toBe('error');
      expect(snap.error?.code).toBe('SNAPSHOT_MISSING');
      expect(snap.price).toBe(0);
    });

    it('refreshOracleSnapshot fetches data and saves snapshot', async () => {
      const snap = await refreshOracleSnapshot(userId, assetId);
      
      expect(snap.status).toBe('ok');
      expect(snap.price).toBe(150.50);
      expect(snap.source).toBe('dexpaprika');
      expect(dexPaprika.getPrice).toHaveBeenCalledTimes(1);

      // Verify KV persistence
      const saved = await getOracleSnapshot(userId, assetId);
      expect(saved.status).toBe('ok');
      expect(saved.price).toBe(150.50);
    });

    it('refreshOracleSnapshot respects lock (concurrency)', async () => {
      // Manually acquire lock
      const lockKey = `oracle:lock:${userId}:${assetId}`;
      await kv.set(lockKey, 'locked', 60); // Assuming kv support or using kv.setnx logic if exposed

      // If we use the real service, it uses acquireLock which uses setnx.
      // If we manually set the key, acquireLock should fail.
      // The memory store implementation of set doesn't block setnx unless setnx checks existence.
      // Our setnx implementation checks existence.
      
      // Wait, acquireLock in memory store? 
      // I implemented acquireLock in lock.ts using getKV().setnx().
      // And I added setnx to MemoryStore in store.ts.
      // So this should work.
      
      // But verify acquireLock implementation in lock.ts first.
      // It calls kv.setnx(key, value, ttl).
      // MemoryStore.setnx checks if exists.
      // So if I set it first, it should fail.
      
      // Use kv.set directly to simulate existing lock
      await kv.set(lockKey, 'existing_lock', 60);
      
      await expect(refreshOracleSnapshot(userId, assetId))
        .rejects.toThrow('Refresh already in progress');
    });

    it('refreshOracleSnapshot handles provider errors gracefully', async () => {
      vi.spyOn(dexPaprika, 'getPrice').mockRejectedValue(new Error('API Error'));

      const snap = await refreshOracleSnapshot(userId, assetId);
      expect(snap.status).toBe('error');
      expect(snap.error?.message).toContain('API Error');
    });
  });

  describe('Pulse Service', () => {
    it('getPulseSnapshot returns error status when missing', async () => {
      const snap = await getPulseSnapshot(userId, assetId);
      expect(snap.status).toBe('error');
    });

    it('refreshPulseSnapshot aggregates data', async () => {
      const snap = await refreshPulseSnapshot(userId, assetId);
      
      expect(snap.status).toBe('ok');
      expect(snap.sentiment).toBe('neutral'); // Default for now
      
      const holders = snap.drivers.find(d => d.key === 'holders');
      expect(holders?.value).toBe(1200);
      
      const priceChange = snap.drivers.find(d => d.key === 'priceChange24h');
      expect(priceChange?.value).toBe('5.2%');
    });

    it('refreshPulseSnapshot is degraded if Moralis fails', async () => {
      vi.spyOn(moralis, 'getTokenStats').mockRejectedValue(new Error('Moralis Down'));

      const snap = await refreshPulseSnapshot(userId, assetId);
      
      expect(snap.status).toBe('degraded');
      // Should still have price data
      const priceChange = snap.drivers.find(d => d.key === 'priceChange24h');
      expect(priceChange?.value).toBe('5.2%');
      // Should not have holders
      const holders = snap.drivers.find(d => d.key === 'holders');
      expect(holders).toBeUndefined();
    });
  });
});

