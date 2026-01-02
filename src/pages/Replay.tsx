import { Link, useLocation } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function Replay() {
  const location = useLocation();

  return (
    <PageContainer testId="page-replay">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Replay
        </h1>
        <p className="text-sm text-muted-foreground">
          Replay-Modus ist in dieser Migration aktuell ein Platzhalter.
        </p>
        <div className="rounded-lg border border-border bg-card/30 p-4">
          <p className="text-sm text-muted-foreground">
            Direktlink: <span className="font-mono">{location.pathname}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/chart">Zurück zum Chart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Zum Dashboard</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

