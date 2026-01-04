import { PulseSnapshot } from '../../contracts/pulse.js';
import { getJson, setJson } from '../../lib/kv/json.js';
import { acquireLock, releaseLock } from '../../lib/kv/lock.js';
import { isProviderOnCooldown, setProviderCooldown } from '../../lib/http/rateLimit.js';
import { dexPaprika } from '../../providers/dexpaprika/client.js';
import { moralis } from '../../providers/moralis/client.js';
import { AppError, ErrorCodes, conflict } from '../../http/error.js';
import { normalizeAssetId } from '../../lib/assets.js';
import { getEnv } from '../../config/env.js';
import { logger } from '../../observability/logger.js';

const SNAPSHOT_TTL = 300;
const LOCK_TTL = 60;
const COOLDOWN_TTL = 30;

export async function getPulseSnapshot(userId: string, assetId: string): Promise<PulseSnapshot> {
  const normalizedId = normalizeAssetId(assetId);
  const key = `pulse:snap:${userId}:${normalizedId}`;
  
  const snapshot = await getJson<PulseSnapshot>(key);
  if (snapshot) return snapshot;

  return {
    assetId: normalizedId,
    updatedAt: new Date().toISOString(),
    sentiment: 'neutral',
    sentimentLabel: '',
    cta: '',
    severity: 'low',
    drivers: [],
    status: 'error',
    error: {
      code: 'SNAPSHOT_MISSING',
      message: 'No snapshot available. Please refresh.'
    }
  };
}

export async function refreshPulseSnapshot(userId: string, assetId: string): Promise<PulseSnapshot> {
  const normalizedId = normalizeAssetId(assetId);
  const env = getEnv();

  // 1. Check cooldown (global pulse provider or composite)
  // We track moralis separately but for simplicity check pulse generic cooldown
  if (await isProviderOnCooldown('pulse', userId)) {
    throw new AppError('Provider cooldown active', 429, ErrorCodes.RATE_LIMITED);
  }

  // 2. Acquire lock
  const lockKey = `pulse:lock:${userId}:${normalizedId}`;
  const locked = await acquireLock(lockKey, env.REFRESH_LOCK_TTL_SECONDS || LOCK_TTL);
  if (!locked) {
    throw conflict('Refresh already in progress', ErrorCodes.RATE_LIMITED);
  }

  try {
    // 3. Execute refresh
    // Parallel fetch where possible
    const [priceData, moralisData] = await Promise.allSettled([
      dexPaprika.getPrice(normalizedId),
      moralis.getTokenStats(normalizedId)
    ]);

    let status: PulseSnapshot['status'] = 'ok';
    const drivers: PulseSnapshot['drivers'] = [];

    // Process DexPaprika (Optional quick market stats)
    if (priceData.status === 'fulfilled') {
      const p = priceData.value;
      drivers.push({ key: 'priceChange24h', label: '24h Change', value: `${p.priceChange24h}%` });
      drivers.push({ key: 'volume24h', label: '24h Volume', value: p.volume24h });
    } else {
      // If price fails, it's not critical for Pulse (sentiment), but maybe degrading?
      // Spec says: "If Moralis down -> Pulse status 'degraded'". Doesn't mention DexPaprika explicitly for Pulse.
      logger.warn('Pulse: DexPaprika failed', { error: String(priceData.reason) });
    }

    // Process Moralis
    if (moralisData.status === 'fulfilled') {
      const m = moralisData.value;
      drivers.push({ key: 'holders', label: 'Holders', value: m.holders });
      drivers.push({ key: 'transfers24h', label: '24h Transfers', value: m.transfers24h });
    } else {
      logger.warn('Pulse: Moralis failed', { error: String(moralisData.reason) });
      status = 'degraded';
      // Check if it was a rate limit
      if (String(moralisData.reason).includes('429')) {
        await setProviderCooldown('moralis', userId, env.PROVIDER_COOLDOWN_SECONDS || COOLDOWN_TTL);
      }
    }

    // LLM Logic (Optional)
    // For now, fallback logic as requested:
    // sentiment="neutral", severity="low", sentimentLabel="neutral stagnation"
    const sentiment = 'neutral';
    const severity = 'low';
    const sentimentLabel = 'neutral stagnation';
    const cta = 'Hold';

    // 4. Compose snapshot
    const snapshot: PulseSnapshot = {
      assetId: normalizedId,
      updatedAt: new Date().toISOString(),
      sentiment,
      sentimentLabel,
      cta,
      severity,
      drivers,
      status
    };

    // 5. Save snapshot
    const snapKey = `pulse:snap:${userId}:${normalizedId}`;
    await setJson(snapKey, snapshot, env.SNAPSHOT_TTL_SECONDS || SNAPSHOT_TTL);

    return snapshot;

  } catch (error: any) {
     if (String(error).includes('429')) {
      await setProviderCooldown('pulse', userId, env.PROVIDER_COOLDOWN_SECONDS || COOLDOWN_TTL);
    }

    const errorSnapshot: PulseSnapshot = {
        assetId: normalizedId,
        updatedAt: new Date().toISOString(),
        sentiment: 'neutral',
        sentimentLabel: 'Error',
        cta: '',
        severity: 'low',
        drivers: [],
        status: 'error',
        error: {
            code: 'REFRESH_FAILED',
            message: error instanceof Error ? error.message : String(error)
        }
    };
    const snapKey = `pulse:snap:${userId}:${normalizedId}`;
    await setJson(snapKey, errorSnapshot, env.SNAPSHOT_TTL_SECONDS || SNAPSHOT_TTL);
    
    return errorSnapshot;
    
  } finally {
    // 6. Release lock
    await releaseLock(lockKey);
  }
}

