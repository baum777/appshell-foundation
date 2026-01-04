import { OracleSnapshot } from '../../contracts/oracle.js';
import { getJson, setJson } from '../../lib/kv/json.js';
import { acquireLock, releaseLock } from '../../lib/kv/lock.js';
import { isProviderOnCooldown, setProviderCooldown } from '../../lib/http/rateLimit.js';
import { dexPaprika } from '../../providers/dexpaprika/client.js';
import { AppError, ErrorCodes, conflict } from '../../http/error.js';
import { normalizeAssetId } from '../../lib/assets.js';
import { getEnv } from '../../config/env.js';

const SNAPSHOT_TTL = 300;
const LOCK_TTL = 60;
const COOLDOWN_TTL = 30;

export async function getOracleSnapshot(userId: string, assetId: string): Promise<OracleSnapshot> {
  const normalizedId = normalizeAssetId(assetId);
  const key = `oracle:snap:${userId}:${normalizedId}`;
  
  const snapshot = await getJson<OracleSnapshot>(key);
  if (snapshot) return snapshot;

  // Return minimal object if missing
  return {
    assetId: normalizedId,
    updatedAt: new Date().toISOString(),
    price: 0,
    confidence: 0,
    source: '',
    status: 'error',
    error: {
      code: 'SNAPSHOT_MISSING',
      message: 'No snapshot available. Please refresh.'
    }
  };
}

export async function refreshOracleSnapshot(userId: string, assetId: string): Promise<OracleSnapshot> {
  const normalizedId = normalizeAssetId(assetId);
  const env = getEnv();

  // 1. Check cooldown
  if (await isProviderOnCooldown('dexpaprika', userId)) {
    throw new AppError('Provider cooldown active', 429, ErrorCodes.RATE_LIMITED);
  }

  // 2. Acquire lock
  const lockKey = `oracle:lock:${userId}:${normalizedId}`;
  const locked = await acquireLock(lockKey, env.REFRESH_LOCK_TTL_SECONDS || LOCK_TTL);
  if (!locked) {
    throw conflict('Refresh already in progress', ErrorCodes.RATE_LIMITED);
  }

  try {
    // 3. Execute refresh
    const data = await dexPaprika.getPrice(normalizedId);
    
    // 4. Compose snapshot
    const snapshot: OracleSnapshot = {
      assetId: normalizedId,
      updatedAt: new Date().toISOString(),
      price: data.priceUsd,
      confidence: 0.9, // Heuristic: successful fresh fetch
      source: 'dexpaprika',
      status: 'ok'
    };

    // 5. Save snapshot
    const snapKey = `oracle:snap:${userId}:${normalizedId}`;
    await setJson(snapKey, snapshot, env.SNAPSHOT_TTL_SECONDS || SNAPSHOT_TTL);

    return snapshot;

  } catch (error: any) {
    // Handle 429
    if (String(error).includes('429') || error?.status === 429) {
      await setProviderCooldown('dexpaprika', userId, env.PROVIDER_COOLDOWN_SECONDS || COOLDOWN_TTL);
    }
    
    const errorSnapshot: OracleSnapshot = {
        assetId: normalizedId,
        updatedAt: new Date().toISOString(),
        price: 0,
        confidence: 0,
        source: 'dexpaprika',
        status: 'error',
        error: {
            code: 'PROVIDER_ERROR',
            message: error instanceof Error ? error.message : String(error)
        }
    };
    const snapKey = `oracle:snap:${userId}:${normalizedId}`;
    await setJson(snapKey, errorSnapshot, env.SNAPSHOT_TTL_SECONDS || SNAPSHOT_TTL);
    
    return errorSnapshot;
    
  } finally {
    // 6. Release lock
    await releaseLock(lockKey);
  }
}

