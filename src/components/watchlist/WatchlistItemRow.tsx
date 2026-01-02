import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import type { WatchItemStub } from "@/stubs/contracts";
import { cn } from "@/lib/utils";

interface WatchlistItemRowProps {
  item: WatchItemStub;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function isContractAddress(value: string): boolean {
  return value.length >= 32 && !value.includes(" ");
}

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WatchlistItemRow({
  item,
  isSelected,
  onSelect,
  onRemove,
}: WatchlistItemRowProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRemove = () => {
    onRemove();
    setDialogOpen(false);
  };

  const isContract = isContractAddress(item.symbol);
  const displaySymbol = isContract ? shortenAddress(item.symbol) : item.symbol;

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-3 p-3 rounded-lg border transition-all",
        "bg-card/50 border-border/50 hover:bg-card/80",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-card/80"
      )}
    >
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-sm"
        aria-pressed={isSelected}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-sm">
              {displaySymbol}
            </Badge>
            {isContract && (
              <span className="text-xs text-muted-foreground">Contract</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {item.name}
          </p>
        </div>
        
        {/* Stub meta - last seen / note indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span>--</span>
        </div>
      </button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Remove ${item.symbol}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {displaySymbol}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {displaySymbol} from your watchlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
