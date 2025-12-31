import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface LearnEmptyStateProps {
  type: "no-lessons" | "no-results";
  onAction: () => void;
}

export function LearnEmptyState({ type, onAction }: LearnEmptyStateProps) {
  const isNoLessons = type === "no-lessons";

  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {isNoLessons ? "No lessons yet" : "No lessons match your filters"}
        </h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {isNoLessons
            ? "Educational content is being prepared. Check back soon!"
            : "Try adjusting your filters or reset to see all available lessons."}
        </p>
        <Button onClick={onAction}>
          {isNoLessons ? "Refresh" : "Reset filters"}
        </Button>
        {/* BACKEND_TODO: fetch lessons */}
      </CardContent>
    </Card>
  );
}
