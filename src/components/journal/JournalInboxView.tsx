import { useMemo, useState, useCallback } from "react";
import { isToday, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { LayoutList, Check } from "lucide-react";
import { JournalInboxCard } from "./JournalInboxCard";
import { JournalMiniReflection, type ReflectionData } from "./JournalMiniReflection";
import type { JournalEntryStub } from "@/stubs/contracts";

interface JournalInboxViewProps {
  pendingEntries: JournalEntryStub[];
  onConfirm: (id: string) => void;
  onArchive: (id: string) => void;
  onSaveNote: (id: string, reflection: ReflectionData) => void;
  onConfirmWithNote: (id: string, reflection: ReflectionData) => void;
  onGoToTimeline: () => void;
  syncErrors?: Set<string>;
}

interface DayGroup {
  label: string;
  entries: JournalEntryStub[];
}

export function JournalInboxView({
  pendingEntries,
  onConfirm,
  onArchive,
  onSaveNote,
  onConfirmWithNote,
  onGoToTimeline,
  syncErrors = new Set(),
}: JournalInboxViewProps) {
  const [reflectionEntry, setReflectionEntry] = useState<JournalEntryStub | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Group entries by Today / Yesterday / Older
  const dayGroups = useMemo(() => {
    const groups: DayGroup[] = [
      { label: "Today", entries: [] },
      { label: "Yesterday", entries: [] },
      { label: "Older", entries: [] },
    ];

    pendingEntries.forEach((entry) => {
      const date = new Date(entry.timestamp);
      if (isToday(date)) {
        groups[0].entries.push(entry);
      } else if (isYesterday(date)) {
        groups[1].entries.push(entry);
      } else {
        groups[2].entries.push(entry);
      }
    });

    // Sort entries within groups (newest first)
    groups.forEach((g) => {
      g.entries.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    return groups.filter((g) => g.entries.length > 0);
  }, [pendingEntries]);

  const handleAddNote = useCallback((entry: JournalEntryStub) => {
    setReflectionEntry(entry);
  }, []);

  const handleSaveNote = useCallback((id: string, reflection: ReflectionData) => {
    onSaveNote(id, reflection);
    setReflectionEntry(null);
  }, [onSaveNote]);

  const handleConfirmSave = useCallback((id: string, reflection: ReflectionData) => {
    onConfirmWithNote(id, reflection);
    setReflectionEntry(null);
  }, [onConfirmWithNote]);

  // Get flat list for keyboard nav index
  const flatEntries = useMemo(
    () => dayGroups.flatMap((g) => g.entries),
    [dayGroups]
  );

  const todayCount = dayGroups.find((g) => g.label === "Today")?.entries.length ?? 0;

  if (pendingEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Check className="h-8 w-8 text-emerald-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
          <p className="text-sm text-muted-foreground">No pending trades to review</p>
        </div>
        <Button variant="outline" onClick={onGoToTimeline}>
          <LayoutList className="h-4 w-4 mr-2" />
          Go to Timeline
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Bulk confirm button for today */}
        {todayCount > 1 && (
          <div className="flex justify-end">
            <Button
              data-testid="journal-inbox-bulk-confirm-today"
              variant="outline"
              size="sm"
              onClick={() => {
                const todayEntries = dayGroups.find((g) => g.label === "Today")?.entries ?? [];
                todayEntries.forEach((e) => onConfirm(e.id));
              }}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Confirm all Today ({todayCount})
            </Button>
          </div>
        )}

        {dayGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {group.label}
            </h3>
            <div className="space-y-3">
              {group.entries.map((entry, idx) => {
                const globalIdx = flatEntries.findIndex((e) => e.id === entry.id);
                return (
                  <JournalInboxCard
                    key={entry.id}
                    entry={entry}
                    onConfirm={() => onConfirm(entry.id)}
                    onArchive={() => onArchive(entry.id)}
                    onAddNote={() => handleAddNote(entry)}
                    isFocused={globalIdx === focusedIndex}
                    hasSyncError={syncErrors.has(entry.id)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <JournalMiniReflection
        isOpen={!!reflectionEntry}
        onClose={() => setReflectionEntry(null)}
        entry={reflectionEntry}
        onSaveNote={handleSaveNote}
        onConfirmSave={handleConfirmSave}
      />
    </>
  );
}
