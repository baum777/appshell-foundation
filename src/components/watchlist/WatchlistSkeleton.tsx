import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WatchlistSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-28 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28 mt-3 sm:mt-0" />
      </div>

      {/* QuickAdd skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-16" />
      </div>

      {/* Main content skeleton */}
      <div className="flex gap-6">
        {/* Cards grid skeleton */}
        <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-16 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-7 w-7" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail panel skeleton (desktop) */}
        <div className="hidden md:block w-72 shrink-0">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-0">
              <Skeleton className="h-5 w-16" />
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
