import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      {/* TopBar skeleton */}
      <div className="flex items-center justify-between gap-3 p-3 bg-card/50 border border-border/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Markets Banner skeleton */}
      <div className="p-3 bg-card/50 border border-border/50 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-14 shrink-0" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex gap-4">
        {/* Center content skeleton - full width */}
        <div className="flex-1 space-y-3">
          {/* Toolbar skeleton */}
          <div className="flex items-center justify-between gap-2 p-2 bg-card/50 border border-border/50 rounded-lg">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8" />
              ))}
            </div>
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Canvas skeleton */}
          <Skeleton className="min-h-[360px] md:min-h-[480px] rounded-lg" />

          {/* Bottom carousel skeleton */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-[200px] w-[85%] rounded-lg shrink-0" />
              <Skeleton className="h-[200px] w-[15%] rounded-lg shrink-0" />
            </div>
          </div>
        </div>

        {/* Right panel skeleton (desktop only) */}
        <div className="hidden lg:block w-52 shrink-0">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3 space-y-3">
              <Skeleton className="h-5 w-16" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-10" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
