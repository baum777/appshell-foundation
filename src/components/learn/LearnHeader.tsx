import { Progress } from "@/components/ui/progress";

interface LearnHeaderProps {
  unlockedCount: number;
  totalCount: number;
}

export function LearnHeader({ unlockedCount, totalCount }: LearnHeaderProps) {
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Learn</h1>
        <p className="text-sm text-muted-foreground">
          Master trading fundamentals and advanced strategies
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">
            Unlocked {unlockedCount} / {totalCount}
          </div>
          <div className="text-xs text-muted-foreground">lessons available</div>
        </div>
        <div className="w-24">
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>
    </div>
  );
}
