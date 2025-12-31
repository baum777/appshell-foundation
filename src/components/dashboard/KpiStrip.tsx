import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <TooltipProvider>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => {
          const TrendIcon = kpi.trend ? trendIcons[kpi.trend] : Minus;
          const trendColor = kpi.trend ? trendColors[kpi.trend] : 'text-muted-foreground';

          return (
            <Card key={kpi.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {kpi.label}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <p className="text-xs">{kpi.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                  </div>
                  {kpi.change !== undefined && (
                    <Badge 
                      variant="secondary" 
                      className={`flex items-center gap-1 ${trendColor} bg-transparent border-0 px-0`}
                    >
                      <TrendIcon className="h-3 w-3" />
                      <span className="text-xs">
                        {kpi.change > 0 ? '+' : ''}{kpi.change}
                        {typeof kpi.change === 'number' && !kpi.label.includes('Rate') ? '' : '%'}
                      </span>
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
