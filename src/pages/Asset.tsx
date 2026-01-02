import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isValidSolanaBase58 } from "@/routes/routes";

export default function Asset() {
  const { assetId } = useParams<{ assetId: string }>();
  const id = assetId?.trim() ?? "";
  const isValid = !!id && isValidSolanaBase58(id);

  return (
    <PageContainer testId="page-asset">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Asset Hub
        </h1>

        {!isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ungültige assetId. Erwartet wird Solana Base58 (32–44 Zeichen).
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border border-border bg-card/30 p-4">
          <p className="text-sm text-muted-foreground">
            Asset ID: <span className="font-mono">{id || "(leer)"}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Platzhalter: hier werden Chart/Alerts/Oracle/Journal für ein Token gebündelt.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/chart">Zum Chart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/oracle">Zu Oracle</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/journal">Zum Journal</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

