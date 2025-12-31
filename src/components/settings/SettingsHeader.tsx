import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SettingsHeaderProps {
  onUpdate: () => void;
}

export function SettingsHeader({ onUpdate }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your experience</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onUpdate}
        className="mt-2 sm:mt-0"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Update app
      </Button>
      {/* BACKEND_TODO: service worker update flow */}
    </div>
  );
}
