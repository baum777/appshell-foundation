import { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type FeedMode = "oracle" | "pulse";

const STORAGE_KEY = "ui.chartFeedMode";

interface FeedToggleProps {
  value?: FeedMode;
  onChange?: (mode: FeedMode) => void;
}

export function FeedToggle({ value, onChange }: FeedToggleProps) {
  const [mode, setMode] = useState<FeedMode>(() => {
    if (value) return value;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "pulse" ? "pulse" : "oracle";
    } catch {
      return "oracle";
    }
  });

  // Sync with controlled value
  useEffect(() => {
    if (value && value !== mode) {
      setMode(value);
    }
  }, [value, mode]);

  const handleChange = (newMode: string) => {
    if (!newMode) return;
    const m = newMode as FeedMode;
    setMode(m);
    
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // Ignore storage errors
    }
    
    onChange?.(m);
  };

  return (
    <div data-testid="feed-toggle">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={handleChange}
        className="bg-muted/50 rounded-md p-0.5"
      >
        <ToggleGroupItem
          value="oracle"
          data-testid="feed-toggle-oracle"
          className="text-xs px-3 h-7 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          Oracle
        </ToggleGroupItem>
        <ToggleGroupItem
          value="pulse"
          data-testid="feed-toggle-pulse"
          className="text-xs px-3 h-7 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          Pulse
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function getStoredFeedMode(): FeedMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "pulse" ? "pulse" : "oracle";
  } catch {
    return "oracle";
  }
}
