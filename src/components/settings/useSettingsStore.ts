import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppSettingsV1, TierLevel, BudgetRow } from './types';
import { DEFAULT_SETTINGS, TIER_DEFAULTS } from './types';

const STORAGE_KEY = 'app_settings_v1';

// Legacy keys for migration
const LEGACY_KEYS = {
  chartDefaultTimeframe: 'chartDefaultTimeframe',
  chartShowVolume: 'chartShowVolume',
  chartCandleStyle: 'chartCandleStyle',
  monitorAutoRefresh: 'monitorAutoRefresh',
  monitorRefreshInterval: 'monitorRefreshInterval',
  monitorPerfMode: 'monitorPerfMode',
  notifyAlerts: 'notifyAlerts',
  notifyJournal: 'notifyJournal',
  notifySound: 'notifySound',
  riskDefaultPercent: 'riskDefaultPercent',
  riskMaxPosition: 'riskMaxPosition',
  riskStopType: 'riskStopType',
  connectedWallets: 'connectedWallets',
  lastExportDate: 'lastExportDate',
  theme: 'sparkfined_theme_v1',
  reduceMotion: 'sparkfined_reduce_motion_v1',
  compactMode: 'sparkfined_compact_mode_v1',
} as const;

function migrateLegacySettings(): Partial<AppSettingsV1> | null {
  const migrated: Partial<AppSettingsV1> = {};
  let hasMigrations = false;

  // Chart settings
  const chartTimeframe = localStorage.getItem(LEGACY_KEYS.chartDefaultTimeframe);
  const chartVolume = localStorage.getItem(LEGACY_KEYS.chartShowVolume);
  const chartStyle = localStorage.getItem(LEGACY_KEYS.chartCandleStyle);
  
  if (chartTimeframe || chartVolume || chartStyle) {
    migrated.chart = {
      defaultTimeframe: chartTimeframe || DEFAULT_SETTINGS.chart.defaultTimeframe,
      showVolume: chartVolume === 'true' || chartVolume === null,
      candleStyle: (chartStyle as 'candles' | 'heikin-ashi' | 'bars') || DEFAULT_SETTINGS.chart.candleStyle,
    };
    hasMigrations = true;
  }

  // Risk settings
  const riskPercent = localStorage.getItem(LEGACY_KEYS.riskDefaultPercent);
  const riskMax = localStorage.getItem(LEGACY_KEYS.riskMaxPosition);
  const riskStop = localStorage.getItem(LEGACY_KEYS.riskStopType);
  
  if (riskPercent || riskMax || riskStop) {
    migrated.risk = {
      defaultPercent: riskPercent ? parseFloat(riskPercent) : DEFAULT_SETTINGS.risk.defaultPercent,
      maxPosition: riskMax ? parseFloat(riskMax) : DEFAULT_SETTINGS.risk.maxPosition,
      stopType: (riskStop as 'percent' | 'atr' | 'fixed') || DEFAULT_SETTINGS.risk.stopType,
    };
    hasMigrations = true;
  }

  // UI settings
  const reduceMotion = localStorage.getItem(LEGACY_KEYS.reduceMotion);
  const compactMode = localStorage.getItem(LEGACY_KEYS.compactMode);
  
  if (reduceMotion !== null || compactMode !== null) {
    migrated.ui = {
      theme: 'dark',
      reduceMotion: reduceMotion === 'true',
      compactMode: compactMode === 'true',
    };
    hasMigrations = true;
  }

  // Wallets
  const wallets = localStorage.getItem(LEGACY_KEYS.connectedWallets);
  if (wallets) {
    try {
      migrated.connectedWallets = JSON.parse(wallets);
      hasMigrations = true;
    } catch {
      // ignore
    }
  }

  // Export date
  const exportDate = localStorage.getItem(LEGACY_KEYS.lastExportDate);
  if (exportDate) {
    migrated.backup = { lastExportAt: exportDate };
    hasMigrations = true;
  }

  return hasMigrations ? migrated : null;
}

function loadSettings(): AppSettingsV1 {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as AppSettingsV1;
      // Validate version and coerce missing fields
      if (parsed.version === 1) {
        return mergeWithDefaults(parsed);
      }
    }

    // No stored settings - check for legacy migration
    const legacy = migrateLegacySettings();
    if (legacy) {
      const settings = mergeWithDefaults({ ...DEFAULT_SETTINGS, ...legacy });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return settings;
    }

    // Fresh start
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function mergeWithDefaults(partial: Partial<AppSettingsV1>): AppSettingsV1 {
  return {
    version: 1,
    tier: { ...DEFAULT_SETTINGS.tier, ...partial.tier },
    budgets: partial.budgets?.length ? partial.budgets : DEFAULT_SETTINGS.budgets,
    providers: {
      openai: { ...DEFAULT_SETTINGS.providers.openai, ...partial.providers?.openai },
      deepseek: { ...DEFAULT_SETTINGS.providers.deepseek, ...partial.providers?.deepseek },
      grok: { ...DEFAULT_SETTINGS.providers.grok, ...partial.providers?.grok },
    },
    cache: {
      ...DEFAULT_SETTINGS.cache,
      ...partial.cache,
      reasoning: { ...DEFAULT_SETTINGS.cache.reasoning, ...partial.cache?.reasoning },
      grokPulse: { ...DEFAULT_SETTINGS.cache.grokPulse, ...partial.cache?.grokPulse },
    },
    alerts: { ...DEFAULT_SETTINGS.alerts, ...partial.alerts },
    push: { ...DEFAULT_SETTINGS.push, ...partial.push },
    diagnostics: { ...DEFAULT_SETTINGS.diagnostics, ...partial.diagnostics },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...partial.privacy },
    risk: { ...DEFAULT_SETTINGS.risk, ...partial.risk },
    ui: { ...DEFAULT_SETTINGS.ui, ...partial.ui },
    chart: { ...DEFAULT_SETTINGS.chart, ...partial.chart },
    backup: { ...DEFAULT_SETTINGS.backup, ...partial.backup },
    connectedWallets: partial.connectedWallets || DEFAULT_SETTINGS.connectedWallets,
  };
}

