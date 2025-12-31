import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LineChart, Play, X } from "lucide-react";
import type { WatchItemStub } from "@/stubs/contracts";

interface DetailContentProps {
  item: WatchItemStub;
  onOpenChart: () => void;
  onOpenReplay: () => void;
}

function DetailContent({ item, onOpenChart, onOpenReplay }: DetailContentProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground">{item.symbol}</h3>
        <p className="text-sm text-muted-foreground">{item.name}</p>
      </div>

      <Separator />

      {/* Overview section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Overview</h4>
        <p className="text-sm text-muted-foreground">
          Market overview and key metrics will appear here.
        </p>
        {/* BACKEND_TODO: fetch details/prices */}
      </div>

      {/* Notes section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Notes</h4>
        <p className="text-sm text-muted-foreground">
          Your notes for {item.symbol} will appear here.
        </p>
      </div>

      {/* Signals section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Signals</h4>
        <p className="text-sm text-muted-foreground">
          Trading signals and alerts will appear here.
        </p>
      </div>

      <Separator />

      {/* CTAs */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={onOpenChart} className="flex-1">
          <LineChart className="h-4 w-4 mr-2" />
          Open chart
        </Button>
        <Button variant="outline" onClick={onOpenReplay} className="flex-1">
          <Play className="h-4 w-4 mr-2" />
          Replay
        </Button>
      </div>
    </div>
  );
}

interface WatchlistDetailPanelProps {
  item: WatchItemStub | null;
  onClose: () => void;
  onOpenChart: () => void;
  onOpenReplay: () => void;
}

export function WatchlistDetailPanel({
  item,
  onClose,
  onOpenChart,
  onOpenReplay,
}: WatchlistDetailPanelProps) {
  if (!item) {
    return (
      <Card className="bg-card/50 border-border/50 h-fit sticky top-4">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Select a symbol to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50 h-fit sticky top-4">
      <CardHeader className="pb-0 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Details</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <DetailContent
          item={item}
          onOpenChart={onOpenChart}
          onOpenReplay={onOpenReplay}
        />
      </CardContent>
    </Card>
  );
}

interface WatchlistDetailSheetProps extends WatchlistDetailPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WatchlistDetailSheet({
  item,
  isOpen,
  onOpenChange,
  onOpenChart,
  onOpenReplay,
}: WatchlistDetailSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] bg-background pb-20">
        <SheetHeader>
          <SheetTitle>{item?.symbol ?? "Details"}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 overflow-y-auto">
          {item && (
            <DetailContent
              item={item}
              onOpenChart={() => {
                onOpenChange(false);
                onOpenChart();
              }}
              onOpenReplay={() => {
                onOpenChange(false);
                onOpenReplay();
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
