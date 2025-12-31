import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, LineChart, Eye, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export function DailyBiasCard() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // BACKEND_TODO: Fetch daily bias analysis from backend
  const bias = {
    direction: 'bullish' as const,
    confidence: 72,
    summary: 'Strong momentum with key support holding. Watch for breakout above resistance.',
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // BACKEND_TODO: Actually refresh data from backend
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  return (
    <Card className="bg-card/50 border-border/50">
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
            disabled={isRefreshing}
            aria-label="Refresh daily bias"
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${bias.direction === 'bullish' ? 'bg-chart-positive/10' : 'bg-chart-negative/10'}`}>
            {bias.direction === 'bullish' ? (
              <TrendingUp className="h-5 w-5 text-chart-positive" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-5 w-5 text-chart-negative" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground capitalize">{bias.direction}</span>
              <Badge variant="secondary" className="text-xs">
                {bias.confidence}% confidence
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{bias.summary}</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5 text-xs sm:text-sm"
            onClick={() => navigate('/oracle')}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">View analysis</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5 text-xs sm:text-sm"
            onClick={() => navigate('/chart')}
          >
            <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">Open chart</span>
          </Button>
        </div>
      </CardContent>
    </Card>
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
