import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";

interface JournalEmptyStateProps {
  type: "all" | "segment" | "search";
  segmentName?: string;
  onLogEntry?: () => void;
  onClearSearch?: () => void;
}

export function JournalEmptyState({ type, segmentName, onLogEntry, onClearSearch }: JournalEmptyStateProps) {
  if (type === "search") {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            No entries match your search.
          </p>
          {onClearSearch && (
            <Button variant="outline" size="sm" onClick={onClearSearch}>
              Clear search
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === "segment") {
    const getMessage = () => {
      switch (segmentName) {
        case "pending":
          return "No pending entries — you're clean.";
        case "confirmed":
          return "No confirmed entries yet.";
        case "archived":
          return "Nothing archived.";
        default:
          return `No ${segmentName} entries yet.`;
      }
    };

    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {getMessage()}
          </p>
          {onLogEntry && (
            <Button onClick={onLogEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Log entry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          No journal entries yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Start tracking your trades by logging your first entry. Build your
          trading history and learn from your decisions.
        </p>

        {onLogEntry && (
          <Button onClick={onLogEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Log your first entry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
