import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function JournalReview() {
  return (
    <PageContainer testId="page-journal-review">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Journal Review Queue
        </h1>
        <p className="text-sm text-muted-foreground">
          Platzhalter für den Review-Workflow (Pending → Confirmed → Archived) inkl.
          Bulk-Aktionen und Daily Review.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/journal">Zurück zum Journal</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Zum Dashboard</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