export function useSettingsStore() {
  const [settings, setSettings] = useState<AppSettingsV1>(() => loadSettings());

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettingsV1>) => {
    setSettings(prev => mergeWithDefaults({ ...prev, ...updates }));
  }, []);

  const updateTier = useCallback((level: TierLevel) => {
    setSettings(prev => {
      const tierDefaults = TIER_DEFAULTS[level];
      
      // Merge budgets: preserve custom overrides for VIP/ADMIN
      const newBudgets: BudgetRow[] = tierDefaults.budgets.map(defaultBudget => {
        const existing = prev.budgets.find(
          b => b.provider === defaultBudget.provider && b.useCase === defaultBudget.useCase
        );
        
        // If existing has custom=true and tier is VIP/ADMIN, preserve user value
        if (existing?.custom && (level === 'VIP' || level === 'ADMIN')) {
          return existing;
        }
        
        return { ...defaultBudget, custom: false };
      });

      // Handle throttles: preserve if customThrottles is true
      const preserveThrottles = prev.tier.customThrottles && (level === 'VIP' || level === 'ADMIN');

      return mergeWithDefaults({
        ...prev,
        tier: {
          level,
          maxCallsPerMinute: preserveThrottles ? prev.tier.maxCallsPerMinute : tierDefaults.maxCallsPerMinute,
          maxConcurrentCalls: preserveThrottles ? prev.tier.maxConcurrentCalls : tierDefaults.maxConcurrentCalls,
          adminFailOpen: level === 'ADMIN' ? prev.tier.adminFailOpen : undefined,
          customThrottles: preserveThrottles ? true : undefined,
        },
        budgets: newBudgets,
      });
    });
  }, []);

  const applyTierDefaults = useCallback(() => {
    setSettings(prev => {
      const tierDefaults = TIER_DEFAULTS[prev.tier.level];
      
      return mergeWithDefaults({
        ...prev,
        tier: {
          level: prev.tier.level,
          maxCallsPerMinute: tierDefaults.maxCallsPerMinute,
          maxConcurrentCalls: tierDefaults.maxConcurrentCalls,
          adminFailOpen: prev.tier.level === 'ADMIN' ? prev.tier.adminFailOpen : undefined,
          customThrottles: false,
        },
        budgets: tierDefaults.budgets.map(b => ({ ...b, custom: false })),
      });
    });
  }, []);

  const updateBudget = useCallback((provider: string, useCase: string, callsPerDay: number) => {
    setSettings(prev => ({
      ...prev,
      budgets: prev.budgets.map(b =>
        b.provider === provider && b.useCase === useCase
          ? { ...b, callsPerDay, custom: true }
          : b
      ),
    }));
  }, []);

  const toggleBudgetCustom = useCallback((provider: string, useCase: string, custom: boolean) => {
    setSettings(prev => {
      const tierDefaults = TIER_DEFAULTS[prev.tier.level];
      const defaultBudget = tierDefaults.budgets.find(
        b => b.provider === provider && b.useCase === useCase
      );

      return {
        ...prev,
        budgets: prev.budgets.map(b =>
          b.provider === provider && b.useCase === useCase
            ? { ...b, custom, callsPerDay: custom ? b.callsPerDay : (defaultBudget?.callsPerDay ?? b.callsPerDay) }
            : b
        ),
      };
    });
  }, []);

  const resetToDefaults = useCallback((keepWallets = true) => {
    const walletsToKeep = keepWallets ? settings.connectedWallets : [];
    const newSettings = {
      ...DEFAULT_SETTINGS,
      connectedWallets: walletsToKeep,
    };
    setSettings(newSettings);
  }, [settings.connectedWallets]);

  const exportSettings = useCallback(() => {
    const now = new Date().toISOString();
    const exportData = {
      ...settings,
      backup: { lastExportAt: now },
    };
    
    // Update lastExportAt in state
    setSettings(prev => ({
      ...prev,
      backup: { lastExportAt: now },
    }));

    // Also set legacy key for SetupCompleteness
    localStorage.setItem('lastExportDate', now);

    // Download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sparkfined-settings-${now.split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return true;
  }, [settings]);

  const importSettings = useCallback((jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate
      if (parsed.version !== 1) {
        return { success: false, error: 'Invalid settings version' };
      }
      
      if (!parsed.tier || !parsed.budgets || !parsed.providers) {
        return { success: false, error: 'Missing required settings fields' };
      }

      const merged = mergeWithDefaults(parsed);
      setSettings(merged);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid JSON format' };
    }
  }, []);

  const isEditable = useMemo(() => {
    return settings.tier.level === 'VIP' || settings.tier.level === 'ADMIN';
  }, [settings.tier.level]);

  return {
    settings,
    updateSettings,
    updateTier,
    applyTierDefaults,
    updateBudget,
    toggleBudgetCustom,
    resetToDefaults,
    exportSettings,
    importSettings,
    isEditable,
  };
}
