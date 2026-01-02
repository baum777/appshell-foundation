/**
 * GrokPulseLastRunWidget - Shows last pulse run metadata
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock, XCircle, Zap } from 'lucide-react';

import { fetchGrokLastRun } from '@/services/api/grokPulse';

function formatRelativeTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function GrokPulseLastRunWidget() {
  const { data: lastRun, isLoading, isError } = useQuery({
    queryKey: ['grokPulse', 'lastRun'],
    queryFn: fetchGrokLastRun,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Loading state
  if (isLoading) {
    return (
      <Card data-testid="grok-pulse-last-run">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card data-testid="grok-pulse-last-run">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Grok Pulse Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Failed to load run status
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!lastRun) {
    return (
      <Card data-testid="grok-pulse-last-run">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Grok Pulse Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No runs yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="grok-pulse-last-run">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Grok Pulse Status
          </CardTitle>
          <Badge variant={lastRun.success ? 'default' : 'destructive'}>
            {lastRun.success ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Success
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Failed
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatRelativeTime(lastRun.ts)}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium">{lastRun.tokensProcessed}</span>
          <span className="text-muted-foreground"> tokens processed</span>
        </div>
        {lastRun.duration_ms !== undefined && (
          <div className="text-xs text-muted-foreground">
            Duration: {(lastRun.duration_ms / 1000).toFixed(1)}s
          </div>
        )}
      </CardContent>
    </Card>
  );
}
