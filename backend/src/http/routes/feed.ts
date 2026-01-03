import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../router.js';
import { sendJson } from '../response.js';
import { invalidQuery } from '../error.js';
import { getOracleCards } from '../../services/signals/oracleService.js';
import { generatePulseCards } from '../../services/signals/pulseService.js';
import { setFocus } from '../../services/user/focusService.js';

export async function handleGetOracle(req: ParsedRequest, res: ServerResponse) {
  const assetId = req.query.asset as string;
  if (!assetId) {
    throw invalidQuery('Missing asset parameter');
  }

  // 1. Set Focus (fire & forget or await?)
  // Plan says: "write user:focus:<userId> = X with TTL 15 minutes."
  await setFocus(req.userId, assetId);

  // 2. Fetch Oracle Cards
  const tier = req.user?.tier || 'free';
  const cards = await getOracleCards(assetId, req.userId, tier);

  sendJson(res, cards);
}

export async function handleGetPulse(req: ParsedRequest, res: ServerResponse) {
  const assetId = req.query.asset as string;
  if (!assetId) {
    throw invalidQuery('Missing asset parameter');
  }

  // Fetch Pulse Cards
  const cards = await generatePulseCards(assetId);

  sendJson(res, cards);
}

