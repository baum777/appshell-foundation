/**
 * PUT /api/oracle/read-state - Set read state for an insight
 */

import { createHandler } from '../_lib/handler';
import { sendJson } from '../_lib/response';
import { validateBody, oracleReadStateRequestSchema } from '../_lib/validation';
import { oracleSetReadState } from '../_lib/domain/oracle/repo';
import { checkRateLimit } from '../_lib/rate-limit';

interface OracleReadStateResponse {
  id: string;
  isRead: boolean;
  updatedAt: string;
}

export default createHandler({
  PUT: async ({ req, res, userId }) => {
    await checkRateLimit('oracle', userId);
    
    const body = validateBody(oracleReadStateRequestSchema, req.body);
    
    const result = await oracleSetReadState(userId, body.id, body.isRead);
    
    const response: OracleReadStateResponse = {
      id: result.id,
      isRead: result.isRead,
      updatedAt: result.updatedAt,
    };
    
    sendJson(res, response);
  },
});
