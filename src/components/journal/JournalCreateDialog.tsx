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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WifiOff } from "lucide-react";
import { useOffline } from "@/components/offline/OfflineContext";

export interface CreateEntryPayload {
  side: "BUY" | "SELL" | "neutral";
  summary: string;
  tags: string[];
}

interface JournalCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateEntryPayload) => void;
}

export function JournalCreateDialog({
  isOpen,
  onClose,
  onCreate,
}: JournalCreateDialogProps) {
  const { isOnline } = useOffline();
  const [side, setSide] = useState<"BUY" | "SELL" | "neutral">("neutral");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleCreate = () => {
    if (!summary.trim() || !isOnline) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onCreate({ side, summary: summary.trim(), tags });

    // Reset form
    setSide("neutral");
    setSummary("");
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
          <DialogTitle>Log entry</DialogTitle>
          <DialogDescription>
            Create a new journal entry to track your trade idea or setup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="side">Side</Label>
            <Select value={side} onValueChange={(v) => setSide(v as typeof side)}>
              <SelectTrigger id="side">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">Long</SelectItem>
                <SelectItem value="SELL">Short</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Note / Summary</Label>
            <Textarea
              id="summary"
              placeholder="Describe your trade idea, setup, or observation..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., breakout, momentum, scalp"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        {!isOnline && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You are offline. Create action is disabled.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!summary.trim() || !isOnline}>
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
