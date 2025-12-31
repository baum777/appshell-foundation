import { PageContainer } from "@/components/layout/PageContainer";

export default function Watchlist() {
  return (
    <PageContainer testId="page-watchlist">
      <h1 className="text-2xl font-bold text-foreground mb-4">Watchlist</h1>
      <p className="text-muted-foreground">
        Track your favorite instruments and market movers.
      </p>
      {/* BACKEND_TODO: Fetch watchlist items and real-time prices */}
    </PageContainer>
  );
}
