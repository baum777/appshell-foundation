import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, LineChart, Eye, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { fetchDailyBias, getCachedDailyBias } from '@/lib/api/feed';
import { FeedCardItem } from '@/components/feed/FeedCardItem';

export function DailyBiasCard() {
  const navigate = useNavigate();
  
  // Get initial cached data
  const [initialData] = useState(() => getCachedDailyBias());

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['feed', 'dailyBias'],
    queryFn: fetchDailyBias,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    initialData: initialData ?? undefined,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state with animated skeleton
  if (isLoading && !data) {
    return (
      <Card data-testid="daily-bias-card" className="bg-card/50 border-border/50 animate-fade-in">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Daily Bias
            </CardTitle>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Title skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" style={{ animationDelay: '0ms' }} />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" style={{ animationDelay: '50ms' }} />
              <Skeleton className="h-5 w-14 rounded-full" style={{ animationDelay: '100ms' }} />
            </div>
          </div>
          {/* Description skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" style={{ animationDelay: '150ms' }} />
            <Skeleton className="h-4 w-2/3" style={{ animationDelay: '200ms' }} />
          </div>
          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-4 w-20" style={{ animationDelay: '250ms' }} />
            <Skeleton className="h-2 w-24 rounded-full" style={{ animationDelay: '300ms' }} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state without data
  if (isError && !data) {
    return (
      <Card data-testid="daily-bias-card" className="bg-card/50 border-border/50">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Daily Bias
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleRefresh}
              aria-label="Refresh daily bias"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load bias data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card data-testid="daily-bias-card" className="bg-card/50 border-border/50">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Daily Bias
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleRefresh}
              disabled={isFetching}
              aria-label="Refresh daily bias"
            >
              {isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No bias data available</p>
        </CardContent>
      </Card>
    );
  }

  // Render feed card in compact mode
  return (
    <div data-testid="daily-bias-card">
      <FeedCardItem card={data} compact />
    </div>
  );
}

export function HoldingsCard() {
  // BACKEND_TODO: Fetch holdings data from backend
  const holdings = [
    { symbol: 'BTC', amount: '0.00', value: '$0.00' },
    { symbol: 'ETH', amount: '0.00', value: '$0.00' },
    { symbol: 'SOL', amount: '0.00', value: '$0.00' },
  ];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Holdings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5 sm:space-y-3">
          {holdings.map((holding) => (
            <div key={holding.symbol} className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{holding.symbol}</span>
              <div className="text-right">
                <span className="text-sm text-foreground">{holding.amount}</span>
                <span className="text-xs text-muted-foreground ml-2">{holding.value}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function LastTradesCard() {
  // BACKEND_TODO: Fetch recent trades from backend
  const trades = [
    { symbol: 'BTC', side: 'LONG' as const, pnl: '+2.4R' },
    { symbol: 'ETH', side: 'SHORT' as const, pnl: '-0.5R' },
  ];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Last Trades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5 sm:space-y-3">
          {trades.map((trade, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={trade.side === 'LONG' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {trade.side}
                </Badge>
                <span className="text-sm font-medium text-foreground">{trade.symbol}</span>
              </div>
              <span className={`text-sm font-medium ${trade.pnl.startsWith('+') ? 'text-chart-positive' : 'text-chart-negative'}`}>
                {trade.pnl}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function InsightCard() {
  // BACKEND_TODO: Fetch insights from backend
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Quick Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your win rate improved by 8% this week. Most profitable setups: breakout patterns.
        </p>
      </CardContent>
    </Card>
  );
}
