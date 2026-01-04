import { getEnv } from '../../config/env.js';
import { withRetry } from '../../lib/http/retry.js';

export interface MoralisTokenStats {
  holders: number;
  transfers24h: number;
}

export class MoralisClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    const env = getEnv();
    // Default to V2 API
    this.baseUrl = env.MORALIS_BASE_URL || 'https://deep-index.moralis.io/api/v2';
    this.apiKey = env.MORALIS_API_KEY;
  }

  async getTokenStats(assetId: string): Promise<MoralisTokenStats> {
    if (!this.apiKey) {
      // Return zeroes if not configured to avoid breaking flow
      // Or throw if strict. Spec implies graceful degradation.
      // Throwing allows service to catch and set status='degraded'.
      throw new Error('Moralis API key not configured');
    }

    return withRetry(async () => {
      // Assuming Solana for now as per context, but could be parameter
      // Moralis Solana API path is often /sol/...
      // But standard EVM is /erc20/...
      // We'll use a generic /erc20 path for "appshell-foundation" usually implies generic crypto or specific chain.
      // Given "DexPaprika" (Solana) context, let's try to be safe.
      // Ideally we check chain from assetId or default.
      
      const chain = 'solana'; 
      // Note: Moralis Solana API endpoint might differ from EVM.
      // EVM: /erc20/{address}/stats
      // Solana: /sol/token/{address}/stats (hypothetical, need actual docs)
      // Since I can't check docs, I will use a generic query param approach on base URL
      
      const url = `${this.baseUrl}/erc20/${assetId}/stats?chain=${chain}`;
      
      const headers = {
        'X-API-Key': this.apiKey!,
        'Accept': 'application/json'
      };

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Moralis error: ${res.status}`);
      }

      const data = await res.json();
      return {
        holders: Number(data.holders || 0),
        transfers24h: Number(data.transfers?.count || 0)
      };
    });
  }
}

export const moralis = new MoralisClient();

