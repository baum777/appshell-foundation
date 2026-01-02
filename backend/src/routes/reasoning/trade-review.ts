import type { ServerResponse } from 'http';
import { z } from 'zod';
import type { ParsedRequest } from '../../http/router.js';
import { sendJson, setCacheHeaders } from '../../http/response.js';
import { validateBody } from '../../validation/validate.js';
import { rateLimiters } from '../../http/rateLimit.js';
import { jsonObjectSchema } from './jsonSchema.js';
import { REASONING_CONTRACT_VERSION } from './types.js';
import { runReasoning } from './engine.js';

const tradeReviewRequestSchema = z.object({
  referenceId: z.string().min(1),
  version: z.string().min(1).optional().default(REASONING_CONTRACT_VERSION),
  context: jsonObjectSchema,
});

export async function handleReasoningTradeReview(req: ParsedRequest, res: ServerResponse): Promise<void> {
  rateLimiters.reasoning(req.path, req.userId);

  const body = validateBody(tradeReviewRequestSchema, req.body);

  setCacheHeaders(res, { noStore: true });

  const result = await runReasoning(req, 'trade-review', body);

  sendJson(res, result);
}


