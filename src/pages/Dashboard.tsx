import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorState } from "@/components/layout/PageStates";
import { useDashboardStub } from "@/stubs/hooks";
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
        <ErrorState
          title="Failed to load dashboard"
          message="We couldn't load your dashboard data. Please try again."
          onRetry={pageState.retry}
        />
      </PageContainer>
    );
  }

  // Empty state (no data) or Ready with hasData=false
  if (pageState.isEmpty || (pageState.isReady && !hasData)) {
    return (
      <PageContainer testId="page-dashboard">
        <div className="space-y-6">
          <DashboardHeader 
            entriesToday={0} 
            activeAlerts={0} 
            streak="0" 
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
      <div className="space-y-6 animate-fade-in">
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
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <DailyBiasCard />
          <HoldingsCard />
          <LastTradesCard />
        </div>

        {/* Secondary Row */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <InsightCard />
          <JournalSnapshotCard />
          <AlertsSnapshotCard />
        </div>

        {/* Recent Entries */}
        <RecentEntries entries={recentEntries} />
      </div>

      {/* FAB */}
      <DashboardFab />
    </PageContainer>
  );
}
