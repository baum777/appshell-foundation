import { getEnv } from '../../config/env.js';
import { withRetry } from '../../lib/http/retry.js';

export interface DexPaprikaPrice {
  priceUsd: number;
  liquidityUsd: number;
  volume24h: number;
  marketCap: number;
  ageMinutes: number;
  priceChange24h: number;
  lastUpdated: number;
}

export class DexPaprikaClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    const env = getEnv();
    this.baseUrl = env.DEXPAPRIKA_BASE_URL;
    this.apiKey = env.DEXPAPRIKA_API_KEY;
  }

  async getPrice(assetId: string): Promise<DexPaprikaPrice> {
    return withRetry(async () => {
      // NOTE: Using a generic endpoint pattern. Adjust if real API differs.
      // e.g. /token/:id or similar.
      const url = `${this.baseUrl}/token/${assetId}`; 
      
      const headers: Record<string, string> = {
          'Accept': 'application/json'
      };
      if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        throw new Error(`DexPaprika error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      // Calculate age in minutes if creation time is available, else 0
      const createdAt = data.createdAt || data.pairCreatedAt;
      let ageMinutes = 0;
      if (createdAt) {
        const createdMs = new Date(createdAt).getTime();
        ageMinutes = Math.max(0, Math.floor((Date.now() - createdMs) / 60000));
      }

      // Heuristic mapping
      return {
        priceUsd: Number(data.price || data.priceUsd || 0),
        liquidityUsd: Number(data.liquidity || data.liquidityUsd || 0),
        volume24h: Number(data.volume24h || 0),
        marketCap: Number(data.marketCap || data.fdv || 0), // Use FDV if mcap missing
        ageMinutes,
        priceChange24h: Number(data.priceChange24h || 0),
        lastUpdated: Date.now()
      };
    });
  }
}

export const dexPaprika = new DexPaprikaClient();
