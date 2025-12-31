import { PageContainer } from "@/components/layout/PageContainer";

export default function Oracle() {
  return (
    <PageContainer testId="page-oracle">
      <h1 className="text-2xl font-bold text-foreground mb-4">Oracle</h1>
      <p className="text-muted-foreground">
        AI-powered insights and market predictions.
      </p>
      {/* BACKEND_TODO: Fetch AI analysis and predictions */}
    </PageContainer>
  );
}
