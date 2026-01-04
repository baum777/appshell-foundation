// Journal v1 Frontend Contract - FROZEN
// Backend must conform to this shape

/**
 * OnchainContext v1 - FROZEN
 * Frontend may ONLY consume these fields.
 * No deltas, no time series, no scores, no AI ratings.
 */
export interface OnchainContextV1 {
  capturedAt: string;
  priceUsd: number;
  liquidityUsd: number;
  volume24h: number;
  marketCap: number;
  ageMinutes: number;
  holders: number;
  transfers24h: number;
  dexId?: string;
}

/**
 * Journal Entry with onchain context
 */
export interface JournalEntryV1 {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  status: "pending" | "confirmed" | "archived";
  timestamp: string;
  summary: string;
  
  // Trade metrics
  sizeUsd?: number;
  entryPrice?: number;
  
  // Frozen onchain snapshot
  onchainContext?: OnchainContextV1;
  
  // Reflection (optional)
  reflection?: {
    feeling: "very_negative" | "negative" | "neutral" | "positive" | "very_positive";
    confidence: number; // 0-100
    reasoning?: string;
  };
  
  // Source metadata
  source?: "auto" | "manual";
}

// Format helpers for frozen context lines

function formatCompact(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}k`;
  }
  return `$${num.toFixed(0)}`;
}

function formatAge(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  if (minutes < 1440) {
    return `${Math.floor(minutes / 60)}h`;
  }
  return `${Math.floor(minutes / 1440)}d`;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Timeline context line format (FROZEN):
 * "Liquidity $320k · Vol24h $1.2M · Holders 1,204 · Age 12h"
 */
export function formatTimelineContextLine(ctx: OnchainContextV1 | undefined): string | null {
  if (!ctx) return null;
  
  const parts = [
    `Liquidity ${formatCompact(ctx.liquidityUsd)}`,
    `Vol24h ${formatCompact(ctx.volume24h)}`,
    `Holders ${formatNumber(ctx.holders)}`,
    `Age ${formatAge(ctx.ageMinutes)}`,
  ];
  
  return parts.join(" · ");
}

/**
 * Inbox context line format (FROZEN):
 * "Liquidity $320k · Vol24h $1.2M · Holders 1,204 · Transfers 312 · Age 12h"
 */
export function formatInboxContextLine(ctx: OnchainContextV1 | undefined): string | null {
  if (!ctx) return null;
  
  const parts = [
    `Liquidity ${formatCompact(ctx.liquidityUsd)}`,
    `Vol24h ${formatCompact(ctx.volume24h)}`,
    `Holders ${formatNumber(ctx.holders)}`,
    `Transfers ${formatNumber(ctx.transfers24h)}`,
    `Age ${formatAge(ctx.ageMinutes)}`,
  ];
  
  return parts.join(" · ");
}

/**
 * Format USD size for display
 */
export function formatUsdSize(usd: number | undefined): string {
  if (usd === undefined) return "—";
  return formatCompact(usd);
}

/**
 * Format entry price for display
 */
export function formatEntryPrice(price: number | undefined): string {
  if (price === undefined) return "—";
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  return `$${price.toFixed(2)}`;
}
