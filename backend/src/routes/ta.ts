import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../http/router.js';
import { sendJson, setCacheHeaders } from '../http/response.js';
import { validateBody } from '../validation/validate.js';
import { taRequestSchema } from '../validation/schemas.js';
import { generateTAReport } from '../domain/ta/taGenerator.js';
import { taCacheGet, taCacheSet } from '../domain/ta/cacheRepo.js';
import { rateLimiters } from '../http/rateLimit.js';

/**
 * Chart TA Routes
 * Per API_SPEC.md section 4
 * 
 * // BACKEND_TODO: wire GPT vision for real TA analysis
 */

function getDayBucket(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function handleTAAnalysis(req: ParsedRequest, res: ServerResponse): void {
  const body = validateBody(taRequestSchema, req.body);
  
  // Rate limit check
  rateLimiters.ta(req.path, req.userId);
  
  const now = new Date();
  const bucket = getDayBucket(now);
  
  // Check cache first
  let report = taCacheGet(body.market, body.timeframe, body.replay, bucket);
  
  if (!report) {
    // Generate new report
    report = generateTAReport(body.market, body.timeframe, body.replay, now);
    
    // Cache it
    taCacheSet(body.market, body.timeframe, body.replay, bucket, report);
  }
  
  // Cache headers per API_SPEC.md
  setCacheHeaders(res, { public: false, maxAge: 300 }); // 5 min
  
  sendJson(res, report);
}
