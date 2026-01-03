import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Play,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalLearnViewProps {
  onStartReview?: () => void;
  onShowEvidence?: (type: "focus" | "mistakes" | "setups", index?: number) => void;
}

// Stub data for UI scaffold
const focusItem = {
  title: "Wait for confirmation before entry",
  description: "Your win rate improves when you wait for candle close confirmation.",
};

const mistakeItems = [
  { id: "1", title: "Entering too early", count: 3 },
  { id: "2", title: "Moving stop loss", count: 2 },
  { id: "3", title: "Overleveraging", count: 1 },
];

const setupItems = [
  { id: "1", title: "Breakout + retest", winRate: 68 },
  { id: "2", title: "Trend continuation", winRate: 62 },
  { id: "3", title: "Range fade", winRate: 55 },
];

export function JournalLearnView({
  onStartReview,
  onShowEvidence,
}: JournalLearnViewProps) {
  return (
    <div data-testid="journal-learn" className="space-y-6">
      {/* Start Review CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-foreground">Quick Review</h3>
            <p className="text-sm text-muted-foreground">
              3 pending trades · ~3 min
            </p>
          </div>
          <Button
            data-testid="journal-learn-start-review"
            onClick={onStartReview}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Review
          </Button>
        </CardContent>
      </Card>

      {/* Focus Card */}
      <Card data-testid="journal-learn-focus">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">This Week's Focus</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <p className="font-medium text-foreground">{focusItem.title}</p>
            <p className="text-sm text-muted-foreground">{focusItem.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Mistakes */}
      <Card data-testid="journal-learn-mistakes">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">Top Mistakes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-3">
            {mistakeItems.map((item, idx) => (
              <li key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">
                    {idx + 1}.
                  </span>
                  <span className="text-sm text-foreground">{item.title}</span>
                </div>
                <button
                  data-testid="journal-learn-evidence-item"
                  onClick={() => onShowEvidence?.("mistakes", idx)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Badge variant="secondary" className="text-xs">
                    {item.count}x
                  </Badge>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Best Setups */}
      <Card data-testid="journal-learn-setups">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-base">Best Setups</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-3">
            {setupItems.map((item, idx) => (
              <li key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">
                    {idx + 1}.
                  </span>
                  <span className="text-sm text-foreground">{item.title}</span>
                </div>
                <button
                  data-testid="journal-learn-evidence-item"
                  onClick={() => onShowEvidence?.("setups", idx)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      item.winRate >= 60
                        ? "text-emerald-500 border-emerald-500/50"
                        : "text-foreground"
                    )}
                  >
                    {item.winRate}% WR
                  </Badge>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
