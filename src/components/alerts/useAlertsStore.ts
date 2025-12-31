import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePageState, type UsePageStateReturn } from '@/stubs/pageState';
import {
  type Alert,
  type SimpleAlert,
  type TwoStageAlert,
  type DeadTokenAlert,
  type AlertType,
  type SimpleCondition,
  type TwoStageTemplate,
  type IndicatorState,
  type DeadTokenParams,
  type PrefillData,
  type AlertStatusFilter,
  TEMPLATE_INDICATORS,
  DEFAULT_DEAD_TOKEN_PARAMS,
} from './types';

// ─────────────────────────────────────────────────────────────
// LOCALSTORAGE PERSISTENCE
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sparkfined_alerts_v1';

function loadAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: Alert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────
// STUB DATA GENERATORS
// ─────────────────────────────────────────────────────────────

function generateStubAlerts(): Alert[] {
  const now = new Date();
  
  const simpleAlert: SimpleAlert = {
    id: 'alert-simple-1',
    type: 'SIMPLE',
    symbolOrAddress: 'SOL',
    timeframe: '1h',
    enabled: true,
    status: 'active',
    stage: 'WATCHING',
    condition: 'ABOVE',
    targetPrice: 150.00,
    createdAt: new Date(now.getTime() - 3600000).toISOString(),
  };

  const twoStageAlert: TwoStageAlert = {
    id: 'alert-twostage-1',
    type: 'TWO_STAGE_CONFIRMED',
    symbolOrAddress: 'BONK',
    timeframe: '15m',
    enabled: true,
    status: 'active',
    stage: 'WATCHING',
    template: 'TREND_MOMENTUM_STRUCTURE',
    windowCandles: 20,
    expiryMinutes: 60,
    cooldownMinutes: 15,
    indicators: [
      { ...TEMPLATE_INDICATORS.TREND_MOMENTUM_STRUCTURE[0], triggered: true, lastValue: 'EMA9: 0.00001234' },
      { ...TEMPLATE_INDICATORS.TREND_MOMENTUM_STRUCTURE[1], triggered: false, lastValue: 'RSI: 48.5' },
      { ...TEMPLATE_INDICATORS.TREND_MOMENTUM_STRUCTURE[2], triggered: false },
    ],
    triggeredCount: 0,
    createdAt: new Date(now.getTime() - 7200000).toISOString(),
    expiresAt: new Date(now.getTime() + 1800000).toISOString(),
  };

  const confirmedTwoStage: TwoStageAlert = {
    id: 'alert-twostage-2',
    type: 'TWO_STAGE_CONFIRMED',
    symbolOrAddress: 'JUP',
    timeframe: '4h',
    enabled: true,
    status: 'triggered',
    stage: 'CONFIRMED',
    template: 'MACD_RSI_VOLUME',
    windowMinutes: 240,
    expiryMinutes: 480,
    cooldownMinutes: 30,
    indicators: [
      { ...TEMPLATE_INDICATORS.MACD_RSI_VOLUME[0], triggered: true },
      { ...TEMPLATE_INDICATORS.MACD_RSI_VOLUME[1], triggered: true },
      { ...TEMPLATE_INDICATORS.MACD_RSI_VOLUME[2], triggered: false },
    ],
    triggeredCount: 2,
    lastTriggeredAt: new Date(now.getTime() - 600000).toISOString(),
    createdAt: new Date(now.getTime() - 86400000).toISOString(),
  };

  const deadTokenAlert: DeadTokenAlert = {
    id: 'alert-deadtoken-1',
    type: 'DEAD_TOKEN_AWAKENING_V2',
    symbolOrAddress: 'RANDOM123...abc',
    timeframe: '5m',
    enabled: true,
    status: 'active',
    stage: 'WATCHING',
    params: { ...DEFAULT_DEAD_TOKEN_PARAMS },
    deadTokenStage: 'AWAKENING',
    sessionStart: new Date(now.getTime() - 1800000).toISOString(),
    sessionEndsAt: new Date(now.getTime() + 41400000).toISOString(), // 12h - 30min
    windowEndsAt: new Date(now.getTime() + 900000).toISOString(),
    createdAt: new Date(now.getTime() - 1800000).toISOString(),
  };

  const pausedAlert: SimpleAlert = {
    id: 'alert-simple-2',
    type: 'SIMPLE',
    symbolOrAddress: 'WIF',
    timeframe: '4h',
    enabled: false,
    status: 'paused',
    stage: 'INITIAL',
    condition: 'BELOW',
    targetPrice: 2.50,
    createdAt: new Date(now.getTime() - 172800000).toISOString(),
  };

  return [simpleAlert, twoStageAlert, confirmedTwoStage, deadTokenAlert, pausedAlert];
}

// ─────────────────────────────────────────────────────────────
// CREATE ALERT HELPERS
// ─────────────────────────────────────────────────────────────

interface CreateSimpleParams {
  symbolOrAddress: string;
  timeframe: string;
  condition: SimpleCondition;
  targetPrice: number;
  note?: string;
}

interface CreateTwoStageParams {
  symbolOrAddress: string;
  timeframe: string;
  template: TwoStageTemplate;
  windowCandles?: number;
  windowMinutes?: number;
  expiryMinutes: number;
  cooldownMinutes: number;
  note?: string;
}

interface CreateDeadTokenParams {
  symbolOrAddress: string;
  timeframe: string;
  params: DeadTokenParams;
  note?: string;
}

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export interface UseAlertsStoreReturn {
  pageState: UsePageStateReturn;
  alerts: Alert[];
  filteredAlerts: Alert[];
  filter: AlertStatusFilter;
  setFilter: (filter: AlertStatusFilter) => void;
  
  // CRUD
  createSimpleAlert: (params: CreateSimpleParams) => void;
  createTwoStageAlert: (params: CreateTwoStageParams) => void;
  createDeadTokenAlert: (params: CreateDeadTokenParams) => void;
  deleteAlert: (id: string) => void;
  togglePause: (id: string) => void;
  cancelWatch: (id: string) => void;
  
  // Prefill
  applyPrefill: (params: URLSearchParams) => PrefillData | null;
}

