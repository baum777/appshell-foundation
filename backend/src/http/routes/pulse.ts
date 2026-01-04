import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../router.js';
import { sendJson } from '../response.js';
import { badRequest, unauthorized } from '../error.js';
import { getPulseSnapshot, refreshPulseSnapshot } from '../../services/pulse/pulseService.js';

export async function handleGetPulseAsset(req: ParsedRequest, res: ServerResponse): Promise<void> {
    if (req.userId === 'anon') {
        throw unauthorized('Authentication required');
    }

    const { assetId } = req.params;
    if (!assetId) {
        throw badRequest('Missing assetId');
    }
    const snapshot = await getPulseSnapshot(req.userId, assetId);
    sendJson(res, snapshot);
}

export async function handleRefreshPulseAsset(req: ParsedRequest, res: ServerResponse): Promise<void> {
    if (req.userId === 'anon') {
        throw unauthorized('Authentication required');
    }

    const { assetId } = req.params;
    if (!assetId) {
        throw badRequest('Missing assetId');
    }
    const snapshot = await refreshPulseSnapshot(req.userId, assetId);
    sendJson(res, snapshot);
}

