import { cn } from "@/lib/utils";

export type OracleFilter = "all" | "new" | "read";

interface OracleFiltersProps {
  filter: OracleFilter;
  onFilterChange: (filter: OracleFilter) => void;
  counts: {
    all: number;
    new: number;
    read: number;
  };
}

export function OracleFilters({
  filter,
  onFilterChange,
  counts,
}: OracleFiltersProps) {
  const filters: { value: OracleFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "new", label: "New", count: counts.new },
    { value: "read", label: "Read", count: counts.read },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            filter === f.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {f.label}
          <span
            className={cn(
              "text-xs",
              filter === f.value
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            )}
          >
            ({f.count})
          </span>
        </button>
      ))}
    </div>
  );
}
