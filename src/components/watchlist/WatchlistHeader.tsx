import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WatchlistHeaderProps {
  onAddClick: () => void;
}

export function WatchlistHeader({ onAddClick }: WatchlistHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Watchlist
      </h1>
      <Button variant="default" size="sm" onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  );
}
