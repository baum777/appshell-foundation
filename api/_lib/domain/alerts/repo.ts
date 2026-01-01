/**
 * Alerts Repository
 * KV-backed storage for alert definitions and state
 */

import { randomUUID } from 'crypto';
import { kv, kvKeys } from '../../kv';
import type {
  Alert,
  IndicatorState,
  DeadTokenParams,
} from '../../types';
import { TEMPLATE_INDICATORS as TEMPLATES } from '../../types';
import { normalizeSymbolOrAddress } from '../../validation';

// ─────────────────────────────────────────────────────────────
// ALERT INDEX MANAGEMENT
// ─────────────────────────────────────────────────────────────

async function getAlertIndex(): Promise<string[]> {
  const index = await kv.get<string[]>(kvKeys.alertIndex());
  return index || [];
}

async function setAlertIndex(ids: string[]): Promise<void> {
  await kv.set(kvKeys.alertIndex(), ids);
}

async function addToIndex(alertId: string): Promise<void> {
  const index = await getAlertIndex();
  if (!index.includes(alertId)) {
    index.push(alertId);
    await setAlertIndex(index);
  }
}

async function removeFromIndex(alertId: string): Promise<void> {
  const index = await getAlertIndex();
  const filtered = index.filter(id => id !== alertId);
  await setAlertIndex(filtered);
}

// ─────────────────────────────────────────────────────────────
// ALERT CRUD
// ─────────────────────────────────────────────────────────────

export interface CreateSimpleAlertRequest {
  type: 'SIMPLE';
  symbolOrAddress: string;
  timeframe: string;
  condition: 'ABOVE' | 'BELOW' | 'CROSS';
  targetPrice: number;
  note?: string;
}

export interface CreateTwoStageAlertRequest {
  type: 'TWO_STAGE_CONFIRMED';
  symbolOrAddress: string;
  timeframe: string;
  template: keyof typeof TEMPLATES;
  windowCandles?: number;
  windowMinutes?: number;
  expiryMinutes: number;
  cooldownMinutes: number;
  note?: string;
}

export interface CreateDeadTokenAlertRequest {
  type: 'DEAD_TOKEN_AWAKENING_V2';
  symbolOrAddress: string;
  timeframe: string;
  params: DeadTokenParams;
  note?: string;
}

export type CreateAlertRequest =
  | CreateSimpleAlertRequest
  | CreateTwoStageAlertRequest
  | CreateDeadTokenAlertRequest;

