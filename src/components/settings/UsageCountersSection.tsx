import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SettingsSectionCard } from "./SettingsSectionCard";
import type { AppUsageV1 } from "./usageTypes";
import type { Provider, UseCase } from "./types";
import { PROVIDER_LABELS, USE_CASE_LABELS } from "./types";
import { Activity, AlertTriangle, ChevronDown, Clock, Copy, Database, RefreshCw, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UsageCountersSectionProps {
  usage: AppUsageV1;
  totalCallsToday: number;
  totalErrorsToday: number;
  totalCacheHits: number;
  overallAvgLatency: number;
  onResetCounters: () => void;
  onCopyDiagnostics: () => void;
}

export function UsageCountersSection({
  usage,
  totalCallsToday,
  totalErrorsToday,
  totalCacheHits,
  overallAvgLatency,
  onResetCounters,
  onCopyDiagnostics,
}: UsageCountersSectionProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  
  // Calculate cache hit rate
  const totalCacheOps = totalCacheHits + totalCallsToday;
  const cacheHitRate = totalCacheOps > 0 ? Math.round((totalCacheHits / totalCacheOps) * 100) : 0;

  return (
    <SettingsSectionCard
      title="Usage & Counters"
      description="Today's API activity and performance"
    >
      <div className="space-y-4" data-testid="settings-usage-counters" id="card-usage-counters">
        {/* Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Total Calls
            </div>
            <div className="text-2xl font-bold tabular-nums">{totalCallsToday}</div>
          </div>
          
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5" />
              Cache Hit Rate
            </div>
            <div className="text-2xl font-bold tabular-nums">{cacheHitRate}%</div>
          </div>
          
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Avg Latency
            </div>
            <div className="text-2xl font-bold tabular-nums">{overallAvgLatency}ms</div>
          </div>
          
          <div className={cn(
            "rounded-lg border p-3 space-y-1",
            totalErrorsToday > 0 ? "border-destructive/50 bg-destructive/10" : "border-border bg-muted/20"
          )}>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Errors
            </div>
            <div className={cn(
              "text-2xl font-bold tabular-nums",
              totalErrorsToday > 0 && "text-destructive"
            )}>
              {totalErrorsToday}
            </div>
          </div>
        </div>

        {/* Tokens indicator */}
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tokens</span>
          <Badge variant="secondary" className="text-xs">n/a</Badge>
        </div>

        {/* Expandable Breakdown */}
        <Collapsible open={breakdownOpen} onOpenChange={setBreakdownOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Detailed Breakdown
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                breakdownOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 rounded-lg border border-border overflow-hidden" data-testid="settings-usage-breakdown">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Provider</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Use Case</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Calls</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Errors</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Avg ms</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(['openai', 'deepseek', 'grok'] as Provider[]).map(provider =>
                    (Object.keys(USE_CASE_LABELS) as UseCase[])
                      .filter(uc => {
                        const calls = usage.counters.callsToday[provider]?.[uc] || 0;
                        const errors = usage.counters.errorsToday[provider]?.[uc] || 0;
                        return calls > 0 || errors > 0;
                      })
                      .map(useCase => (
                        <tr key={`${provider}-${useCase}`} className="hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium">{PROVIDER_LABELS[provider]}</td>
                          <td className="px-3 py-2 text-muted-foreground">{USE_CASE_LABELS[useCase]}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {usage.counters.callsToday[provider]?.[useCase] || 0}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {usage.counters.errorsToday[provider]?.[useCase] || 0}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {usage.counters.avgLatencyMs[provider]?.[useCase] || '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground">n/a</td>
                        </tr>
                      ))
                  )}
                  {totalCallsToday === 0 && totalErrorsToday === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                        No activity recorded today
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Last Error */}
        {usage.counters.lastError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              Last Error
            </div>
            <div className="text-sm">
              <span className="font-mono text-destructive">[{usage.counters.lastError.code}]</span>{' '}
              {usage.counters.lastError.message}
            </div>
            <div className="text-xs text-muted-foreground">
              {PROVIDER_LABELS[usage.counters.lastError.provider]} / {USE_CASE_LABELS[usage.counters.lastError.useCase]} • 
              {' '}{new Date(usage.counters.lastError.ts).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onResetCounters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Counters
          </Button>
          <Button variant="outline" size="sm" onClick={onCopyDiagnostics}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Diagnostics
          </Button>
        </div>
      </div>
    </SettingsSectionCard>
  );
}
