/**
 * POST /api/chart/ta - Get TA analysis for a market
 * 
 * v1: Deterministic stub generator
 * // BACKEND_TODO: wire GPT vision for real TA analysis
 */

import { createHandler } from '../_lib/handler';
import { sendJson, setCacheHeaders } from '../_lib/response';
import { validateBody, taRequestSchema } from '../_lib/validation';
import { getOrGenerateTAReport } from '../_lib/domain/ta/repo';
import { checkRateLimit } from '../_lib/rate-limit';
import { normalizeSymbolOrAddress } from '../_lib/validation';

export default createHandler({
  POST: async ({ req, res, userId }) => {
    await checkRateLimit('ta', userId);
    
    const body = validateBody(taRequestSchema, req.body);
    
    // Normalize market name
    const market = normalizeSymbolOrAddress(body.market);
    
    const report = await getOrGenerateTAReport(
      market,
      body.timeframe,
      body.replay ?? false,
      body.asOfTs
    );
    
    // Cache headers per API_SPEC.md
    setCacheHeaders(res, { public: false, maxAge: 300 }); // 5 min
    
    sendJson(res, report);
  },
});
