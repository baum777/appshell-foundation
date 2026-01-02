import { getEnv } from '../../config/env.js';
import { logger } from '../../observability/logger.js';
import type { PulseGlobalToken } from './types.js';

// Sources
const DEXPAPRIKA_BASE = 'https://api.dexpaprika.com';
const MORALIS_BASE = 'https://solana-gateway.moralis.io';

export async function getGlobalTokenList(): Promise<PulseGlobalToken[]> {
  const env = getEnv();
  const addresses = env.PULSE_TOKEN_ADDRESSES ? env.PULSE_TOKEN_ADDRESSES.split(',').map(a => a.trim()).filter(Boolean) : [];
  
  if (addresses.length === 0) {
    logger.info('No PULSE_TOKEN_ADDRESSES configured, returning empty list');
    return [];
  }

  const tokens: PulseGlobalToken[] = [];
  
  // Process sequentially to be nice to public APIs (or use slight concurrency if list grows)
  for (const addr of addresses) {
    try {
      const token = await fetchTokenData(addr);
      if (token) tokens.push(token);
    } catch (error) {
      logger.error('Failed to fetch token data', { address: addr, error: String(error) });
    }
  }

  return tokens;
}

async function fetchTokenData(address: string): Promise<PulseGlobalToken | null> {
  const env = getEnv();
  const token: PulseGlobalToken = {
    address,
    symbol: 'UNKNOWN',
    chain: 'solana'
  };

  // 1. DexPaprika (Public) - Price, FDV, Vol
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(`${DEXPAPRIKA_BASE}/networks/solana/tokens/${address}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json() as any;
      if (data.summary) {
        token.marketCap = data.summary.fdv; // Approx FDV
        token.volume24h = data.summary['24h']?.volume_usd;
        token.priceChange24h = data.summary['24h']?.price_change_percent; // Guessing field, verify if needed
        
        // Try to infer age if added_at exists
        if (data.added_at) {
          const added = new Date(data.added_at).getTime();
          token.ageMinutes = Math.floor((Date.now() - added) / 60000);
        }
      }
      if (data.symbol) token.symbol = data.symbol;
    } else if (res.status === 429) {
      logger.warn('DexPaprika rate limited', { address });
    }
  } catch (err) {
    logger.warn('DexPaprika fetch failed', { address, error: String(err) });
  }

  // 2. Moralis (Key Required) - Metadata
  if (env.MORALIS_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${MORALIS_BASE}/token/mainnet/${address}/metadata`, {
        headers: { 'X-API-Key': env.MORALIS_API_KEY },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json() as any;
        if (data.symbol) token.symbol = data.symbol; // Prefer Moralis symbol
        // Add more metadata if needed
      }
    } catch (err) {
      logger.warn('Moralis fetch failed', { address, error: String(err) });
    }
  }

  // Filter out if no meaningful data found (optional, or return partial)
  // For now return whatever we gathered
  return token;
}
