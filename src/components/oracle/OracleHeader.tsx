import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, RefreshCw } from "lucide-react";

interface OracleHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function OracleHeader({
  unreadCount,
  onMarkAllRead,
  onRefresh,
  isRefreshing = false,
}: OracleHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Oracle</h1>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Daily signals, narratives, and actionable notes.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllRead}
            aria-label="Mark all insights as read"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh insights"
          className="h-9 w-9"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
    </div>
  );
}
