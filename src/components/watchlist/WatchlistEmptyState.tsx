import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Plus } from "lucide-react";

interface WatchlistEmptyStateProps {
  onAddClick: () => void;
}

export function WatchlistEmptyState({ onAddClick }: WatchlistEmptyStateProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Star className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          Your watchlist is empty
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Add symbols to track your favorite instruments and get quick access to
          charts and analysis.
        </p>

        <Button onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add symbol
        </Button>
      </CardContent>
    </Card>
  );
}