export async function alertCreate(request: CreateAlertRequest): Promise<Alert> {
  const now = new Date().toISOString();
  const id = `alert-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const symbolOrAddress = normalizeSymbolOrAddress(request.symbolOrAddress);
  
  let alert: Alert;
  
  switch (request.type) {
    case 'SIMPLE': {
      alert = {
        id,
        type: 'SIMPLE',
        symbolOrAddress,
        timeframe: request.timeframe,
        enabled: true,
        status: 'active',
        stage: 'WATCHING',
        createdAt: now,
        note: request.note,
        triggerCount: 0,
        condition: request.condition,
        targetPrice: request.targetPrice,
      };
      break;
    }
    case 'TWO_STAGE_CONFIRMED': {
      const templateConfig = TEMPLATES[request.template];
      const indicators: IndicatorState[] = templateConfig.map(i => ({
        ...i,
        triggered: false,
      }));
      
      const expiresAt = new Date(Date.now() + request.expiryMinutes * 60 * 1000).toISOString();
      
      alert = {
        id,
        type: 'TWO_STAGE_CONFIRMED',
        symbolOrAddress,
        timeframe: request.timeframe,
        enabled: true,
        status: 'active',
        stage: 'WATCHING',
        createdAt: now,
        note: request.note,
        triggerCount: 0,
        template: request.template,
        windowCandles: request.windowCandles,
        windowMinutes: request.windowMinutes,
        expiryMinutes: request.expiryMinutes,
        cooldownMinutes: request.cooldownMinutes,
        indicators,
        triggeredCount: 0,
        expiresAt,
      };
      break;
    }
    case 'DEAD_TOKEN_AWAKENING_V2': {
      alert = {
        id,
        type: 'DEAD_TOKEN_AWAKENING_V2',
        symbolOrAddress,
        timeframe: request.timeframe,
        enabled: true,
        status: 'active',
        stage: 'WATCHING',
        createdAt: now,
        note: request.note,
        triggerCount: 0,
        params: request.params,
        deadTokenStage: 'INITIAL',
      };
      break;
    }
  }
  
  await kv.set(kvKeys.alertDef(id), alert);
  await addToIndex(id);
  
  return alert;
}

export async function alertGetById(id: string): Promise<Alert | null> {
  return kv.get<Alert>(kvKeys.alertDef(id));
}

export async function alertList(
  filter: 'all' | 'active' | 'paused' | 'triggered' = 'all',
  symbolOrAddress?: string
): Promise<Alert[]> {
  const index = await getAlertIndex();
  const alerts: Alert[] = [];
  
  for (const id of index) {
    const alert = await kv.get<Alert>(kvKeys.alertDef(id));
    if (!alert) continue;
    
    // Filter by status
    if (filter !== 'all' && alert.status !== filter) continue;
    
    // Filter by symbol
    if (symbolOrAddress) {
      const normalized = normalizeSymbolOrAddress(symbolOrAddress);
      if (alert.symbolOrAddress !== normalized) continue;
    }
    
    alerts.push(alert);
  }
  
  // Sort by createdAt descending
  alerts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  
  return alerts;
}

export interface UpdateAlertRequest {
  enabled?: boolean;
  note?: string;
  condition?: 'ABOVE' | 'BELOW' | 'CROSS';
  targetPrice?: number;
}

export async function alertUpdate(id: string, updates: UpdateAlertRequest): Promise<Alert | null> {
  const alert = await alertGetById(id);
  if (!alert) return null;
  
  // Apply updates
  if (updates.note !== undefined) {
    alert.note = updates.note;
  }
  
  if (updates.enabled !== undefined) {
    alert.enabled = updates.enabled;
    
    // Update status based on enabled
    if (!updates.enabled) {
      alert.status = 'paused';
    } else if (alert.stage !== 'CONFIRMED' && alert.stage !== 'EXPIRED' && alert.stage !== 'CANCELLED') {
      alert.status = 'active';
    }
  }
  
  // Handle SIMPLE-specific updates
  if (alert.type === 'SIMPLE') {
    if (updates.condition !== undefined) {
      alert.condition = updates.condition;
    }
    if (updates.targetPrice !== undefined) {
      alert.targetPrice = updates.targetPrice;
    }
  }
  
  await kv.set(kvKeys.alertDef(id), alert);
  
  return alert;
}

export async function alertCancelWatch(id: string): Promise<Alert | null> {
  const alert = await alertGetById(id);
  if (!alert) return null;
  
  alert.stage = 'CANCELLED';
  alert.enabled = false;
  alert.status = 'paused';
  
  await kv.set(kvKeys.alertDef(id), alert);
  
  return alert;
}

export async function alertDelete(id: string): Promise<boolean> {
  const exists = await kv.exists(kvKeys.alertDef(id));
  if (!exists) return false;
  
  await kv.delete(kvKeys.alertDef(id));
  await removeFromIndex(id);
  
  return true;
}

// ─────────────────────────────────────────────────────────────
// ALERT STATE UPDATES (internal use)
// ─────────────────────────────────────────────────────────────

export async function alertSave(alert: Alert): Promise<void> {
  await kv.set(kvKeys.alertDef(alert.id), alert);
}

export async function getActiveAlerts(): Promise<Alert[]> {
  return alertList('active');
}
