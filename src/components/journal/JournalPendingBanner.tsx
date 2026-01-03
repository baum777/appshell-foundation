import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronRight } from "lucide-react";

interface JournalPendingBannerProps {
  pendingCount: number;
  onReviewNow: () => void;
}

export function JournalPendingBanner({
  pendingCount,
  onReviewNow,
}: JournalPendingBannerProps) {
  if (pendingCount === 0) return null;

  return (
    <div
      data-testid="journal-pending-banner"
      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-fade-in"
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
        <span className="text-sm font-medium text-foreground">
          {pendingCount} pending {pendingCount === 1 ? "entry" : "entries"}
        </span>
      </div>
      <Button
        data-testid="journal-review-now"
        variant="default"
        size="sm"
        onClick={onReviewNow}
        className="shrink-0"
      >
        Review now
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
