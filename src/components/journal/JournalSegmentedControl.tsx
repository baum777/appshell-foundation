import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type JournalView = "pending" | "confirmed" | "archived";

interface JournalSegmentedControlProps {
  value: JournalView;
  onChange: (value: JournalView) => void;
  counts: {
    pending: number;
    confirmed: number;
    archived: number;
  };
}

export function JournalSegmentedControl({
  value,
  onChange,
  counts,
}: JournalSegmentedControlProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as JournalView)}
      className="bg-muted/50 p-1 rounded-lg w-full sm:w-auto"
    >
      <ToggleGroupItem
        value="pending"
        aria-label="Show pending entries"
        className="flex-1 sm:flex-initial text-xs sm:text-sm px-3 sm:px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        Pending ({counts.pending})
      </ToggleGroupItem>
      <ToggleGroupItem
        value="confirmed"
        aria-label="Show confirmed entries"
        className="flex-1 sm:flex-initial text-xs sm:text-sm px-3 sm:px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        Confirmed ({counts.confirmed})
      </ToggleGroupItem>
      <ToggleGroupItem
        value="archived"
        aria-label="Show archived entries"
        className="flex-1 sm:flex-initial text-xs sm:text-sm px-3 sm:px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        Archived ({counts.archived})
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
