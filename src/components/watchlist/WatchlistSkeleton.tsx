import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WatchlistSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-9 w-16" />
      </div>

      {/* QuickAdd skeleton */}
      <div className="flex gap-2">
        <div className="flex-1 max-w-sm space-y-1">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-10 w-16" />
      </div>

      {/* Main content skeleton - split layout */}
      <div className="flex gap-6">
        {/* List skeleton */}
        <div className="flex-1 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-card/50"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>

        {/* Detail panel skeleton (desktop) */}
        <div className="hidden md:block w-80 shrink-0">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-14" />
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
