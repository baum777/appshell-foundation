import { PageContainer } from "@/components/layout/PageContainer";
import { useDashboardStub } from "@/stubs/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  DashboardHeader,
  QuickOverview,
  KpiStrip,
  NextActions,
  DailyBiasCard,
  HoldingsCard,
  LastTradesCard,
  InsightCard,
  RecentEntries,
  JournalSnapshotCard,
  AlertsSnapshotCard,
  EmptyDashboard,
  DashboardSkeleton,
  DashboardFab,
} from "@/components/dashboard";

// FOUNDATION_TODO: Extract to shared ErrorBanner component
function ErrorBanner({ 
  title, 
  message, 
  onRetry 
}: { 
  title: string; 
  message: string; 
  onRetry: () => void;
}) {
  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="gap-2 shrink-0 w-full sm:w-auto"
            aria-label="Retry loading dashboard"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const {
    pageState,
    hasData,
    overviewCards,
    kpis,
    nextActions,
    recentEntries,
  } = useDashboardStub();

  // Loading state
  if (pageState.isLoading) {
    return (
      <PageContainer testId="page-dashboard">
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (pageState.isError) {
    return (
      <PageContainer testId="page-dashboard">
        <div className="space-y-4 sm:space-y-6">
          <DashboardHeader 
            entriesToday={0} 
            activeAlerts={0} 
            streak="--" 
          />
          <ErrorBanner
            title="Failed to load dashboard"
            message="We couldn't load your dashboard data. Please check your connection and try again."
            onRetry={pageState.retry}
          />
        </div>
      </PageContainer>
    );
  }

  // Empty state (no data) or Ready with hasData=false
  if (pageState.isEmpty || (pageState.isReady && !hasData)) {
    return (
      <PageContainer testId="page-dashboard">
        <div className="space-y-4 sm:space-y-6">
          <DashboardHeader 
            entriesToday={0} 
            activeAlerts={0} 
            streak="--" 
          />
          <EmptyDashboard />
        </div>
        <DashboardFab />
      </PageContainer>
    );
  }

  // Ready state with data
  return (
    <PageContainer testId="page-dashboard">
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* A) Dashboard Header */}
        <DashboardHeader 
          entriesToday={3} 
          activeAlerts={5} 
          streak="5W" 
        />

        {/* B) Quick Overview Row */}
        <QuickOverview cards={overviewCards} />

        {/* C) KPI Strip */}
        <KpiStrip kpis={kpis} />

        {/* D) Next Actions */}
        <NextActions actions={nextActions} />

        {/* E) Main Content - Primary Cards Grid */}
        <section aria-label="Market analysis">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <DailyBiasCard />
            <HoldingsCard />
            <LastTradesCard />
          </div>
        </section>

        {/* Secondary Row */}
        <section aria-label="Snapshots">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <InsightCard />
            <JournalSnapshotCard />
            <AlertsSnapshotCard />
          </div>
        </section>

        {/* Recent Entries */}
        <RecentEntries entries={recentEntries} />
      </div>

      {/* FAB */}
      <DashboardFab />
    </PageContainer>
  );
}
