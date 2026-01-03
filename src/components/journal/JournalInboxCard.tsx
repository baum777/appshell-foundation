import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Archive,
  MessageSquarePlus,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { JournalEntryStub } from "@/stubs/contracts";
import { cn } from "@/lib/utils";

interface JournalInboxCardProps {
  entry: JournalEntryStub;
  onConfirm: () => void;
  onArchive: () => void;
  onAddNote: () => void;
  isFocused?: boolean;
  hasSyncError?: boolean;
}

function getSessionLabel(timestamp: string): string {
  const hour = new Date(timestamp).getHours();
  if (hour >= 0 && hour < 9) return "Asia";
  if (hour >= 9 && hour < 14) return "London";
  return "NY";
}

export function JournalInboxCard({
  entry,
  onConfirm,
  onArchive,
  onAddNote,
  isFocused = false,
  hasSyncError = false,
}: JournalInboxCardProps) {
  const timeFormatted = format(new Date(entry.timestamp), "HH:mm");
  const sessionLabel = getSessionLabel(entry.timestamp);
  const isLong = entry.side === "BUY";

  return (
    <Card
      data-testid="journal-inbox-card"
      className={cn(
        "relative transition-all duration-200",
        "bg-surface border-border/50 rounded-xl",
        "hover:border-border hover:shadow-md",
        isFocused && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        hasSyncError && "border-destructive/50"
      )}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {isLong ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium text-foreground">
              {isLong ? "LONG" : "SHORT"}
            </span>
            <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
              Pending
            </Badge>
          </div>

          {hasSyncError && (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          )}
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/90 line-clamp-2 mb-3">
          {entry.summary}
        </p>

        {/* Context chips */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeFormatted}</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <span>{sessionLabel}</span>
          <span className="text-muted-foreground/50">•</span>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>auto</span>
          </div>
        </div>

        {/* Actions - Always visible */}
        <div className="flex items-center gap-2">
          <Button
            data-testid="journal-inbox-confirm"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1.5" />
            Confirm
          </Button>

          <Button
            data-testid="journal-inbox-add-note"
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddNote();
            }}
          >
            <MessageSquarePlus className="h-4 w-4 mr-1.5" />
            Note
          </Button>

          <Button
            data-testid="journal-inbox-archive"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
