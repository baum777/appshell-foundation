import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function OracleInbox() {
  return (
    <PageContainer testId="page-oracle-inbox">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Oracle Inbox
        </h1>
        <p className="text-sm text-muted-foreground">
          Platzhalter für den Oracle Timeline Feed (global & per Asset).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/oracle">Zurück zu Oracle</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Zum Dashboard</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

