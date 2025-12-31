import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { useChartStub } from "@/stubs/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Settings2 } from "lucide-react";
import {
  ChartTopBar,
  MarketsSidebar,
  MarketsSheet,
  ChartToolbar,
  ChartCanvas,
  ChartBottomTabs,
  ToolsIndicatorsPanel,
  ToolsIndicatorsSheet,
  ReplayControls,
  ChartSkeleton,
  ChartEmptyState,
} from "@/components/chart";

export default function Chart() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const {
    pageState,
    markets,
    favorites,
    selectedSymbol,
    selectedTimeframe,
    setSelectedSymbol,
    setSelectedTimeframe,
    toggleFavorite,
  } = useChartStub();

  // Replay mode from query param
  const isReplayMode = searchParams.get("replay") === "true";

  // UI state
  const [marketsSheetOpen, setMarketsSheetOpen] = useState(false);
  const [toolsSheetOpen, setToolsSheetOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("cursor");
  const [crosshairEnabled, setCrosshairEnabled] = useState(true);
  const [enabledIndicators, setEnabledIndicators] = useState<string[]>(["sma"]);

  // Toggle replay mode via query param
  const handleReplayToggle = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        searchParams.set("replay", "true");
      } else {
        searchParams.delete("replay");
      }
      setSearchParams(searchParams, { replace: true });
      // BACKEND_TODO: persist replay preference if needed
    },
    [searchParams, setSearchParams]
  );

  const handleToggleIndicator = useCallback((id: string) => {
    setEnabledIndicators((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleRetry = () => {
    pageState.setState("loading");
    setTimeout(() => pageState.setState("ready"), 1000);
  };

  const handleRefreshEmpty = () => {
    pageState.setState("loading");
    setTimeout(() => pageState.setState("ready"), 1000);
  };

  // Loading state
  if (pageState.isLoading) {
    return (
      <PageContainer testId="page-chart">
        <h1 className="sr-only">Chart</h1>
        <ChartSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (pageState.isError) {
    return (
      <PageContainer testId="page-chart">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Chart
          </h1>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load chart data. Please try again.</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  // Empty state (no markets)
  if (pageState.isEmpty || markets.length === 0) {
    return (
      <PageContainer testId="page-chart">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Chart
          </h1>
          <ChartEmptyState onRefresh={handleRefreshEmpty} />
        </div>
      </PageContainer>
    );
  }

  // Ready state
  return (
    <PageContainer testId="page-chart">
      <h1 className="sr-only">Chart</h1>

      <div className="space-y-4">
        {/* Top Bar */}
        <ChartTopBar
          symbol={selectedSymbol}
          timeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          isReplayMode={isReplayMode}
          onReplayToggle={handleReplayToggle}
          onMobileMarketsOpen={() => setMarketsSheetOpen(true)}
          isMobile={isMobile}
        />

        {/* Main layout */}
        <div className="flex gap-4">
          {/* Left sidebar (desktop only) */}
          {!isMobile && (
            <MarketsSidebar
              markets={markets}
              favorites={favorites}
              selectedSymbol={selectedSymbol}
              onSelectMarket={setSelectedSymbol}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {/* Center content */}
          <div className="flex-1 space-y-3 min-w-0">
            <ChartToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              crosshairEnabled={crosshairEnabled}
              onCrosshairToggle={setCrosshairEnabled}
            />

            {/* Replay controls (only in replay mode) */}
            {isReplayMode && <ReplayControls />}

            <ChartCanvas symbol={selectedSymbol} timeframe={selectedTimeframe} />

            {/* Mobile tools button */}
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setToolsSheetOpen(true)}
                className="w-full"
              >
                <Settings2 className="h-4 w-4 mr-2" />
                Tools & Indicators
              </Button>
            )}

            <ChartBottomTabs />
          </div>

          {/* Right panel (desktop only, lg+) */}
          {!isMobile && (
            <div className="hidden lg:block">
              <ToolsIndicatorsPanel
                enabledIndicators={enabledIndicators}
                onToggleIndicator={handleToggleIndicator}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile sheets */}
      <MarketsSheet
        isOpen={marketsSheetOpen}
        onOpenChange={setMarketsSheetOpen}
        markets={markets}
        favorites={favorites}
        selectedSymbol={selectedSymbol}
        onSelectMarket={setSelectedSymbol}
        onToggleFavorite={toggleFavorite}
      />

      <ToolsIndicatorsSheet
        isOpen={toolsSheetOpen}
        onOpenChange={setToolsSheetOpen}
        enabledIndicators={enabledIndicators}
        onToggleIndicator={handleToggleIndicator}
      />
    </PageContainer>
  );
}
