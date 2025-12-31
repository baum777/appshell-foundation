import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JournalEntryStub } from "@/stubs/contracts";
import type { ConfirmPayload } from "@/stubs/hooks";

const MOOD_OPTIONS = [
  { value: "confident", label: "Confident" },
  { value: "neutral", label: "Neutral" },
  { value: "uncertain", label: "Uncertain" },
  { value: "fomo", label: "FOMO" },
  { value: "fearful", label: "Fearful" },
];

interface JournalConfirmModalProps {
  entry: JournalEntryStub | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, payload: ConfirmPayload) => void;
}

export function JournalConfirmModal({
  entry,
  isOpen,
  onClose,
  onConfirm,
}: JournalConfirmModalProps) {
  const [mood, setMood] = useState("neutral");
  const [note, setNote] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleConfirm = () => {
    if (!entry) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onConfirm(entry.id, { mood, note, tags });

    // Reset form
    setMood("neutral");
    setNote("");
    setTagsInput("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Entry</DialogTitle>
          <DialogDescription>
            {entry
              ? `Confirm "${entry.summary.slice(0, 50)}${entry.summary.length > 50 ? "..." : ""}"`
              : "Confirm this journal entry"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mood">Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger id="mood">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add any notes about this trade..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., breakout, momentum, scalp"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Entry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
