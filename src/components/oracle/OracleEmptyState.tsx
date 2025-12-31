import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Filter, RefreshCw } from "lucide-react";

interface OracleEmptyStateProps {
  type: "no-insights" | "filter-empty" | "search-empty";
  onAction: () => void;
  searchQuery?: string;
}

export function OracleEmptyState({ type, onAction, searchQuery }: OracleEmptyStateProps) {
  const config = {
    "no-insights": {
      icon: <Sparkles className="h-8 w-8 text-muted-foreground" />,
      title: "No insights yet",
      description: "AI-powered insights will appear here when available.",
      actionLabel: "Refresh",
      actionIcon: <RefreshCw className="h-4 w-4 mr-2" />,
    },
    "filter-empty": {
      icon: <Filter className="h-8 w-8 text-muted-foreground" />,
      title: "No insights match this filter",
      description: "Try changing the filter to see more insights.",
      actionLabel: "Show all",
      actionIcon: null,
    },
    "search-empty": {
      icon: <Filter className="h-8 w-8 text-muted-foreground" />,
      title: `No results for "${searchQuery}"`,
      description: "Try a different search term or clear the search.",
      actionLabel: "Clear search",
      actionIcon: null,
    },
  };

  const { icon, title, description, actionLabel, actionIcon } = config[type];

  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        <Button onClick={onAction}>
          {actionIcon}
          {actionLabel}
        </Button>
        {/* BACKEND_TODO: fetch insights from API */}
      </CardContent>
    </Card>
  );
}
