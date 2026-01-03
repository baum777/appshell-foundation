import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeedToggle, getStoredFeedMode } from "./FeedToggle";
import { FeedCardItem } from "./FeedCardItem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle } from "lucide-react";
import {
  fetchOracleFeed,
  fetchPulseFeed,
  getCachedOracleFeed,
  getCachedPulseFeed,
} from "@/lib/api/feed";
import type { FeedCard } from "@/types/feed";

interface ChartFeedPanelProps {
  assetId: string;
}

export function ChartFeedPanel({ assetId }: ChartFeedPanelProps) {
  const [mode, setMode] = useState<"oracle" | "pulse">(getStoredFeedMode);

  // Get initial cached data for instant display
  const [initialData] = useState<FeedCard[] | undefined>(() => {
    const cached = mode === "oracle" 
      ? getCachedOracleFeed(assetId) 
      : getCachedPulseFeed(assetId);
    return cached ?? undefined;
  });

  // Oracle query
  const oracleQuery = useQuery({
    queryKey: ["grokPulse", "feed", "oracle", assetId],
    queryFn: () => fetchOracleFeed(assetId),
    enabled: mode === "oracle" && !!assetId,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: true,
    initialData: mode === "oracle" ? initialData : undefined,
  });

  // Pulse query
  const pulseQuery = useQuery({
    queryKey: ["grokPulse", "feed", "pulse", assetId],
    queryFn: () => fetchPulseFeed(assetId),
    enabled: mode === "pulse" && !!assetId,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    initialData: mode === "pulse" ? initialData : undefined,
  });

  const activeQuery = mode === "oracle" ? oracleQuery : pulseQuery;
  const { data, isLoading, isError, isFetching, refetch } = activeQuery;

  // Handle mode change - update initial data for new mode
  useEffect(() => {
    const cached = mode === "oracle" 
      ? getCachedOracleFeed(assetId) 
      : getCachedPulseFeed(assetId);
    // Query will use cached data from localStorage automatically via fetcher
  }, [mode, assetId]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading skeleton
  if (isLoading && !data) {
    return (
      <div data-testid="chart-feed-panel" className="space-y-3">
        <div className="flex items-center justify-between">
          <FeedToggle value={mode} onChange={setMode} />
        </div>
        <div data-testid="chart-feed-list" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="chart-feed-panel" className="space-y-3">
      <div className="flex items-center justify-between">
        <FeedToggle value={mode} onChange={setMode} />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleRefresh}
          disabled={isFetching}
          aria-label="Refresh feed"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Error banner (but keep showing cached data) */}
      {isError && data && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Failed to refresh. Showing cached data.
          </AlertDescription>
        </Alert>
      )}

      {/* Error without cached data */}
      {isError && !data && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load signals.</span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Feed list */}
      <div data-testid="chart-feed-list" className="space-y-3">
        {data && data.length > 0 ? (
          data.map((card) => <FeedCardItem key={card.id} card={card} />)
        ) : (
          !isLoading && !isError && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No signals yet.
            </div>
          )
        )}
      </div>
    </div>
  );
}
