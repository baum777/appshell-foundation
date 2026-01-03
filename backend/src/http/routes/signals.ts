import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../router.js';
import { sendJson } from '../response.js';
import { getUnifiedSignals } from '../../services/signals/unifiedService.js';
import type { SignalFilter, SignalSort } from '../../domain/signals/types.js';

export async function handleGetUnified(req: ParsedRequest, res: ServerResponse) {
  const filter = (req.query.filter as SignalFilter) || 'all';
  const sort = (req.query.sort as SignalSort) || 'impact';

  const tier = req.user?.tier || 'free';
  const result = await getUnifiedSignals(req.userId, tier, filter, sort);

  sendJson(res, result);
}

