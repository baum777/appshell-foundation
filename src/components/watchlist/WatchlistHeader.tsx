import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";

interface WatchlistHeaderProps {
  hasSelection: boolean;
  onOpenChart: () => void;
}

export function WatchlistHeader({ hasSelection, onOpenChart }: WatchlistHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Watchlist
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your favorite instruments
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenChart}
        disabled={!hasSelection}
        className="mt-3 sm:mt-0"
      >
        <LineChart className="h-4 w-4 mr-2" />
        Open chart
      </Button>
    </div>
  );
}
