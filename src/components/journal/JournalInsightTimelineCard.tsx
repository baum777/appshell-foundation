import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  ChevronRight,
  Target,
  X,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalInsightTimelineCardProps {
  headline: string;
  bullets: string[];
  onShowEvidence?: () => void;
  onTrack?: () => void;
  onDismiss?: () => void;
}

export function JournalInsightTimelineCard({
  headline,
  bullets,
  onShowEvidence,
  onTrack,
  onDismiss,
}: JournalInsightTimelineCardProps) {
  return (
    <Card
      data-testid="journal-card-insight"
      className={cn(
        "relative bg-primary/5 border-primary/20 rounded-xl",
        "hover:border-primary/40 transition-all"
      )}
    >
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-primary" />

      <CardContent className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30 mb-1">
              AI Insight
            </Badge>
            <p className="font-medium text-foreground">{headline}</p>
          </div>
        </div>

        {/* Bullets */}
        {bullets.length > 0 && (
          <ul className="space-y-1.5 mb-3 pl-6">
            {bullets.slice(0, 2).map((bullet, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary shrink-0">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            data-testid="journal-insight-evidence"
            variant="ghost"
            size="sm"
            onClick={onShowEvidence}
            className="text-primary"
          >
            Show trades
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            data-testid="journal-insight-track"
            variant="outline"
            size="sm"
            onClick={onTrack}
          >
            <Bookmark className="h-4 w-4 mr-1" />
            Track
          </Button>
          <Button
            data-testid="journal-insight-dismiss"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-muted-foreground ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
