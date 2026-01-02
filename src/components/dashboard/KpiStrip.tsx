import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiTileStub } from '@/stubs/contracts';

interface KpiStripProps {
  kpis: KpiTileStub[];
}

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: 'text-chart-positive',
  down: 'text-chart-negative',
  neutral: 'text-muted-foreground',
};

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <section aria-label="Key performance indicators">
        <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((kpi) => {
            const TrendIcon = kpi.trend ? trendIcons[kpi.trend] : Minus;
            const trendColor = kpi.trend ? trendColors[kpi.trend] : 'text-muted-foreground';

            return (
              <Card key={kpi.id} className="bg-card/50 border-border/50">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-1">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                          {kpi.label}
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              type="button"
                              className="shrink-0 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                              aria-label={`Info about ${kpi.label}`}
                            >
                              <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs">{kpi.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                        {kpi.value}
                      </p>
                    </div>
                    {kpi.change !== undefined && (
                      <div className={`flex items-center gap-0.5 shrink-0 ${trendColor}`}>
                        <TrendIcon className="h-3 w-3" aria-hidden="true" />
                        <span className="text-[10px] sm:text-xs font-medium">
                          {kpi.change > 0 ? '+' : ''}{kpi.change}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}
