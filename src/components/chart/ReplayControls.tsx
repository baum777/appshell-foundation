import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
} from "lucide-react";

const SPEEDS = [
  { value: "0.5", label: "0.5x" },
  { value: "1", label: "1x" },
  { value: "2", label: "2x" },
  { value: "4", label: "4x" },
];

interface ReplayControlsProps {
  onReset?: () => void;
  isOverlayOpen?: boolean;
}

export function ReplayControls({ onReset, isOverlayOpen = false }: ReplayControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState("1");
  const [showHint, setShowHint] = useState(true);

  const maxPosition = 100;

  // Auto-advance position when playing
  useEffect(() => {
    if (!isPlaying) return;

    const speedMultiplier = parseFloat(speed);
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev >= maxPosition) {
          setIsPlaying(false);
          return maxPosition;
        }
        return Math.min(prev + 1, maxPosition);
      });
    }, 500 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Hide hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts - with overlay guard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire when overlay is open
      if (isOverlayOpen) return;

      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInputFocused) return;

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setPosition((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setPosition((prev) => Math.min(maxPosition, prev + 1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayOpen]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setPosition(0);
    setSpeed("1");
    onReset?.();
  }, [onReset]);

  const stepBack = () => setPosition((prev) => Math.max(0, prev - 1));
  const stepForward = () => setPosition((prev) => Math.min(maxPosition, prev + 1));

  // Generate fake time from position
  const fakeTime = new Date(Date.now() - (maxPosition - position) * 60000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-3 bg-card/50 border border-border/50 rounded-lg space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleReset}
                aria-label="Reset replay"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={stepBack}
                aria-label="Step back"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Step back (←)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? "Pause (Space)" : "Play (Space)"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={stepForward}
                aria-label="Step forward"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Step forward (→)</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono min-w-[4rem] text-center">
            {fakeTime}
          </span>

          <Select value={speed} onValueChange={setSpeed}>
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPEEDS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Slider
          value={[position]}
          onValueChange={([value]) => setPosition(value)}
          max={maxPosition}
          step={1}
          className="flex-1"
          aria-label="Replay position"
        />
        <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
          {position}%
        </span>
      </div>

      {showHint && (
        <p className="text-xs text-muted-foreground text-center">
          Space: Play/Pause · ←/→ Step
        </p>
      )}
    </div>
  );
}
