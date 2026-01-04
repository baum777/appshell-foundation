# Journal Onchain Context

## Overview
The Journal Onchain Context feature allows persisting a snapshot of market conditions (price, liquidity, holders, etc.) at the moment a journal entry is created. This context is immutable and ensures that historical analysis reflects the state of the market *when the trade was made*, not current values.

## Schema

### Journal Entry Extensions
We extended `JournalEvent` (and the `journal_entries_v2` table) with:

- `assetId` (string, optional): The token address or symbol (e.g., SOL, or a contract address).
- `onchainContext` (object, optional): The snapshot data.
- `contextStatus` (string, optional): Status of the context (`missing`, `complete`, `failed`).

### OnchainContext Interface
```typescript
interface OnchainContext {
  capturedAt: string;     // ISO timestamp of capture
  priceUsd: number;       // Price in USD
  liquidityUsd: number;   // Liquidity in USD
  volume24h: number;      // 24h Volume in USD
  marketCap: number;      // Market Cap (or FDV) in USD
  ageMinutes: number;     // Token age in minutes
  holders: number;        // Number of holders
  transfers24h: number;   // Number of transfers in last 24h
  dexId?: string;         // Optional DEX identifier (e.g., raydium)
}
```

## Enrichment Flow

1. **Client-Provided Context**:
   - Clients can pass a full `onchainContext` object when creating an entry.
   - The backend validates this and saves it directly.
   - `contextStatus` is set to `complete`.

2. **Server-Side Enrichment**:
   - If a client provides `assetId` but NO `onchainContext`, the backend attempts to fetch it.
   - Sources:
     - **DexPaprika**: Price, Liquidity, Volume, Market Cap, Age.
     - **Moralis**: Holders, Transfers.
   - If successful, `contextStatus` is set to `complete`.
   - If failed (e.g., API error), `contextStatus` is set to `missing`.
   - **Offline-First**: Creation never fails due to enrichment errors. The entry is created with `contextStatus='missing'`.

3. **Background Repair (Future Work)**:
   - Entries with `contextStatus='missing'` can be re-processed later by a background job.

## API Usage

### Create Entry
POST `/api/journal`
```json
{
  "side": "BUY",
  "summary": "Bought the dip",
  "assetId": "So11111111111111111111111111111111111111112",
  // Optional: Provide context manually
  "onchainContext": {
    "capturedAt": "2026-01-04T12:00:00Z",
    "priceUsd": 150.50,
    ...
  }
}
```

## Database Migration
See `migrations/0004_journal_onchain_context.sql`.

## Configuration
Requires environment variables for providers:
- `DEXPAPRIKA_BASE_URL`
- `DEXPAPRIKA_API_KEY` (optional)
- `MORALIS_API_KEY`
