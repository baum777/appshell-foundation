import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      {/* TopBar skeleton */}
      <div className="flex items-center justify-between gap-3 p-3 bg-card/50 border border-border/50 rounded-lg">
        <Skeleton className="h-6 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex gap-4">
        {/* Left sidebar skeleton (desktop only) */}
        <div className="hidden md:block w-56 shrink-0">
          <Card className="bg-card/50 border-border/50 h-[500px]">
            <CardContent className="p-3 space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-7 w-7" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center content skeleton */}
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

          {/* Tabs skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-24 w-full rounded-lg" />
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
