import { PageContainer } from "@/components/layout/PageContainer";

export default function Journal() {
  return (
    <PageContainer testId="page-journal">
      <h1 className="text-2xl font-bold text-foreground mb-4">Trade Journal</h1>
      <p className="text-muted-foreground">
        Log and review your trades to improve your strategy.
      </p>
      {/* BACKEND_TODO: Fetch journal entries and trade history */}
    </PageContainer>
  );
}
