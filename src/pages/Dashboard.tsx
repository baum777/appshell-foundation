import { PageContainer } from "@/components/layout/PageContainer";

export default function Dashboard() {
  return (
    <PageContainer testId="page-dashboard">
      <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>
      <p className="text-muted-foreground">
        Your trading overview and key metrics will appear here.
      </p>
      {/* BACKEND_TODO: Fetch dashboard metrics and recent activity */}
    </PageContainer>
  );
}
