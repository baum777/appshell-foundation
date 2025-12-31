import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, RefreshCw } from "lucide-react";

interface ChartEmptyStateProps {
  onRefresh: () => void;
}

export function ChartEmptyState({ onRefresh }: ChartEmptyStateProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          No markets available
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Unable to load market data. Please try refreshing.
        </p>

        <Button onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        {/* BACKEND_TODO: fetch markets */}
      </CardContent>
    </Card>
  );
}
