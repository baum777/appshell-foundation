import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AlertTriangle, Clock, User, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { FeedCard, Impact, FreshnessStatus } from "@/types/feed";

interface FeedCardItemProps {
  card: FeedCard;
  compact?: boolean;
}

function getImpactBadgeVariant(impact: Impact): "default" | "secondary" | "destructive" | "outline" {
  switch (impact) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

function getImpactLabel(impact: Impact): string {
  switch (impact) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Med";
    default:
      return "Low";
  }
}

function getFreshnessLabel(status: FreshnessStatus): string {
  switch (status) {
    case "fresh":
      return "fresh";
    case "soft_stale":
      return "stale";
    case "hard_stale":
      return "very stale";
  }
}

function getRelativeTime(isoDate: string): string {
  const now = Date.now();
  const date = new Date(isoDate).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export function FeedCardItem({ card, compact = false }: FeedCardItemProps) {
  const confidencePercent = Math.round(card.confidence * 100);
  const displayedFacts = compact ? card.facts?.slice(0, 2) : card.facts?.slice(0, 4);

  const handleAction = (action: { type: string; label: string }) => {
    // BACKEND HOOK
    toast({
      title: "Not implemented",
      description: `Action "${action.label}" is not yet available.`,
    });
  };

  return (
    <TooltipProvider>
      <Card data-testid="feed-card" className="bg-card/50 border-border/50">
        <CardContent className={compact ? "p-3" : "p-4"}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4
              data-testid="feed-card-title"
              className={`font-medium ${compact ? "text-sm line-clamp-1" : "text-base line-clamp-2"}`}
            >
              {card.title}
            </h4>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                data-testid="feed-card-badge-scope"
                variant="outline"
                className="text-xs gap-1"
              >
                {card.scope === "user" ? (
                  <>
                    <User className="h-3 w-3" />
                    USER
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3" />
                    MARKET
                  </>
                )}
              </Badge>
              <Badge
                data-testid="feed-card-badge-impact"
                variant={getImpactBadgeVariant(card.impact)}
                className="text-xs"
              >
                {getImpactLabel(card.impact)}
              </Badge>
            </div>
          </div>

          {/* Why text */}
          <p
            className={`text-muted-foreground leading-relaxed ${
              compact ? "text-xs line-clamp-2" : "text-sm line-clamp-2"
            } mb-3`}
          >
            {card.why}
          </p>

          {/* Freshness + Confidence row */}
          <div className="flex items-center gap-4 mb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  data-testid="feed-card-freshness"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Clock className="h-3 w-3" />
                  <span>{getFreshnessLabel(card.freshness.status)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Age: {Math.round(card.freshness.ageSec / 60)} minutes</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  data-testid="feed-card-confidence"
                  className="flex items-center gap-2 flex-1"
                >
                  <span className="text-xs text-muted-foreground shrink-0">
                    {confidencePercent}%
                  </span>
                  <Progress value={confidencePercent} className="h-1.5 flex-1 max-w-20" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Confidence: {confidencePercent}%</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground" title={card.asOf}>
                  {getRelativeTime(card.asOf)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{new Date(card.asOf).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Facts */}
          {displayedFacts && displayedFacts.length > 0 && !compact && (
            <div className="flex flex-wrap gap-2 mb-3">
              {displayedFacts.map((fact, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {fact.label}: {fact.value}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          {card.actions && card.actions.length > 0 && !compact && (
            <div className="flex flex-wrap gap-2">
              {card.actions.map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleAction(action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
