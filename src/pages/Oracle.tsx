import { useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorBanner } from "@/components/layout/PageStates";
import {
  OracleHeader,
  OracleFilters,
  TodayTakeawayCard,
  StreakBanner,
  InsightCard,
  OracleEmptyState,
  OracleSkeleton,
  type OracleFilter,
} from "@/components/oracle";
import { useOracleStub } from "@/stubs/hooks";
import { toast } from "@/hooks/use-toast";

export default function Oracle() {
  const { pageState, insights, markAsRead } = useOracleStub();

  // Filter state
  const [filter, setFilter] = useState<OracleFilter>("all");

  // Optional pinned cards (stub booleans)
  const showTakeaway = true;
  const showStreak = true;
  const streakDays = 5;

  // Derived counts
  const counts = useMemo(
    () => ({
      all: insights.length,
      new: insights.filter((i) => !i.isRead).length,
      read: insights.filter((i) => i.isRead).length,
    }),
    [insights]
  );

  // Filtered insights
  const filteredInsights = useMemo(() => {
    switch (filter) {
      case "new":
        return insights.filter((i) => !i.isRead);
      case "read":
        return insights.filter((i) => i.isRead);
      default:
        return insights;
    }
  }, [insights, filter]);

  const handleMarkAsRead = (id: string) => {
    // BACKEND_TODO: persist read state
    markAsRead(id);
    toast({
      title: "Marked as read",
      description: "Insight has been marked as read.",
    });
  };

  const handleShowAll = () => {
    setFilter("all");
  };

  // Loading state
  if (pageState.state === "loading") {
    return (
      <PageContainer testId="page-oracle">
        <OracleSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (pageState.state === "error") {
    return (
      <PageContainer testId="page-oracle">
        <div className="space-y-6">
          <OracleHeader unreadCount={0} />
          <ErrorBanner
            message="Failed to load insights"
            onRetry={() => {
              pageState.setState("loading");
              setTimeout(() => pageState.setState("ready"), 1000);
            }}
          />
        </div>
      </PageContainer>
    );
  }

  // Empty state (no insights at all)
  if (pageState.state === "empty" || insights.length === 0) {
    return (
      <PageContainer testId="page-oracle">
        <div className="space-y-6">
          <OracleHeader unreadCount={0} />
          <OracleEmptyState
            type="no-insights"
            onAction={() => {
              pageState.setState("loading");
              setTimeout(() => pageState.setState("ready"), 1000);
            }}
          />
        </div>
      </PageContainer>
    );
  }

  // Ready state
  return (
    <PageContainer testId="page-oracle">
      <div className="space-y-6">
        <OracleHeader unreadCount={counts.new} />

        <OracleFilters
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
        />

        {/* Pinned cards */}
        <div className="space-y-3">
          <TodayTakeawayCard show={showTakeaway} />
          <StreakBanner show={showStreak} streak={streakDays} />
        </div>

        {/* Insights feed */}
        {filteredInsights.length === 0 ? (
          <OracleEmptyState type="filter-empty" onAction={handleShowAll} />
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
