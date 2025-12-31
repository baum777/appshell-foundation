import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "newest" | "difficulty_asc" | "difficulty_desc";

interface LearnFiltersProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function LearnFilters({
  categories,
  selectedCategories,
  onCategoryToggle,
  sortBy,
  onSortChange,
  onReset,
  hasActiveFilters,
}: LearnFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Category chips */}
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <button
              key={category}
              onClick={() => onCategoryToggle(category)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category}
              {isSelected && <X className="ml-1.5 h-3 w-3" />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Sort dropdown */}
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="difficulty_asc">Easiest first</SelectItem>
            <SelectItem value="difficulty_desc">Hardest first</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset filters
          </Button>
        )}
      </div>
    </div>
  );
}
