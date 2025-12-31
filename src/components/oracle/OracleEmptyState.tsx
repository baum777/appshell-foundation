import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Filter } from "lucide-react";

interface OracleEmptyStateProps {
  type: "no-insights" | "filter-empty";
  onAction: () => void;
}

export function OracleEmptyState({ type, onAction }: OracleEmptyStateProps) {
  const isNoInsights = type === "no-insights";

  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {isNoInsights ? (
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Filter className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {isNoInsights ? "No insights yet" : "No new insights"}
        </h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {isNoInsights
            ? "AI-powered insights will appear here when available."
            : "You're all caught up! All insights have been read."}
        </p>
        <Button onClick={onAction}>
          {isNoInsights ? "Refresh" : "Show all"}
        </Button>
        {/* BACKEND_TODO: fetch insights */}
      </CardContent>
    </Card>
  );
}
