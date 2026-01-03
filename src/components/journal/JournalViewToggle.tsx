import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, BookOpen } from "lucide-react";

export type JournalViewMode = "list" | "diary";

interface JournalViewToggleProps {
  value: JournalViewMode;
  onChange: (value: JournalViewMode) => void;
}

export function JournalViewToggle({ value, onChange }: JournalViewToggleProps) {
  return (
    <div data-testid="journal-view-toggle">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as JournalViewMode)}
        className="bg-muted/50 p-1 rounded-lg"
      >
        <ToggleGroupItem
          value="list"
          aria-label="List view"
          data-testid="journal-view-list"
          className="text-xs sm:text-sm px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <List className="h-4 w-4 mr-1.5" />
          List
        </ToggleGroupItem>
        <ToggleGroupItem
          value="diary"
          aria-label="Diary view"
          data-testid="journal-view-diary"
          className="text-xs sm:text-sm px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <BookOpen className="h-4 w-4 mr-1.5" />
          Diary
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
