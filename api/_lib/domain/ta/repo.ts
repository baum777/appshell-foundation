/**
 * TA Cache Repository
 * KV-backed caching for TA reports
 */

import { kv, kvKeys, kvTTL } from '../../kv';
import type { TAReport } from '../../types';
import { generateTAReport } from './generator';

function getDayBucket(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function taCacheGet(
  market: string,
  timeframe: string,
  replay: boolean,
  bucket: string
): Promise<TAReport | null> {
  const key = kvKeys.taCache(market, timeframe, replay, bucket);
  return kv.get<TAReport>(key);
}

export async function taCacheSet(
  market: string,
  timeframe: string,
  replay: boolean,
  bucket: string,
  report: TAReport
): Promise<void> {
  const key = kvKeys.taCache(market, timeframe, replay, bucket);
  await kv.set(key, report, kvTTL.taCache);
}

export async function getOrGenerateTAReport(
  market: string,
  timeframe: string,
  replay: boolean,
  asOfTs?: string
): Promise<TAReport> {
  const timestamp = asOfTs ? new Date(asOfTs) : new Date();
  const bucket = getDayBucket(timestamp);
  
  // Check cache first
  let report = await taCacheGet(market, timeframe, replay, bucket);
  
  if (!report) {
    // Generate new report
    report = generateTAReport(market, timeframe, replay, timestamp);
    
    // Cache it
    await taCacheSet(market, timeframe, replay, bucket, report);
  }
  
  return report;
}
