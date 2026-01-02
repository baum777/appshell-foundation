import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOracleStub } from "@/stubs/hooks";

export default function OracleInsight() {
  const { insightId } = useParams<{ insightId: string }>();
  const { insights } = useOracleStub();

  const id = insightId?.trim() ?? "";
  const insight = id ? insights.find((i) => i.id === id) : undefined;

  if (!id || !insight) {
    return (
      <PageContainer testId="page-oracle-insight">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Oracle Insight
          </h1>
          <p className="text-sm text-muted-foreground">
            {id
              ? `Insight "${id}" wurde nicht gefunden.`
              : "Kein insightId Parameter angegeben."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/oracle">Zurück zu Oracle</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/oracle/status">Provider Status</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer testId="page-oracle-insight">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Oracle Insight
          </h1>
          <Button asChild variant="outline">
            <Link to="/oracle">Zurück zu Oracle</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-sm">{insight.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Theme: </span>
              <span className="font-medium">{insight.theme}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Title: </span>
              <span className="font-medium">{insight.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Summary: </span>
              <span className="font-medium">{insight.summary}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created: </span>
              <span className="font-medium">{insight.createdAt}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Platzhalter für Explainability (Inputs, Weights, Sources, Confidence,
              Cache Age).
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

