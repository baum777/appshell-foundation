import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";

export default function SettingsData() {
  return (
    <PageContainer testId="page-settings-data">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings · Data
        </h1>
        <p className="text-sm text-muted-foreground">
          Platzhalter für Import/Export (JSON), Clear Local Data und
          Migrations-Helfer.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/settings">Zurück zu Settings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings/experiments">Experiments</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

