import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OracleStub } from "@/stubs/contracts";

interface InsightCardProps {
  insight: OracleStub;
  onMarkAsRead: (id: string) => void;
}

const themeColors: Record<string, string> = {
  bullish: "bg-success/10 text-success border-success/20",
  bearish: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-secondary text-secondary-foreground border-secondary",
  caution: "bg-warning/10 text-warning border-warning/20",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "Just now";
}

export function InsightCard({ insight, onMarkAsRead }: InsightCardProps) {
  return (
    <Card
      className={cn(
        "transition-all",
        !insight.isRead && "border-primary/30 bg-primary/5"
      )}
    >
      <CardContent className="py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs capitalize", themeColors[insight.theme])}
              >
                {insight.theme}
              </Badge>
              {!insight.isRead && (
                <Badge variant="default" className="text-xs">
                  New
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-foreground">{insight.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {insight.summary}
            </p>
            <div className="text-xs text-muted-foreground">
              {formatTimeAgo(insight.createdAt)}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            {insight.isRead ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-4 w-4" />
                <span>Read</span>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAsRead(insight.id)}
              >
                <Circle className="mr-1.5 h-3 w-3" />
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
