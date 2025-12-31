import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JournalEntryStub } from "@/stubs/contracts";

const ARCHIVE_REASONS = [
  { value: "market_changed", label: "Market conditions changed" },
  { value: "invalid_setup", label: "Invalid setup" },
  { value: "missed_entry", label: "Missed entry" },
  { value: "duplicate", label: "Duplicate entry" },
  { value: "other", label: "Other" },
];

interface JournalArchiveDialogProps {
  entry: JournalEntryStub | null;
  isOpen: boolean;
  onClose: () => void;
  onArchive: (id: string, reason: string) => void;
}

export function JournalArchiveDialog({
  entry,
  isOpen,
  onClose,
  onArchive,
}: JournalArchiveDialogProps) {
  const [reason, setReason] = useState("market_changed");

  const handleArchive = () => {
    if (!entry) return;
    onArchive(entry.id, reason);
    setReason("market_changed");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Entry</AlertDialogTitle>
          <AlertDialogDescription>
            This entry will be moved to the archived section. You can restore it
            later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="archive-reason">Reason for archiving</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="archive-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARCHIVE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
