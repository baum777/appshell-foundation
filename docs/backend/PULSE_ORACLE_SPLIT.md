# Pulse & Oracle Split Logic (Backend)

This document describes the split implementation of Pulse and Oracle services.

## Overview

The system separates **Oracle** (price/market data) from **Pulse** (sentiment/onchain/signals) to allow independent scaling, caching, and refresh cycles.

## Endpoints

### Oracle
- `GET /api/oracle/:assetId`: Fast path. Returns cached snapshot or empty error state (200 OK).
- `POST /api/oracle/:assetId/refresh`: Trigger refresh. Checks rate limits, acquires lock, fetches DexPaprika.

### Pulse
- `GET /api/pulse/:assetId`: Fast path. Returns cached snapshot or empty error state (200 OK).
- `POST /api/pulse/:assetId/refresh`: Trigger refresh. Checks rate limits, acquires lock, fetches DexPaprika (market) + Moralis (holders).

## Data Models

### OracleSnapshot
```json
{
  "assetId": "string",
  "updatedAt": "ISO-8601",
  "price": 1.23,
  "confidence": 0.9,
  "source": "dexpaprika",
  "status": "ok|stale|degraded|error"
}
```

### PulseSnapshot
```json
{
  "assetId": "string",
  "updatedAt": "ISO-8601",
  "sentiment": "neutral",
  "drivers": [
    { "key": "holders", "label": "Holders", "value": 1500 }
  ],
  "status": "ok|degraded|error"
}
```

## Key Value Store (KV)

Keys are scoped by `userId` to allow personalized rate limiting and potentially personalized data in future.

- **Snapshots**: `oracle:snap:{userId}:{assetId}`, `pulse:snap:{userId}:{assetId}` (TTL 300s)
- **Locks**: `oracle:lock:{userId}:{assetId}`, `pulse:lock:{userId}:{assetId}` (TTL 60s)
- **Cooldowns**: `provider:cooldown:{provider}:{userId}` (TTL 30s)

## Locking & Concurrency

- **Refresh is idempotent**: Only one refresh per (user, asset) can run at a time.
- **Locking**: Uses KV `SET NX` with TTL.
- **Rate Limiting**:
  - Checks provider cooldowns (triggered by 429s).
  - Checks lock status.

## Provider Integration

- **DexPaprika**: Primary source for Price/Market.
- **Moralis**: Primary source for Onchain/Holders.
- **LLM**: Optional for sentiment analysis (currently fallback to neutral).

## Error Handling

- **Get**: Never fails hard. Returns 200 with `status="error"` if missing.
- **Refresh**:
  - `429`: Rate limited or Cooldown.
  - `409`: Refresh in progress.
  - `200`: Success (returns snapshot).

