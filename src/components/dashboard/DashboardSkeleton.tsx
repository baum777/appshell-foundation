import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-label="Loading dashboard" role="status">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-32 sm:w-40" />
          <Skeleton className="h-4 w-48 sm:w-64" />
        </div>
        <Skeleton className="h-10 w-full sm:w-28" />
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-4 w-16 sm:w-20" />
                  <Skeleton className="h-3 w-24 sm:w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPI Strip Skeleton */}
      <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 sm:p-4 space-y-2">
              <Skeleton className="h-3 w-12 sm:w-16" />
              <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Actions Skeleton */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2 sm:pb-3">
          <Skeleton className="h-4 w-20 sm:w-24" />
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-background/50">
              <Skeleton className="h-7 sm:h-8 w-7 sm:w-8 rounded-md shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-24 sm:w-32" />
                <Skeleton className="h-3 w-32 sm:w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Cards Skeleton */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardHeader className="pb-2 sm:pb-3">
              <Skeleton className="h-4 w-20 sm:w-24" />
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Cards Skeleton */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardHeader className="pb-2 sm:pb-3">
              <Skeleton className="h-4 w-24 sm:w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Entries Skeleton */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2 sm:pb-3">
          <Skeleton className="h-4 w-24 sm:w-28" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-background/50">
              <Skeleton className="h-7 w-7 rounded-md shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-24 sm:w-32" />
                <Skeleton className="h-3 w-32 sm:w-40" />
              </div>
              <Skeleton className="h-3 w-16 sm:w-20 shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>

      <span className="sr-only">Loading dashboard content...</span>
    </div>
  );
}
