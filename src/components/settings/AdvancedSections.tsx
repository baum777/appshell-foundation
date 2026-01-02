import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsSectionCard } from "./SettingsSectionCard";
import { SettingsRow } from "./SettingsRow";
import type { AppSettingsV1 } from "./types";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CacheOfflineSectionProps {
  settings: AppSettingsV1;
  onUpdate: (path: string, value: boolean | number) => void;
}

export function CacheOfflineSection({ settings, onUpdate }: CacheOfflineSectionProps) {
  const handleClearCaches = async () => {
    // Clear localStorage keys starting with cache_ or temp_
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cache_') || key.startsWith('temp_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Best-effort IndexedDB clear
    try {
      const dbs = await indexedDB.databases?.();
      if (dbs) {
        for (const db of dbs) {
          if (db.name?.includes('cache')) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      }
      toast.success('Caches cleared');
    } catch {
      toast.success('LocalStorage caches cleared (IndexedDB not supported)');
    }
  };

  return (
    <SettingsSectionCard title="Cache & Offline" description="Local storage and caching">
      <div className="space-y-4" data-testid="settings-cache-offline" id="card-cache-offline">
        <SettingsRow label="Enable IndexedDB" description="Use IndexedDB for larger cache">
          <Switch
            checked={settings.cache.enableIndexedDB}
            onCheckedChange={(checked) => onUpdate('cache.enableIndexedDB', checked)}
          />
        </SettingsRow>
        <SettingsRow label="Max cache entries" description="Maximum cached items">
          <Input
            type="number"
            min={100}
            max={5000}
            value={settings.cache.maxEntries}
            onChange={(e) => onUpdate('cache.maxEntries', parseInt(e.target.value) || 500)}
            className="w-24 h-8 text-right"
          />
        </SettingsRow>
        <SettingsRow label="Reasoning TTL (min)" description="Cache duration for reasoning">
          <Input
            type="number"
            min={5}
            max={1440}
            value={settings.cache.reasoning.ttlMin}
            onChange={(e) => onUpdate('cache.reasoning.ttlMin', parseInt(e.target.value) || 60)}
            className="w-20 h-8 text-right"
          />
        </SettingsRow>
        <SettingsRow label="Grok Pulse TTL (min)" description="Cache duration for pulse">
          <Input
            type="number"
            min={5}
            max={1440}
            value={settings.cache.grokPulse.ttlMin}
            onChange={(e) => onUpdate('cache.grokPulse.ttlMin', parseInt(e.target.value) || 15)}
            className="w-20 h-8 text-right"
          />
        </SettingsRow>
        <Button variant="outline" size="sm" onClick={handleClearCaches}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Caches
        </Button>
      </div>
    </SettingsSectionCard>
  );
}

interface PushAlertsSectionProps {
  settings: AppSettingsV1;
  onUpdate: (path: string, value: boolean | number) => void;
}

export function PushAlertsSection({ settings, onUpdate }: PushAlertsSectionProps) {
  const hasVapid = !!localStorage.getItem('vapid_public_key');
  // BACKEND HOOK for real VAPID config

  return (
    <SettingsSectionCard title="Push & Alerts" description="Notification settings">
      <div className="space-y-4" data-testid="settings-push-alerts" id="card-push-alerts">
        <SettingsRow label="Push notifications" description="Enable push notifications">
          <Switch
            checked={settings.push.enabled}
            onCheckedChange={(checked) => onUpdate('push.enabled', checked)}
          />
        </SettingsRow>
        <SettingsRow label="Alert cooldown (min)" description="Minimum time between alerts">
          <Input
            type="number"
            min={1}
            max={120}
            value={settings.alerts.cooldownMin}
            onChange={(e) => onUpdate('alerts.cooldownMin', parseInt(e.target.value) || 10)}
            className="w-20 h-8 text-right"
          />
        </SettingsRow>
        <SettingsRow label="Max active alerts" description="Maximum concurrent alerts">
          <Input
            type="number"
            min={10}
            max={500}
            value={settings.alerts.maxActive}
            onChange={(e) => onUpdate('alerts.maxActive', parseInt(e.target.value) || 50)}
            className="w-20 h-8 text-right"
          />
        </SettingsRow>
        <SettingsRow label="VAPID configured" description="Push service ready">
          <Badge variant={hasVapid ? 'default' : 'secondary'}>{hasVapid ? 'Yes' : 'No'}</Badge>
        </SettingsRow>
      </div>
    </SettingsSectionCard>
  );
}

interface PrivacyDiagnosticsSectionProps {
  settings: AppSettingsV1;
  onUpdate: (path: string, value: boolean | number) => void;
  onExportSettings: () => void;
  onExportMetrics: () => void;
}

export function PrivacyDiagnosticsSection({ settings, onUpdate, onExportSettings, onExportMetrics }: PrivacyDiagnosticsSectionProps) {
  return (
    <SettingsSectionCard title="Privacy & Diagnostics" description="Logging and export options">
      <div className="space-y-4" data-testid="settings-privacy-diagnostics" id="card-privacy-diagnostics">
        <SettingsRow label="Enable metrics" description="Collect usage metrics locally">
          <Switch
            checked={settings.diagnostics.enableMetrics}
            onCheckedChange={(checked) => onUpdate('diagnostics.enableMetrics', checked)}
          />
        </SettingsRow>
        <SettingsRow label="Store last N events" description="Event buffer size">
          <select
            value={settings.diagnostics.storeLastNEvents}
            onChange={(e) => onUpdate('diagnostics.storeLastNEvents', parseInt(e.target.value))}
            className="h-8 px-2 rounded border border-border bg-background text-sm"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </SettingsRow>
        <SettingsRow label="Redact prompts in logs" description="Hide sensitive data">
          <Switch
            checked={settings.privacy.redactPromptsInLogs}
            onCheckedChange={(checked) => onUpdate('privacy.redactPromptsInLogs', checked)}
          />
        </SettingsRow>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onExportSettings}>Export Settings JSON</Button>
          <Button variant="outline" size="sm" onClick={onExportMetrics}>Export Metrics JSON</Button>
        </div>
      </div>
    </SettingsSectionCard>
  );
}
