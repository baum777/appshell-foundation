import { Badge } from "@/components/ui/badge";

interface OracleHeaderProps {
  unreadCount: number;
}

export function OracleHeader({ unreadCount }: OracleHeaderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Oracle</h1>
        {unreadCount > 0 && (
          <Badge variant="default" className="text-xs">
            New: {unreadCount}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        AI-powered insights and market predictions
      </p>
    </div>
  );
}
