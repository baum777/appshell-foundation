import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, CloudOff, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SyncStatus = "synced" | "offline" | "queued" | "error" | "syncing";

interface JournalSyncBadgeProps {
  status: SyncStatus;
  queueCount?: number;
  onRetry?: () => void;
}

export function JournalSyncBadge({
  status,
  queueCount = 0,
  onRetry,
}: JournalSyncBadgeProps) {
  if (status === "synced") {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case "offline":
        return {
          icon: WifiOff,
          label: "Offline",
          variant: "secondary" as const,
          className: "text-muted-foreground",
        };
      case "queued":
        return {
          icon: CloudOff,
          label: `${queueCount} pending`,
          variant: "outline" as const,
          className: "text-amber-500 border-amber-500/50",
        };
      case "syncing":
        return {
          icon: Loader2,
          label: "Syncing...",
          variant: "outline" as const,
          className: "text-primary border-primary/50",
          iconClassName: "animate-spin",
        };
      case "error":
        return {
          icon: RefreshCw,
          label: "Sync error",
          variant: "destructive" as const,
          className: "",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      data-testid="journal-sync-status"
      className="flex items-center gap-2"
    >
      <Badge
        data-testid={status === "offline" ? "journal-offline-badge" : undefined}
        variant={config.variant}
        className={cn("text-xs gap-1", config.className)}
      >
        <Icon className={cn("h-3 w-3", config.iconClassName)} />
        {config.label}
      </Badge>

      {queueCount > 0 && (
        <Badge
          data-testid="journal-queue-count"
          variant="outline"
          className="text-xs text-amber-500 border-amber-500/50"
        >
          {queueCount} queued
        </Badge>
      )}

      {status === "error" && onRetry && (
        <Button
          data-testid="journal-sync-retry"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-xs"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
