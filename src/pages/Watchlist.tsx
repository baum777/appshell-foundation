import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { useWatchlistStub } from "@/stubs/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  WatchlistHeader,
  WatchlistQuickAdd,
  WatchlistCard,
  WatchlistDetailPanel,
  WatchlistDetailSheet,
  WatchlistEmptyState,
  WatchlistSkeleton,
  type WatchlistQuickAddRef,
} from "@/components/watchlist";

export default function Watchlist() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { pageState, items, addSymbol, removeSymbol } = useWatchlistStub();

  // Selection state
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Ref for QuickAdd input
  const quickAddRef = useRef<WatchlistQuickAddRef>(null);

  // Sync selection from URL on mount
  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected && items.some((item) => item.symbol === selected)) {
      setSelectedSymbol(selected);
    }
  }, []);

  // Update URL when selection changes
  const handleSelect = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);

      // Update URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set("selected", symbol);
      setSearchParams(newParams, { replace: true });

      // Open sheet on mobile
      if (isMobile) {
        setDetailSheetOpen(true);
      }
    },
    [searchParams, setSearchParams, isMobile]
  );

  const handleUnselect = useCallback(() => {
    setSelectedSymbol(null);
    setDetailSheetOpen(false);

    // Remove from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("selected");
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleRemove = useCallback(
    (symbol: string) => {
      // If removing selected item, clear selection
      if (selectedSymbol === symbol) {
        handleUnselect();
      }
      removeSymbol(symbol);
    },
    [selectedSymbol, handleUnselect, removeSymbol]
  );

  const handleOpenChart = useCallback(() => {
    navigate("/chart");
  }, [navigate]);

  const handleOpenReplay = useCallback(() => {
    navigate("/chart?replay=true");
  }, [navigate]);

  const handleAddSymbolFocus = useCallback(() => {
    quickAddRef.current?.focus();
  }, []);

  const handleRetry = () => {
    pageState.setState("loading");
    setTimeout(() => pageState.setState("ready"), 1000);
  };

  // Get selected item
  const selectedItem = items.find((item) => item.symbol === selectedSymbol) ?? null;

  // Loading state
  if (pageState.isLoading) {
    return (
      <PageContainer testId="page-watchlist">
        <WatchlistSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (pageState.isError) {
    return (
      <PageContainer testId="page-watchlist">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Watchlist
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your favorite instruments
            </p>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load watchlist. Please try again.</span>
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

  // Empty state
  const isEmpty = items.length === 0;

  return (
    <PageContainer testId="page-watchlist">
      <div className="space-y-6">
        <WatchlistHeader
          hasSelection={!!selectedSymbol}
          onOpenChart={handleOpenChart}
        />

        {isEmpty ? (
          <>
            <WatchlistQuickAdd ref={quickAddRef} onAdd={addSymbol} />
            <WatchlistEmptyState onAddClick={handleAddSymbolFocus} />
          </>
        ) : (
          <>
            <WatchlistQuickAdd ref={quickAddRef} onAdd={addSymbol} />

            <div className="flex gap-6">
              {/* Cards grid */}
              <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <WatchlistCard
                    key={item.id}
                    item={item}
                    isSelected={item.symbol === selectedSymbol}
                    onSelect={() => handleSelect(item.symbol)}
                    onRemove={() => handleRemove(item.symbol)}
                  />
                ))}
              </div>

              {/* Detail panel (desktop only) */}
              {!isMobile && (
                <div className="hidden md:block w-72 shrink-0">
                  <WatchlistDetailPanel
                    item={selectedItem}
                    onClose={handleUnselect}
                    onOpenChart={handleOpenChart}
                    onOpenReplay={handleOpenReplay}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Detail sheet (mobile) */}
      <WatchlistDetailSheet
        item={selectedItem}
        isOpen={detailSheetOpen}
        onOpenChange={(open) => {
          setDetailSheetOpen(open);
          if (!open) handleUnselect();
        }}
        onClose={handleUnselect}
        onOpenChart={handleOpenChart}
        onOpenReplay={handleOpenReplay}
      />
    </PageContainer>
  );
}
