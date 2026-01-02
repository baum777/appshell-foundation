import { useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ErrorBanner } from "@/components/layout/PageStates";
import {
  LearnHeader,
  UnlockCallout,
  LearnFilters,
  LessonCard,
  LockedLessonDialog,
  LearnEmptyState,
  LearnSkeleton,
  type SortOption,
} from "@/components/learn";
import { useLearnStub } from "@/stubs/hooks";
import type { LessonStub } from "@/stubs/contracts";

export default function Lessons() {
  const { pageState, lessons } = useLearnStub();

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Locked lesson dialog
  const [lockedDialogOpen, setLockedDialogOpen] = useState(false);
  const [selectedLockedLesson, setSelectedLockedLesson] = useState<LessonStub | null>(null);

  // Derived data
  const categories = useMemo(() => {
    const cats = new Set(lessons.map((l) => l.category));
    return Array.from(cats).sort();
  }, [lessons]);

  const unlockedCount = lessons.filter((l) => !l.locked).length;
  const lockedCount = lessons.filter((l) => l.locked).length;

  const hasActiveFilters = selectedCategories.length > 0 || sortBy !== "newest" || searchQuery.trim() !== "";

  // Filter and sort lessons
  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((l) => selectedCategories.includes(l.category));
    }

    // Apply sort
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
    switch (sortBy) {
      case "difficulty_asc":
        result.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case "difficulty_desc":
        result.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
        break;
      case "newest":
      default:
        // Keep original order (newest)
        break;
    }

    return result;
  }, [lessons, selectedCategories, sortBy, searchQuery]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSortBy("newest");
    setSearchQuery("");
  };

  const handleLockedClick = (lesson: LessonStub) => {
    setSelectedLockedLesson(lesson);
    setLockedDialogOpen(true);
  };

  // Loading state
  if (pageState.state === "loading") {
    return (
      <PageContainer testId="page-learn">
        <LearnSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (pageState.state === "error") {
    return (
      <PageContainer testId="page-learn">
        <div className="space-y-6">
          <LearnHeader unlockedCount={0} totalCount={0} />
          <ErrorBanner
            message="Failed to load lessons"
            onRetry={() => {
              pageState.setState("loading");
              setTimeout(() => pageState.setState("ready"), 1000);
            }}
          />
        </div>
      </PageContainer>
    );
  }

  // Empty state (no lessons at all)
  if (pageState.state === "empty" || lessons.length === 0) {
    return (
      <PageContainer testId="page-learn">
        <div className="space-y-6">
          <LearnHeader unlockedCount={0} totalCount={0} />
          <LearnEmptyState
            type="no-lessons"
            onAction={() => {
              pageState.setState("loading");
              setTimeout(() => pageState.setState("ready"), 1000);
            }}
          />
        </div>
      </PageContainer>
    );
  }

  // Ready state
  return (
    <PageContainer testId="page-learn">
      <div className="space-y-6">
        <LearnHeader unlockedCount={unlockedCount} totalCount={lessons.length} />

        <UnlockCallout lockedCount={lockedCount} />

        <LearnFilters
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={handleReset}
          hasActiveFilters={hasActiveFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filteredLessons.length === 0 ? (
          <LearnEmptyState type="no-results" onAction={handleReset} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onLockedClick={handleLockedClick}
              />
            ))}
          </div>
        )}

        <LockedLessonDialog
          open={lockedDialogOpen}
          onOpenChange={setLockedDialogOpen}
          lesson={selectedLockedLesson}
        />
      </div>
    </PageContainer>
  );
}
