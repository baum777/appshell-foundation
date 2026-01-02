import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function SettingsPrivacy() {
  return (
    <PageContainer testId="page-settings-privacy">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings · Privacy &amp; AI
        </h1>
        <p className="text-sm text-muted-foreground">
          Platzhalter für AI Opt-in, Retention Controls und Telemetry Toggles.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/settings">Zurück zu Settings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings/providers">Providers</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

