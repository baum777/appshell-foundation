import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export interface WatchlistQuickAddRef {
  focus: () => void;
  prefill: (value: string) => void;
}

interface WatchlistQuickAddProps {
  onAdd: (symbol: string) => boolean;
}

function detectInputType(value: string): "ticker" | "contract" {
  // Heuristic: if 32+ chars and no spaces, treat as contract address
  if (value.length >= 32 && !value.includes(" ")) {
    return "contract";
  }
  return "ticker";
}

export const WatchlistQuickAdd = forwardRef<WatchlistQuickAddRef, WatchlistQuickAddProps>(
  ({ onAdd }, ref) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const inputType = detectInputType(value.trim());

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      prefill: (val: string) => {
        setValue(val);
        setError(null);
        inputRef.current?.focus();
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmed = value.trim();
      if (!trimmed) {
        setError("Please enter a ticker or contract address");
        return;
      }

      // Validate: letters, numbers, and common address chars only
      if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
        setError("Only letters and numbers allowed");
        return;
      }

      // Normalize ticker to uppercase
      const normalized = inputType === "ticker" ? trimmed.toUpperCase() : trimmed;

      const success = onAdd(normalized);
      if (!success) {
        setError("Already in watchlist");
        return;
      }

      setValue("");
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 max-w-sm space-y-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Add ticker or contract address"
              value={value}
              onChange={(e) => {
                // Auto-uppercase for tickers only (short values)
                const newVal = e.target.value;
                if (detectInputType(newVal.trim()) === "ticker") {
                  setValue(newVal.toUpperCase());
                } else {
                  setValue(newVal);
                }
                setError(null);
              }}
            />
            <p className="text-xs text-muted-foreground">
              {value.trim() ? (
                inputType === "contract" ? (
                  <span className="text-primary">Contract address detected</span>
                ) : (
                  "Ticker symbol"
                )
              ) : (
                "Ticker or Solana contract address"
              )}
            </p>
          </div>
          <Button type="submit" size="default" disabled={!value.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>
    );
  }
);

WatchlistQuickAdd.displayName = "WatchlistQuickAdd";
