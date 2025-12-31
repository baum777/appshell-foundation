import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lock, CheckCircle2 } from "lucide-react";

interface UnlockCalloutProps {
  lockedCount: number;
}

export function UnlockCallout({ lockedCount }: UnlockCalloutProps) {
  if (lockedCount === 0) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground">
              Unlock {lockedCount} more lesson{lockedCount !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-muted-foreground">
              Complete prerequisites to access advanced content
            </div>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              See requirements
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unlock Requirements</DialogTitle>
              <DialogDescription>
                Complete these steps to unlock more lessons
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm">Complete "Introduction to Chart Patterns"</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm">Achieve 50% progress on basics</span>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Log at least 5 journal entries</span>
              </div>
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Set up your watchlist</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Got it</Button>
            </DialogFooter>
            {/* BACKEND_TODO: fetch real unlock requirements */}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
