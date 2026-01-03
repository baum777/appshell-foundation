import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit3,
  Archive,
  MessageSquarePlus,
  TrendingUp,
  TrendingDown,
  Clock,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { format } from "date-fns";
import type { JournalEntryStub } from "@/stubs/contracts";
import { cn } from "@/lib/utils";

interface JournalTradeCardProps {
  entry: JournalEntryStub;
  onEdit?: () => void;
  onArchive?: () => void;
  onAddReflection?: () => void;
}

function getSessionLabel(timestamp: string): string {
  const hour = new Date(timestamp).getHours();
  if (hour >= 0 && hour < 9) return "Asia";
  if (hour >= 9 && hour < 14) return "London";
  return "NY";
}

export function JournalTradeCard({
  entry,
  onEdit,
  onArchive,
  onAddReflection,
}: JournalTradeCardProps) {
  const isLong = entry.side === "BUY";
  const timeFormatted = format(new Date(entry.timestamp), "HH:mm");
  const sessionLabel = getSessionLabel(entry.timestamp);
  
  // Stub reflection data (would come from entry)
  const hasReflection = entry.id.includes("1") || entry.id.includes("3");
  const feeling: "positive" | "neutral" | "negative" = entry.id.includes("1")
    ? "positive"
    : entry.id.includes("2")
    ? "negative"
    : "neutral";

  return (
    <Card
      data-testid="journal-card-trade"
      className={cn(
        "relative bg-surface border-border/50 rounded-xl",
        "hover:border-border hover:shadow-md transition-all"
      )}
    >
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-emerald-500" />

      <CardContent className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {isLong ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium text-foreground">
              {isLong ? "LONG" : "SHORT"}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{timeFormatted}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{sessionLabel}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/90 line-clamp-2 mb-3">
          {entry.summary}
        </p>

        {/* Reflection snippet */}
        {hasReflection && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/30">
            {feeling === "positive" && <Smile className="h-4 w-4 text-emerald-500" />}
            {feeling === "neutral" && <Meh className="h-4 w-4 text-muted-foreground" />}
            {feeling === "negative" && <Frown className="h-4 w-4 text-amber-500" />}
            <span className="text-xs text-muted-foreground">
              Felt confident about this setup
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!hasReflection && onAddReflection && (
            <Button
              data-testid="journal-trade-add-reflection"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddReflection();
              }}
            >
              <MessageSquarePlus className="h-4 w-4 mr-1.5" />
              Add Reflection
            </Button>
          )}
          {onEdit && (
            <Button
              data-testid="journal-trade-edit"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit3 className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          {onArchive && (
            <Button
              data-testid="journal-trade-archive"
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
