import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp } from "lucide-react";

interface TodayTakeawayCardProps {
  show: boolean;
}

export function TodayTakeawayCard({ show }: TodayTakeawayCardProps) {
  if (!show) return null;

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground">Today's Takeaway</div>
            <p className="text-sm text-muted-foreground">
              Market showing signs of consolidation. Watch key support levels
              before entering new positions.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/chart">
            <TrendingUp className="mr-2 h-4 w-4" />
            Open chart
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface StreakBannerProps {
  show: boolean;
  streak: number;
}

export function StreakBanner({ show, streak }: StreakBannerProps) {
  if (!show) return null;

  return (
    <Card className="border-success/30 bg-success/5">
      <CardContent className="flex items-center gap-3 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
          <span className="text-lg">🔥</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-foreground">{streak} day streak!</span>
          <span className="text-muted-foreground"> Keep checking daily insights.</span>
        </div>
      </CardContent>
    </Card>
  );
}
