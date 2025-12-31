import { Badge } from "@/components/ui/badge";
import type { JournalEntryStub } from "@/stubs/contracts";

interface JournalHeaderProps {
  entries: JournalEntryStub[];
}

export function JournalHeader({ entries }: JournalHeaderProps) {
  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const confirmedCount = entries.filter((e) => e.status === "confirmed").length;
  const archivedCount = entries.filter((e) => e.status === "archived").length;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Journal
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {pendingCount} pending
        </Badge>
        <Badge variant="outline" className="text-xs">
          {confirmedCount} confirmed
        </Badge>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {archivedCount} archived
        </Badge>
      </div>
    </div>
  );
}