export function useAlertsStore(): UseAlertsStoreReturn {
  const pageState = usePageState('ready');
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const stored = loadAlerts();
    return stored.length > 0 ? stored : generateStubAlerts();
  });
  const [filter, setFilter] = useState<AlertStatusFilter>('all');

  // Persist on change
  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts;
    
    return alerts.filter((alert) => {
      // Map stages to filter values
      if (filter === 'active') {
        return alert.status === 'active' || alert.stage === 'WATCHING' || alert.stage === 'INITIAL';
      }
      if (filter === 'triggered') {
        return alert.status === 'triggered' || alert.stage === 'CONFIRMED';
      }
      if (filter === 'paused') {
        return alert.status === 'paused' || !alert.enabled;
      }
      return true;
    });
  }, [alerts, filter]);

  const createSimpleAlert = useCallback((params: CreateSimpleParams) => {
    const newAlert: SimpleAlert = {
      id: `alert-${Date.now()}`,
      type: 'SIMPLE',
      symbolOrAddress: params.symbolOrAddress.trim().toUpperCase(),
      timeframe: params.timeframe,
      enabled: true,
      status: 'active',
      stage: 'WATCHING',
      condition: params.condition,
      targetPrice: params.targetPrice,
      note: params.note,
      createdAt: new Date().toISOString(),
    };
    // BACKEND_TODO: persist + register worker job
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const createTwoStageAlert = useCallback((params: CreateTwoStageParams) => {
    const indicators: IndicatorState[] = TEMPLATE_INDICATORS[params.template].map((ind) => ({
      ...ind,
      triggered: false,
    }));

    const newAlert: TwoStageAlert = {
      id: `alert-${Date.now()}`,
      type: 'TWO_STAGE_CONFIRMED',
      symbolOrAddress: params.symbolOrAddress.trim().toUpperCase(),
      timeframe: params.timeframe,
      enabled: true,
      status: 'active',
      stage: 'WATCHING',
      template: params.template,
      windowCandles: params.windowCandles,
      windowMinutes: params.windowMinutes,
      expiryMinutes: params.expiryMinutes,
      cooldownMinutes: params.cooldownMinutes,
      indicators,
      triggeredCount: 0,
      note: params.note,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + params.expiryMinutes * 60000).toISOString(),
    };
    // BACKEND_TODO: SW updates indicators + stage transitions
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const createDeadTokenAlert = useCallback((params: CreateDeadTokenParams) => {
    const newAlert: DeadTokenAlert = {
      id: `alert-${Date.now()}`,
      type: 'DEAD_TOKEN_AWAKENING_V2',
      symbolOrAddress: params.symbolOrAddress.trim(),
      timeframe: params.timeframe,
      enabled: true,
      status: 'active',
      stage: 'INITIAL',
      params: params.params,
      deadTokenStage: 'INITIAL',
      note: params.note,
      createdAt: new Date().toISOString(),
    };
    // BACKEND_TODO: backend arms deadness + SW session engine
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const togglePause = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== id) return alert;
        const newEnabled = !alert.enabled;
        return {
          ...alert,
          enabled: newEnabled,
          status: newEnabled ? 'active' : 'paused',
        } as Alert;
      })
    );
  }, []);

  const cancelWatch = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== id) return alert;
        return {
          ...alert,
          stage: 'CANCELLED',
          enabled: false,
          status: 'paused',
        } as Alert;
      })
    );
  }, []);

  const applyPrefill = useCallback((params: URLSearchParams): PrefillData | null => {
    const symbol = params.get('symbol');
    const timeframe = params.get('timeframe');
    const condition = params.get('condition');
    const target = params.get('target');
    const type = params.get('type');
    const template = params.get('template');
    const windowCandles = params.get('windowCandles');
    const expiryMinutes = params.get('expiryMinutes');
    const cooldownMinutes = params.get('cooldownMinutes');

    const hasParams = symbol || timeframe || condition || target || type || template;
    if (!hasParams) return null;

    const data: PrefillData = {};
    if (symbol) data.symbol = symbol;
    if (timeframe) data.timeframe = timeframe;
    if (condition) data.condition = condition;
    if (target) {
      const parsed = parseFloat(target);
      if (!isNaN(parsed)) data.target = parsed;
    }
    if (type === 'simple' || type === 'twoStage' || type === 'deadToken') {
      data.type = type;
    }
    if (template === 'trendMomentumStructure' || template === 'macdRsiVolume' || template === 'breakoutRetestVolume') {
      data.template = template;
    }
    if (windowCandles) {
      const parsed = parseInt(windowCandles, 10);
      if (!isNaN(parsed)) data.windowCandles = parsed;
    }
    if (expiryMinutes) {
      const parsed = parseInt(expiryMinutes, 10);
      if (!isNaN(parsed)) data.expiryMinutes = parsed;
    }
    if (cooldownMinutes) {
      const parsed = parseInt(cooldownMinutes, 10);
      if (!isNaN(parsed)) data.cooldownMinutes = parsed;
    }

    // BACKEND_TODO: schema validation
    return data;
  }, []);

  return {
    pageState,
    alerts,
    filteredAlerts,
    filter,
    setFilter,
    createSimpleAlert,
    createTwoStageAlert,
    createDeadTokenAlert,
    deleteAlert,
    togglePause,
    cancelWatch,
    applyPrefill,
  };
}
