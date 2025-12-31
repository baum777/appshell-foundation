import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface SettingsEmptyStateProps {
  onRetry: () => void;
}

export function SettingsEmptyState({ onRetry }: SettingsEmptyStateProps) {
  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Settings className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No settings available
        </h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          Settings could not be loaded. Try refreshing the page or resetting to defaults.
        </p>
        <Button onClick={onRetry}>Reset to defaults</Button>
        {/* BACKEND_TODO: fetch settings */}
      </CardContent>
    </Card>
  );
}
