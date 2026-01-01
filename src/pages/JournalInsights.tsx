import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function JournalInsights() {
  return (
    <PageContainer testId="page-journal-insights">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Journal Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          Platzhalter für Analytics/KPIs, Patterns, Heuristiken und AI-Summaries.
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

