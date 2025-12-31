import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export interface WatchlistQuickAddRef {
  focus: () => void;
}

interface WatchlistQuickAddProps {
  onAdd: (symbol: string) => boolean;
}

export const WatchlistQuickAdd = forwardRef<WatchlistQuickAddRef, WatchlistQuickAddProps>(
  ({ onAdd }, ref) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmed = value.trim();
      if (!trimmed) {
        setError("Please enter a symbol");
        return;
      }

      // Validate: letters and numbers only
      if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
        setError("Only letters and numbers allowed");
        return;
      }

      const success = onAdd(trimmed);
      if (!success) {
        setError("Symbol already in watchlist");
        return;
      }

      setValue("");
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Add symbol (e.g. BTC)"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase());
              setError(null);
            }}
            className="max-w-xs"
          />
          <Button type="submit" size="sm">
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
