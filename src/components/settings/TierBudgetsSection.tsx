import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsSectionCard } from "./SettingsSectionCard";
import { SettingsRow } from "./SettingsRow";
import type { AppSettingsV1, TierLevel, BudgetRow, Provider, UseCase } from "./types";
import { TIER_DEFAULTS, PROVIDER_LABELS, USE_CASE_LABELS, ROUTING_MAP } from "./types";
import { cn } from "@/lib/utils";

interface TierBudgetsSectionProps {
  settings: AppSettingsV1;
  usedToday: Record<string, Record<string, number>>;
  onTierChange: (tier: TierLevel) => void;
  onBudgetChange: (provider: string, useCase: string, value: number) => void;
  onToggleCustom: (provider: string, useCase: string, custom: boolean) => void;
  onThrottleChange: (field: 'maxCallsPerMinute' | 'maxConcurrentCalls', value: number) => void;
  isEditable: boolean;
}

const TIERS: TierLevel[] = ['FREE', 'PRO', 'VIP', 'ADMIN'];

function getBudgetStatus(used: number, limit: number): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  const remaining = limit - used;
  const percentRemaining = remaining / limit;
  
  if (remaining <= 0) {
    return { label: 'Blocked', variant: 'destructive' };
  }
  if (percentRemaining <= 0.1) {
    return { label: 'Near limit', variant: 'secondary' };
  }
  return { label: 'OK', variant: 'default' };
}

export function TierBudgetsSection({
  settings,
  usedToday,
  onTierChange,
  onBudgetChange,
  onToggleCustom,
  onThrottleChange,
  isEditable,
}: TierBudgetsSectionProps) {
  const tierLevel = settings.tier.level;

  return (
    <SettingsSectionCard
      title="Tier & Budgets"
      description="API limits and provider routing"
    >
      <div className="space-y-6" data-testid="settings-tier-budgets" id="card-tier-budgets">
        {/* Tier Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tier Level</label>
          <div
            className="inline-flex rounded-lg border border-border bg-muted/30 p-1"
            data-testid="settings-tier-selector"
            role="radiogroup"
            aria-label="Select tier level"
          >
            {TIERS.map((tier) => (
              <button
                key={tier}
                role="radio"
                aria-checked={tierLevel === tier}
                onClick={() => onTierChange(tier)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  tierLevel === tier
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Table */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">API Budgets</label>
          <div className="rounded-lg border border-border overflow-hidden" data-testid="settings-budget-table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Provider</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Use Case</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Calls/day</th>
                    {isEditable && (
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">Custom</th>
                    )}
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Used</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Remain</th>
                    <th className="px-3 py-2 text-center font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {settings.budgets.map((budget) => {
                    const used = usedToday[budget.provider]?.[budget.useCase] || 0;
                    const remaining = Math.max(0, budget.callsPerDay - used);
                    const status = getBudgetStatus(used, budget.callsPerDay);
                    
                    return (
                      <tr key={`${budget.provider}-${budget.useCase}`} className="hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">{PROVIDER_LABELS[budget.provider]}</td>
                        <td className="px-3 py-2 text-muted-foreground">{USE_CASE_LABELS[budget.useCase]}</td>
                        <td className="px-3 py-2 text-right">
                          {isEditable && budget.custom ? (
                            <Input
                              type="number"
                              min={0}
                              max={99999}
                              value={budget.callsPerDay}
                              onChange={(e) => onBudgetChange(budget.provider, budget.useCase, parseInt(e.target.value) || 0)}
                              className="w-20 h-7 text-right text-sm ml-auto"
                            />
                          ) : (
                            <span className="tabular-nums">{budget.callsPerDay}</span>
                          )}
                        </td>
                        {isEditable && (
                          <td className="px-3 py-2 text-center">
                            <Switch
                              checked={budget.custom}
                              onCheckedChange={(checked) => onToggleCustom(budget.provider, budget.useCase, checked)}
                              aria-label={`Custom override for ${budget.provider} ${budget.useCase}`}
                            />
                          </td>
                        )}
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{used}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{remaining}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global Throttles */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Global Throttles</label>
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsRow label="Max calls/min" description="Rate limit across all providers">
              {isEditable ? (
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={settings.tier.maxCallsPerMinute}
                  onChange={(e) => onThrottleChange('maxCallsPerMinute', parseInt(e.target.value) || 30)}
                  className="w-20 h-8 text-right"
                />
              ) : (
                <Badge variant="secondary" className="tabular-nums">{settings.tier.maxCallsPerMinute}</Badge>
              )}
            </SettingsRow>
            <SettingsRow label="Max concurrent" description="Parallel requests limit">
              {isEditable ? (
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.tier.maxConcurrentCalls}
                  onChange={(e) => onThrottleChange('maxConcurrentCalls', parseInt(e.target.value) || 2)}
                  className="w-20 h-8 text-right"
                />
              ) : (
                <Badge variant="secondary" className="tabular-nums">{settings.tier.maxConcurrentCalls}</Badge>
              )}
            </SettingsRow>
          </div>
        </div>

        {/* Routing Map */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Routing Map</label>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(Object.entries(ROUTING_MAP) as [UseCase, Provider][]).map(([useCase, provider]) => (
                <div key={useCase} className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-background">
                  <span className="text-muted-foreground">{USE_CASE_LABELS[useCase]}</span>
                  <span className="font-medium">→ {PROVIDER_LABELS[provider]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SettingsSectionCard>
  );
}
