import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../router.js';
import { sendJson } from '../response.js';
import { getDailyBias } from '../../services/signals/dailyBiasService.js';

export async function handleGetDailyBias(req: ParsedRequest, res: ServerResponse) {
  const card = await getDailyBias();
  sendJson(res, card);
}

