import { PageContainer } from "@/components/layout/PageContainer";

export default function Handbook() {
  return (
    <PageContainer testId="page-handbook">
      <h1 className="text-2xl font-bold text-foreground mb-4">Handbook</h1>
      <p className="text-muted-foreground">
        Your personal trading playbook and strategies.
      </p>
      {/* BACKEND_TODO: Fetch user handbook entries and strategies */}
    </PageContainer>
  );
}
