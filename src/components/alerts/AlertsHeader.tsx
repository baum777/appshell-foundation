import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AlertsHeaderProps {
  onCreateClick: () => void;
}

export function AlertsHeader({ onCreateClick }: AlertsHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Alerts
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor key levels
        </p>
      </div>
      <Button onClick={onCreateClick} className="mt-3 sm:mt-0">
        <Plus className="h-4 w-4 mr-2" />
        Create alert
      </Button>
    </div>
  );
}
