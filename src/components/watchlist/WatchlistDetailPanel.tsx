import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { LineChart, Play, Bell, Copy, Check, Eye } from "lucide-react";
import type { WatchItemStub } from "@/stubs/contracts";

function isContractAddress(value: string): boolean {
  return value.length >= 32 && !value.includes(" ");
}

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface DetailContentProps {
  item: WatchItemStub;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSaveNotes: () => void;
  onOpenChart: () => void;
  onOpenReplay: () => void;
  onCreateAlert: () => void;
}

function DetailContent({
  item,
  notes,
  onNotesChange,
  onSaveNotes,
  onOpenChart,
  onOpenReplay,
  onCreateAlert,
}: DetailContentProps) {
  const [copied, setCopied] = useState(false);
  const isContract = isContractAddress(item.symbol);
  const displaySymbol = isContract ? shortenAddress(item.symbol) : item.symbol;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(item.symbol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failed - silently ignore
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-foreground">{displaySymbol}</h3>
          {isContract && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopyAddress}
              aria-label="Copy full address"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{item.name}</p>
        {isContract && (
          <p className="text-xs text-muted-foreground font-mono mt-1 break-all">
            {item.symbol}
          </p>
        )}
      </div>

      <Separator />

      {/* Actions row */}
      <div className="flex flex-wrap gap-2">
        <Button variant="default" size="sm" onClick={onOpenChart}>
          <LineChart className="h-4 w-4 mr-2" />
          Chart
        </Button>
        <Button variant="outline" size="sm" onClick={onOpenReplay}>
          <Play className="h-4 w-4 mr-2" />
          Replay
        </Button>
        <Button variant="outline" size="sm" onClick={onCreateAlert}>
          <Bell className="h-4 w-4 mr-2" />
          Alert
        </Button>
      </div>

      <Separator />

      {/* Overview section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Overview
        </h4>
        <p className="text-sm text-muted-foreground">
          Market overview and key metrics will appear here.
        </p>
        {/* BACKEND_TODO: fetch details/prices */}
      </div>

      {/* Notes section */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Notes</h4>
        <Textarea
          placeholder={`Your notes for ${displaySymbol}...`}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <Button
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={onSaveNotes}
        >
          Save
        </Button>
        {/* BACKEND_TODO: persist notes */}
      </div>

      {/* Recently viewed hint (stub) */}
      <div className="pt-2">
        <Badge variant="outline" className="text-xs">
          Recently viewed
        </Badge>
      </div>
    </div>
  );
}

interface WatchlistDetailPanelProps {
  item: WatchItemStub | null;
  notFoundSymbol?: string | null;
  onClose: () => void;
  onOpenChart: () => void;
  onOpenReplay: () => void;
  onAddNotFound?: () => void;
}

export function WatchlistDetailPanel({
  item,
  notFoundSymbol,
  onClose,
  onOpenChart,
  onOpenReplay,
  onAddNotFound,
}: WatchlistDetailPanelProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");

  const handleSaveNotes = () => {
    // BACKEND_TODO: persist notes
    console.log("Saving notes:", notes);
  };

  const handleCreateAlert = () => {
    if (item) {
      navigate(`/alerts?symbol=${encodeURIComponent(item.symbol)}`);
    }
  };

  // Not found state
  if (notFoundSymbol && !item) {
    return (
      <Card className="bg-card/50 border-border/50 h-fit sticky top-4">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            "{notFoundSymbol}" not found in watchlist
          </p>
          {onAddNotFound && (
            <Button variant="default" size="sm" onClick={onAddNotFound}>
              Add it
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!item) {
    return (
      <Card className="bg-card/50 border-border/50 h-fit sticky top-4">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Select an item to see details
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
          size="sm"
          onClick={onClose}
          aria-label="Close details"
        >
          Close
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <DetailContent
          item={item}
          notes={notes}
          onNotesChange={setNotes}
          onSaveNotes={handleSaveNotes}
          onOpenChart={onOpenChart}
          onOpenReplay={onOpenReplay}
          onCreateAlert={handleCreateAlert}
        />
      </CardContent>
    </Card>
  );
}

interface WatchlistDetailSheetProps {
  item: WatchItemStub | null;
  notFoundSymbol?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChart: () => void;
  onOpenReplay: () => void;
  onAddNotFound?: () => void;
}

export function WatchlistDetailSheet({
  item,
  notFoundSymbol,
  isOpen,
  onOpenChange,
  onOpenChart,
  onOpenReplay,
  onAddNotFound,
}: WatchlistDetailSheetProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");

  const handleSaveNotes = () => {
    // BACKEND_TODO: persist notes
    console.log("Saving notes:", notes);
  };

  const handleCreateAlert = () => {
    if (item) {
      onOpenChange(false);
      navigate(`/alerts?symbol=${encodeURIComponent(item.symbol)}`);
    }
  };

  const isContract = item ? isContractAddress(item.symbol) : false;
  const displaySymbol = item
    ? isContract
      ? shortenAddress(item.symbol)
      : item.symbol
    : "Details";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75vh] bg-background pb-24">
        <SheetHeader>
          <SheetTitle>{displaySymbol}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 overflow-y-auto h-full pb-8">
          {notFoundSymbol && !item ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                "{notFoundSymbol}" not found in watchlist
              </p>
              {onAddNotFound && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onAddNotFound();
                  }}
                >
                  Add it
                </Button>
              )}
            </div>
          ) : item ? (
            <DetailContent
              item={item}
              notes={notes}
              onNotesChange={setNotes}
              onSaveNotes={handleSaveNotes}
              onOpenChart={() => {
                onOpenChange(false);
                onOpenChart();
              }}
              onOpenReplay={() => {
                onOpenChange(false);
                onOpenReplay();
              }}
              onCreateAlert={handleCreateAlert}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
