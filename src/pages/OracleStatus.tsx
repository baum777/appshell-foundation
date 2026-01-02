import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function OracleStatus() {
  return (
    <PageContainer testId="page-oracle-status">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Oracle Provider Health
        </h1>
        <p className="text-sm text-muted-foreground">
          Platzhalter für Provider-Status, Rate-Limits, Cache Hit Rate, Last Fetch
          und Error Taxonomy.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/oracle">Zurück zu Oracle</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/oracle/inbox">Zur Inbox</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

