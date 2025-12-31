import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MousePointer2,
  TrendingUp,
  Percent,
  Square,
  Type,
  Crosshair,
} from "lucide-react";

const TOOLS = [
  { id: "cursor", icon: MousePointer2, label: "Cursor" },
  { id: "trendline", icon: TrendingUp, label: "Trendline" },
  { id: "fib", icon: Percent, label: "Fibonacci" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "text", icon: Type, label: "Text" },
];

interface ChartToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  crosshairEnabled: boolean;
  onCrosshairToggle: (enabled: boolean) => void;
}

export function ChartToolbar({
  activeTool,
  onToolChange,
  crosshairEnabled,
  onCrosshairToggle,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-card/50 border border-border/50 rounded-lg">
      <div className="flex items-center gap-1">
        {TOOLS.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onToolChange(tool.id)}
                aria-label={tool.label}
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Switch
                id="crosshair-toggle"
                checked={crosshairEnabled}
                onCheckedChange={onCrosshairToggle}
                aria-label="Toggle crosshair"
              />
              <Label htmlFor="crosshair-toggle" className="text-xs cursor-pointer flex items-center gap-1">
                <Crosshair className="h-3 w-3" />
                <span className="hidden sm:inline">Crosshair</span>
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Toggle crosshair</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
