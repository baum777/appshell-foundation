import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../http/router.js';
import { sendJson, setCacheHeaders } from '../http/response.js';
import { validateBody, validateQuery } from '../validation/validate.js';
import {
  oracleDailyQuerySchema,
  oracleReadStateRequestSchema,
  oracleBulkReadStateRequestSchema,
} from '../validation/schemas.js';
import {
  oracleGetDaily,
  oracleSetReadState,
  oracleBulkSetReadState,
} from '../domain/oracle/repo.js';

/**
 * Oracle Routes
 * Per API_SPEC.md section 3
 */

export interface OracleReadStateResponse {
  id: string;
  isRead: boolean;
  updatedAt: string;
}

export interface OracleBulkReadStateResponse {
  updated: OracleReadStateResponse[];
}

export function handleOracleDaily(req: ParsedRequest, res: ServerResponse): void {
  const query = validateQuery(oracleDailyQuerySchema, req.query);
  
  // Parse date or use today
  let date: Date;
  if (query.date) {
    date = new Date(query.date + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  } else {
    date = new Date();
  }
  
  const feed = oracleGetDaily(date, req.userId);
  
  // Cache headers per API_SPEC.md
  // User-specific read states mean we use private caching
  setCacheHeaders(res, { public: false, maxAge: 60 });
  
  sendJson(res, feed);
}

export function handleOracleReadState(req: ParsedRequest, res: ServerResponse): void {
  const body = validateBody(oracleReadStateRequestSchema, req.body);
  
  const result = oracleSetReadState(req.userId, body.id, body.isRead);
  
  const response: OracleReadStateResponse = {
    id: result.id,
    isRead: result.isRead,
    updatedAt: result.updatedAt,
  };
  
  sendJson(res, response);
}

export function handleOracleBulkReadState(req: ParsedRequest, res: ServerResponse): void {
  const body = validateBody(oracleBulkReadStateRequestSchema, req.body);
  
  const results = oracleBulkSetReadState(req.userId, body.ids, body.isRead);
  
  const response: OracleBulkReadStateResponse = {
    updated: results.map(r => ({
      id: r.id,
      isRead: r.isRead,
      updatedAt: r.updatedAt,
    })),
  };
  
  sendJson(res, response);
}
