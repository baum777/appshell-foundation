import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, LineChart, Eye, TrendingUp, TrendingDown } from 'lucide-react';

export function DailyBiasCard() {
  const navigate = useNavigate();

  // BACKEND_TODO: Fetch daily bias analysis from backend
  const bias = {
    direction: 'bullish' as const,
    confidence: 72,
    summary: 'Strong momentum with key support holding. Watch for breakout above resistance.',
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Daily Bias</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bias.direction === 'bullish' ? 'bg-chart-positive/10' : 'bg-chart-negative/10'}`}>
            {bias.direction === 'bullish' ? (
              <TrendingUp className="h-5 w-5 text-chart-positive" />
            ) : (
              <TrendingDown className="h-5 w-5 text-chart-negative" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground capitalize">{bias.direction}</span>
              <Badge variant="secondary" className="text-xs">
                {bias.confidence}% confidence
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{bias.summary}</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5"
            onClick={() => navigate('/oracle')}
          >
            <Eye className="h-3.5 w-3.5" />
            View analysis
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5"
            onClick={() => navigate('/chart')}
          >
            <LineChart className="h-3.5 w-3.5" />
            Open chart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function HoldingsCard() {
  // BACKEND_TODO: Fetch holdings data from backend
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {['BTC', 'ETH', 'SOL'].map((symbol) => (
            <div key={symbol} className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{symbol}</span>
              <div className="text-right">
                <span className="text-sm text-foreground">0.00</span>
                <span className="text-xs text-muted-foreground ml-2">$0.00</span>
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
    { symbol: 'BTC', side: 'LONG', pnl: '+2.4R' },
    { symbol: 'ETH', side: 'SHORT', pnl: '-0.5R' },
  ];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Last Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trades.map((trade, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={trade.side === 'LONG' ? 'default' : 'secondary'} className="text-xs">
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
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Quick Insight</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Your win rate improved by 8% this week. Most profitable setups: breakout patterns.
        </p>
      </CardContent>
    </Card>
  );
}
