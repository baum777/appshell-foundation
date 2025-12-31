import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2 } from "lucide-react";

const TIMEFRAMES = [
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "4h", label: "4h" },
  { value: "1d", label: "1D" },
];

interface ChartTopBarProps {
  symbol: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  isReplayMode: boolean;
  onReplayToggle: (enabled: boolean) => void;
  onMobileToolsOpen: () => void;
  isMobile: boolean;
}

export function ChartTopBar({
  symbol,
  timeframe,
  onTimeframeChange,
  isReplayMode,
  onReplayToggle,
  onMobileToolsOpen,
  isMobile,
}: ChartTopBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card/50 border border-border/50 rounded-lg">
      {/* Left: Symbol badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm font-medium">
          {symbol}
        </Badge>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Solana
        </Badge>
        {isReplayMode && (
          <Badge variant="default" className="text-xs bg-primary/20 text-primary">
            Replay Mode
          </Badge>
        )}
      </div>

      {/* Center/Right: Controls */}
      <div className="flex items-center gap-3">
        {/* Timeframe select */}
        <Select value={timeframe} onValueChange={onTimeframeChange}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEFRAMES.map((tf) => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Replay toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="replay-toggle"
            checked={isReplayMode}
            onCheckedChange={onReplayToggle}
            aria-label="Toggle replay mode"
          />
          <Label htmlFor="replay-toggle" className="text-sm cursor-pointer hidden sm:inline">
            Replay
          </Label>
        </div>

        {/* Mobile tools button */}
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMobileToolsOpen}
            className="h-8"
          >
            <Settings2 className="h-4 w-4" />
            <span className="ml-1 hidden xs:inline">Tools</span>
          </Button>
        )}
      </div>
    </div>
  );
}
