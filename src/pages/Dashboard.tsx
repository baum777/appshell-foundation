import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorBanner } from "@/components/layout/PageStates";
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
        <div className="space-y-4 sm:space-y-6">
          <DashboardHeader 
            entriesToday={0} 
            activeAlerts={0} 
            streak="--" 
          />
          <ErrorBanner
            message="Failed to load dashboard. Please check your connection and try again."
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
