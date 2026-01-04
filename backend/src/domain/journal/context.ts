import { dexPaprika } from '../../providers/dexpaprika/client.js';
import { moralis } from '../../providers/moralis/client.js';
import type { OnchainContext } from './types.js';
import { getLogger } from '../../observability/logger.js';

const logger = getLogger('JournalContext');

/**
 * Builds the onchain context for a given asset.
 * Fetches data from DexPaprika (price, liquidity, age) and Moralis (holders).
 * 
 * @param assetId - The token address or symbol
 * @param dexId - Optional DEX identifier (e.g. 'raydium')
 * @returns OnchainContext
 * @throws Error if critical data cannot be fetched
 */
export async function buildOnchainContext(assetId: string, dexId?: string): Promise<OnchainContext> {
  const capturedAt = new Date().toISOString();

  try {
    // Run providers in parallel for performance
    const [priceData, tokenStats] = await Promise.all([
      dexPaprika.getPrice(assetId),
      moralis.getTokenStats(assetId)
    ]);

    return {
      capturedAt,
      priceUsd: priceData.priceUsd,
      liquidityUsd: priceData.liquidityUsd,
      volume24h: priceData.volume24h,
      marketCap: priceData.marketCap,
      ageMinutes: priceData.ageMinutes,
      holders: tokenStats.holders,
      transfers24h: tokenStats.transfers24h,
      dexId
    };
  } catch (err) {
    logger.error('Failed to build onchain context', { assetId, error: err });
    throw err;
  }
}
