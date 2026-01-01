import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function SettingsProviders() {
  return (
    <PageContainer testId="page-settings-providers">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings · Providers
        </h1>
        <p className="text-sm text-muted-foreground">
          Platzhalter für Data-Provider Auswahl/Visibility. Geheimnisse dürfen
          niemals client-seitig gespeichert werden.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/settings">Zurück zu Settings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings/privacy">Privacy &amp; AI</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

