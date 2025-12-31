import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import type { AlertStub } from "@/stubs/contracts";
import { formatDistanceToNow } from "date-fns";

interface AlertCardProps {
  alert: AlertStub;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

function getConditionText(condition: string, targetPrice: number): string {
  const formattedPrice = targetPrice.toLocaleString();
  switch (condition) {
    case "above":
      return `Above ${formattedPrice}`;
    case "below":
      return `Below ${formattedPrice}`;
    case "crosses_above":
      return `Crosses above ${formattedPrice}`;
    case "crosses_below":
      return `Crosses below ${formattedPrice}`;
    default:
      return `${condition} ${formattedPrice}`;
  }
}

function getStatusBadgeVariant(status: AlertStub["status"]): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "paused":
      return "secondary";
    case "triggered":
      return "outline";
    default:
      return "secondary";
  }
}

export function AlertCard({ alert, onToggleStatus, onDelete }: AlertCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(alert.id);
  };

  const createdAtText = formatDistanceToNow(new Date(alert.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground truncate">
                {alert.symbol}
              </span>
              <Badge variant={getStatusBadgeVariant(alert.status)} className="text-xs">
                {alert.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {getConditionText(alert.condition, alert.targetPrice)}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Created {createdAtText}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {alert.status !== "triggered" && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={alert.status === "active"}
                  onCheckedChange={() => onToggleStatus(alert.id)}
                  aria-label={`Toggle ${alert.symbol} alert ${alert.status === "active" ? "off" : "on"}`}
                />
              </div>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${alert.symbol} alert`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete alert?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the {alert.symbol} alert for{" "}
                    {getConditionText(alert.condition, alert.targetPrice).toLowerCase()}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
