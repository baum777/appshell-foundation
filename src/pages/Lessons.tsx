import { PageContainer } from "@/components/layout/PageContainer";

export default function Lessons() {
  return (
    <PageContainer testId="page-lessons">
      <h1 className="text-2xl font-bold text-foreground mb-4">Learn Trading</h1>
      <p className="text-muted-foreground">
        Educational content and lessons to sharpen your skills.
      </p>
      {/* BACKEND_TODO: Fetch lesson content and user progress */}
    </PageContainer>
  );
}
