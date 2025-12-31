import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface WatchlistCardProps {
  item: WatchItemStub;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function WatchlistCard({
  item,
  isSelected,
  onSelect,
  onRemove,
}: WatchlistCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRemove = () => {
    onRemove();
    setDialogOpen(false);
  };

  return (
    <Card
      className={cn(
        "bg-card/50 border-border/50 transition-all cursor-pointer hover:bg-card/80",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={onSelect}
            className="flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <p className="text-lg font-semibold text-foreground">
              {item.symbol}
            </p>
            <p className="text-sm text-muted-foreground">{item.name}</p>
            {/* UI-only placeholder metrics */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">--</span>
              <span className="text-xs text-muted-foreground/60">• --</span>
            </div>
          </button>

          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Remove ${item.symbol}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {item.symbol}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove {item.symbol} from your watchlist.
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
      </CardContent>
    </Card>
  );
}
