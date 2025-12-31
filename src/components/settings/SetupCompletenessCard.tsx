import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetupItem {
  id: string;
  label: string;
  completed: boolean;
  link: string;
  linkText: string;
}

interface SetupCompletenessCardProps {
  items: SetupItem[];
}

export function SetupCompletenessCard({ items }: SetupCompletenessCardProps) {
  const completedCount = items.filter((item) => item.completed).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Setup</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{items.length} complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-3">
              {item.completed ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  item.completed ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </div>
            <Link
              to={item.link}
              className="text-xs text-primary hover:underline"
            >
              {item.linkText}
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
