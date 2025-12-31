import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  WatchlistHeader,
  WatchlistQuickAdd,
  WatchlistItemRow,
  WatchlistDetailPanel,
  WatchlistDetailSheet,
  WatchlistEmptyState,
  WatchlistSkeleton,
  type WatchlistQuickAddRef,
} from "@/components/watchlist";
import type { WatchItemStub } from "@/stubs/contracts";
import { usePageState } from "@/stubs/pageState";

const STORAGE_KEY = "sparkfined_watchlist_v1";

function loadWatchlist(): WatchItemStub[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  // Default items
  return [
    { id: "watch-1", symbol: "BTC", name: "Bitcoin" },
    { id: "watch-2", symbol: "ETH", name: "Ethereum" },
    { id: "watch-3", symbol: "SOL", name: "Solana" },
  ];
}

function saveWatchlist(items: WatchItemStub[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export default function Watchlist() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const pageState = usePageState("ready");

  // Watchlist items with localStorage persistence
  const [items, setItems] = useState<WatchItemStub[]>(() => loadWatchlist());

  // Save to localStorage when items change
  useEffect(() => {
    saveWatchlist(items);
  }, [items]);

  // Selection state
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [notFoundSymbol, setNotFoundSymbol] = useState<string | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Ref for QuickAdd input
  const quickAddRef = useRef<WatchlistQuickAddRef>(null);

  // Sync selection from URL on mount
  useEffect(() => {
    const selected = searchParams.get("selected");
    if (selected) {
      const found = items.find(
        (item) => item.symbol.toLowerCase() === selected.toLowerCase()
      );
      if (found) {
        setSelectedSymbol(found.symbol);
        setNotFoundSymbol(null);
        if (isMobile) {
          setDetailSheetOpen(true);
        }
      } else {
        // Not found - show not-found state
        setSelectedSymbol(null);
        setNotFoundSymbol(selected);
        if (isMobile) {
          setDetailSheetOpen(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when selection changes
  const handleSelect = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
      setNotFoundSymbol(null);

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
    setNotFoundSymbol(null);
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
      setItems((prev) => prev.filter((item) => item.symbol !== symbol));
      toast({
        title: "Removed",
        description: `${symbol} removed from watchlist`,
      });
      // BACKEND_TODO: persist watchlist items
    },
    [selectedSymbol, handleUnselect]
  );

  const handleAddSymbol = useCallback(
    (symbol: string): boolean => {
      const normalized = symbol.toUpperCase().trim();
      const exists = items.some(
        (item) => item.symbol.toLowerCase() === normalized.toLowerCase()
      );
      if (exists) return false;

      const newItem: WatchItemStub = {
        id: `watch-${Date.now()}`,
        symbol: normalized,
        name: normalized, // Stub name same as symbol
      };
      setItems((prev) => [...prev, newItem]);
      toast({
        title: "Added",
        description: `${normalized} added to watchlist`,
      });
      // BACKEND_TODO: persist watchlist items
      return true;
    },
    [items]
  );

  const handleAddNotFound = useCallback(() => {
    if (notFoundSymbol) {
      const success = handleAddSymbol(notFoundSymbol);
      if (success) {
        // Now select it
        handleSelect(notFoundSymbol.toUpperCase());
      }
    }
  }, [notFoundSymbol, handleAddSymbol, handleSelect]);

  const handleOpenChart = useCallback(() => {
    const symbol = selectedSymbol || notFoundSymbol;
    if (symbol) {
      navigate(`/chart?query=${encodeURIComponent(symbol)}`);
    } else {
      navigate("/chart");
    }
  }, [navigate, selectedSymbol, notFoundSymbol]);

  const handleOpenReplay = useCallback(() => {
    const symbol = selectedSymbol || notFoundSymbol;
    if (symbol) {
      navigate(`/chart?replay=true&query=${encodeURIComponent(symbol)}`);
    } else {
      navigate("/chart?replay=true");
    }
  }, [navigate, selectedSymbol, notFoundSymbol]);

  const handleAddClick = useCallback(() => {
    quickAddRef.current?.focus();
  }, []);

  const handleRetry = () => {
    pageState.setState("loading");
    setTimeout(() => pageState.setState("ready"), 1000);
  };

  // Get selected item
  const selectedItem =
    items.find((item) => item.symbol === selectedSymbol) ?? null;

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
          <WatchlistHeader onAddClick={handleAddClick} />

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
        <WatchlistHeader onAddClick={handleAddClick} />

        <WatchlistQuickAdd ref={quickAddRef} onAdd={handleAddSymbol} />

        {isEmpty ? (
          <WatchlistEmptyState onAddClick={handleAddClick} />
        ) : (
          <div className="flex gap-6">
            {/* List */}
            <div className="flex-1">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-2 pr-4">
                  {items.map((item) => (
                    <WatchlistItemRow
                      key={item.id}
                      item={item}
                      isSelected={item.symbol === selectedSymbol}
                      onSelect={() => handleSelect(item.symbol)}
                      onRemove={() => handleRemove(item.symbol)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Detail panel (desktop only) */}
            {!isMobile && (
              <div className="hidden md:block w-80 shrink-0">
                <WatchlistDetailPanel
                  item={selectedItem}
                  notFoundSymbol={notFoundSymbol}
                  onClose={handleUnselect}
                  onOpenChart={handleOpenChart}
                  onOpenReplay={handleOpenReplay}
                  onAddNotFound={handleAddNotFound}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail sheet (mobile) */}
      <WatchlistDetailSheet
        item={selectedItem}
        notFoundSymbol={notFoundSymbol}
        isOpen={detailSheetOpen}
        onOpenChange={(open) => {
          setDetailSheetOpen(open);
          if (!open) handleUnselect();
        }}
        onOpenChart={handleOpenChart}
        onOpenReplay={handleOpenReplay}
        onAddNotFound={handleAddNotFound}
      />
    </PageContainer>
  );
}
