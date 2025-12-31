import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { X } from "lucide-react";

export type AlertStatusFilter = "all" | "active" | "paused" | "triggered";

interface AlertsFilterBarProps {
  filter: AlertStatusFilter;
  onFilterChange: (filter: AlertStatusFilter) => void;
  resultsCount: number;
  totalCount: number;
}

export function AlertsFilterBar({
  filter,
  onFilterChange,
  resultsCount,
  totalCount,
}: AlertsFilterBarProps) {
  const showClear = filter !== "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(value) => value && onFilterChange(value as AlertStatusFilter)}
          className="bg-muted/50 p-1 rounded-lg"
        >
          <ToggleGroupItem
            value="all"
            aria-label="Show all alerts"
            className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            All
          </ToggleGroupItem>
          <ToggleGroupItem
            value="active"
            aria-label="Show active alerts"
            className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            Active
          </ToggleGroupItem>
          <ToggleGroupItem
            value="paused"
            aria-label="Show paused alerts"
            className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            Paused
          </ToggleGroupItem>
          <ToggleGroupItem
            value="triggered"
            aria-label="Show triggered alerts"
            className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            Triggered
          </ToggleGroupItem>
        </ToggleGroup>
        
        {showClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange("all")}
            className="h-8 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        {resultsCount === totalCount
          ? `${totalCount} alert${totalCount !== 1 ? "s" : ""}`
          : `${resultsCount} of ${totalCount} alerts`}
      </p>
    </div>
  );
}
