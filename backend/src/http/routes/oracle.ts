import type { ServerResponse } from 'http';
import type { ParsedRequest } from '../router.js';
import { sendJson } from '../response.js';
import { badRequest, unauthorized } from '../error.js';
import { getOracleSnapshot, refreshOracleSnapshot } from '../../services/oracle/oracleService.js';

export async function handleGetOracleAsset(req: ParsedRequest, res: ServerResponse): Promise<void> {
    if (req.userId === 'anon') {
        throw unauthorized('Authentication required');
    }

    const { assetId } = req.params;
    if (!assetId) {
        throw badRequest('Missing assetId');
    }
    const snapshot = await getOracleSnapshot(req.userId, assetId);
    sendJson(res, snapshot);
}

export async function handleRefreshOracleAsset(req: ParsedRequest, res: ServerResponse): Promise<void> {
    if (req.userId === 'anon') {
        throw unauthorized('Authentication required');
    }

    const { assetId } = req.params;
    if (!assetId) {
        throw badRequest('Missing assetId');
    }
    const snapshot = await refreshOracleSnapshot(req.userId, assetId);
    sendJson(res, snapshot);
}

