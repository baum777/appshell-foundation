import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function LearnFilters({
  categories,
  selectedCategories,
  onCategoryToggle,
  sortBy,
  onSortChange,
  onReset,
  hasActiveFilters,
  searchQuery,
  onSearchChange,
}: LearnFiltersProps) {
  const isAllSelected = selectedCategories.length === 0;

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search lessons…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search lessons"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={isAllSelected ? "default" : "secondary"}
          size="sm"
          onClick={() => {
            if (!isAllSelected) {
              // Clear all categories to show "All"
              selectedCategories.forEach((cat) => onCategoryToggle(cat));
            }
          }}
          className="rounded-full"
        >
          All
        </Button>
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          return (
            <Button
              key={category}
              variant={isSelected ? "default" : "secondary"}
              size="sm"
              onClick={() => onCategoryToggle(category)}
              className="rounded-full"
            >
              {category}
              {isSelected && <X className="ml-1.5 h-3 w-3" />}
            </Button>
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
