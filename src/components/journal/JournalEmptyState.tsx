import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JournalEmptyStateProps {
  type: "all" | "segment";
  segmentName?: string;
}

export function JournalEmptyState({ type, segmentName }: JournalEmptyStateProps) {
  const navigate = useNavigate();

  if (type === "segment") {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center">
          <p className="text-sm text-muted-foreground">
            {segmentName === "pending"
              ? "No pending entries — you're clean."
              : `No ${segmentName} entries yet.`}
          </p>
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

        <Button onClick={() => navigate("/journal")}>
          <Plus className="h-4 w-4 mr-2" />
          Log your first entry
        </Button>
      </CardContent>
    </Card>
  );
}
