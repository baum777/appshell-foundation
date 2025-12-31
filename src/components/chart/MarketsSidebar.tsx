import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Star, X } from "lucide-react";
import type { WatchItemStub } from "@/stubs/contracts";
import { cn } from "@/lib/utils";

interface MarketsListProps {
  markets: WatchItemStub[];
  favorites: string[];
  selectedSymbol: string;
  onSelectMarket: (symbol: string) => void;
  onToggleFavorite: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function MarketsList({
  markets,
  favorites,
  selectedSymbol,
  onSelectMarket,
  onToggleFavorite,
  searchQuery,
  onSearchChange,
}: MarketsListProps) {
  const filteredMarkets = markets.filter(
    (m) =>
      m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort favorites first
  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedMarkets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No markets found
            </p>
          ) : (
            sortedMarkets.map((market) => {
              const isFavorite = favorites.includes(market.id);
              const isSelected = market.symbol === selectedSymbol;

              return (
                <button
                  key={market.id}
                  onClick={() => onSelectMarket(market.symbol)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 p-2 rounded-md text-left transition-colors",
                    "hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected && "bg-muted"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", isSelected && "text-primary")}>
                      {market.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {market.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(market.id);
                    }}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                      )}
                    />
                  </Button>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface MarketsSidebarProps {
  markets: WatchItemStub[];
  favorites: string[];
  selectedSymbol: string;
  onSelectMarket: (symbol: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function MarketsSidebar(props: MarketsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-56 shrink-0 border border-border/50 rounded-lg bg-card/50 overflow-hidden flex flex-col h-full">
      <div className="p-3 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Markets</h2>
      </div>
      <MarketsList
        {...props}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}

interface MarketsSheetProps extends MarketsSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketsSheet({
  isOpen,
  onOpenChange,
  onSelectMarket,
  ...props
}: MarketsSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectMarket = (symbol: string) => {
    onSelectMarket(symbol);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 bg-background pb-20">
        <SheetHeader className="p-4 border-b border-border/50">
          <SheetTitle>Markets</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-8rem)]">
          <MarketsList
            {...props}
            onSelectMarket={handleSelectMarket}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
