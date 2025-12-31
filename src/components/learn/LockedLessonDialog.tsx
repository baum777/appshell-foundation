import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2 } from "lucide-react";
import type { LessonStub } from "@/stubs/contracts";

interface LockedLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonStub | null;
}

export function LockedLessonDialog({
  open,
  onOpenChange,
  lesson,
}: LockedLessonDialogProps) {
  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Lesson Locked
          </DialogTitle>
          <DialogDescription>
            "{lesson.title}" requires completing prerequisites first.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="text-sm font-medium text-foreground">
            Unlock requirements:
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm">Complete basic lessons</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Achieve 80% on "Introduction to Chart Patterns"
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Log 3 journal entries
              </span>
            </div>
          </div>
          {/* BACKEND_TODO: fetch real unlock requirements for this lesson */}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
