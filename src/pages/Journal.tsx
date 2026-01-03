import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { useJournalStub, type ConfirmPayload } from "@/stubs/hooks";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import {
  WalletGuard,
  JournalHeader,
  JournalSegmentedControl,
  JournalSearchBar,
  JournalEntryRow,
  JournalConfirmModal,
  JournalCreateDialog,
  JournalArchiveDialog,
  JournalDeleteDialog,
  JournalEmptyState,
  JournalSkeleton,
  
  JournalDiaryView,
  JournalPendingBanner,
  JournalReviewOverlay,
  type JournalView,
  type JournalViewMode,
  type CreateEntryPayload,
} from "@/components/journal";
import type { JournalEntryStub } from "@/stubs/contracts";

// localStorage key for view mode persistence
const VIEW_MODE_KEY = "journalViewMode";

export default function Journal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    pageState,
    entries,
    setEntries,
    confirmEntry,
    archiveEntry,
    deleteEntry,
    restoreEntry,
  } = useJournalStub();

  // Wallet guard state (stub) - default to true for demo
  const [isWalletConnected, setIsWalletConnected] = useState(true);

  // View state
  const [activeView, setActiveView] = useState<JournalView>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  
  // View mode (List/Diary) with localStorage persistence
  const [viewMode, setViewMode] = useState<JournalViewMode>(() => {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    return (stored === "diary" || stored === "list") ? stored : "list";
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [confirmModalEntry, setConfirmModalEntry] = useState<JournalEntryStub | null>(null);
  const [archiveDialogEntry, setArchiveDialogEntry] = useState<JournalEntryStub | null>(null);
  const [deleteDialogEntry, setDeleteDialogEntry] = useState<JournalEntryStub | null>(null);

  // Review overlay state
  const [isReviewOverlayOpen, setIsReviewOverlayOpen] = useState(false);
  const [reviewInitialIndex, setReviewInitialIndex] = useState(0);

  // Highlight state
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);
  const [entryNotFound, setEntryNotFound] = useState<string | null>(null);
  const entryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const urlProcessedRef = useRef(false);

  // Counts for segments
  const counts = useMemo(() => ({
    pending: entries.filter((e) => e.status === "pending").length,
    confirmed: entries.filter((e) => e.status === "confirmed").length,
    archived: entries.filter((e) => e.status === "archived").length,
  }), [entries]);

  // All pending entries (for review overlay and banner)
  const pendingEntries = useMemo(() => 
    entries.filter((e) => e.status === "pending")
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [entries]
  );

  // Filter entries by view and search
  const filteredEntries = useMemo(() => {
    let result = entries.filter((e) => e.status === activeView);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.summary.toLowerCase().includes(query) ||
          e.id.toLowerCase().includes(query)
      );
    }

    // Sort pending entries by "expiring first" (UI-only: by timestamp)
    if (activeView === "pending") {
      result = [...result].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    return result;
  }, [entries, activeView, searchQuery]);

  // Entries for diary view (show pending+confirmed in those segments, archived only when viewing archived)
  const diaryEntries = useMemo(() => {
    if (activeView === "archived") {
      return entries.filter((e) => e.status === "archived");
    }
    // For pending/confirmed segments, show both pending and confirmed
    return entries.filter((e) => e.status === "pending" || e.status === "confirmed");
  }, [entries, activeView]);

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Handle URL ?view= sync on initial load
  useEffect(() => {
    const viewParam = searchParams.get("view") as JournalView | null;
    if (viewParam && ["pending", "confirmed", "archived"].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, []);

  // Update URL when view changes
  const handleViewChange = useCallback((view: JournalView) => {
    setActiveView(view);
    const entryParam = searchParams.get("entry");
    const newParams = new URLSearchParams();
    newParams.set("view", view);
    if (entryParam) newParams.set("entry", entryParam);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Handle URL ?entry=<id> scroll + highlight
  useEffect(() => {
    if (urlProcessedRef.current) return;

    const entryId = searchParams.get("entry");
    if (!entryId) return;

    // Find the entry
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) {
      setEntryNotFound(entryId);
      return;
    }

    urlProcessedRef.current = true;
    setEntryNotFound(null);

    // Switch to correct segment if needed
    if (entry.status !== activeView) {
      setActiveView(entry.status);
      const newParams = new URLSearchParams(searchParams);
      newParams.set("view", entry.status);
      setSearchParams(newParams, { replace: true });
    }

    // Set highlight and scroll after a brief delay to allow render
    setTimeout(() => {
      setHighlightedEntryId(entryId);
      const ref = entryRefs.current.get(entryId);
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Remove highlight after 1.5 seconds
      setTimeout(() => {
        setHighlightedEntryId(null);
      }, 1500);
    }, 100);
  }, [entries, searchParams, activeView, setSearchParams]);

  // Handle row click - update URL with entry param
  const handleRowClick = useCallback((id: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("entry", id);
    setSearchParams(newParams, { replace: true });

    // Highlight the clicked entry
    setHighlightedEntryId(id);
    setTimeout(() => {
      setHighlightedEntryId(null);
    }, 1500);
  }, [searchParams, setSearchParams]);

  // Clear entry not found
  const handleClearEntryNotFound = useCallback(() => {
    setEntryNotFound(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("entry");
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Handle create entry
  const handleCreateEntry = useCallback((payload: CreateEntryPayload) => {
    const newEntry: JournalEntryStub = {
      id: `entry-${Date.now()}`,
      side: payload.side === "neutral" ? "BUY" : payload.side,
      status: "pending",
      timestamp: new Date().toISOString(),
      summary: payload.summary,
    };
    setEntries((prev) => [newEntry, ...prev]);
    toast.success("Entry logged");
    // BACKEND_TODO: persist entry + auto-capture + AI enrich
  }, [setEntries]);

  // Handlers
  const handleConfirm = (id: string, payload: ConfirmPayload) => {
    confirmEntry(id, payload);
    toast.success("Confirmed");

    // Clear selection if confirming the selected entry
    const entryParam = searchParams.get("entry");
    if (entryParam === id) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("entry");
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleArchive = (id: string, reason: string) => {
    archiveEntry(id, reason);
    toast.success("Archived", {
      action: {
        label: "Undo",
        onClick: () => handleRestore(id),
      },
    });

    // Clear selection if archiving the selected entry
    const entryParam = searchParams.get("entry");
    if (entryParam === id) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("entry");
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast.success("Entry deleted");

    // Clear selection if deleting the selected entry
    const entryParam = searchParams.get("entry");
    if (entryParam === id) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("entry");
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleRestore = (id: string) => {
    restoreEntry(id);
    toast.success("Entry restored");
  };

  const handleRetry = () => {
    pageState.setState("loading");
    setTimeout(() => pageState.setState("ready"), 1000);
  };

  const handleDemoMode = () => {
    toast.info("Demo mode activated");
  };

  // Set ref for entry row
  const setEntryRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      entryRefs.current.set(id, el);
    } else {
      entryRefs.current.delete(id);
    }
  }, []);

  const handleOpenCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  // Review overlay handlers
  const handleOpenReviewOverlay = useCallback((index: number = 0) => {
    setReviewInitialIndex(index);
    setIsReviewOverlayOpen(true);
  }, []);

  const handleReviewConfirm = useCallback((id: string) => {
    confirmEntry(id, { mood: "", note: "", tags: [] });
    toast.success("Confirmed");
  }, [confirmEntry]);

  const handleReviewArchive = useCallback((id: string) => {
    archiveEntry(id, "");
    toast.success("Archived", {
      action: {
        label: "Undo",
        onClick: () => handleRestore(id),
      },
    });
  }, [archiveEntry]);

  const handleReviewEdit = useCallback((entry: JournalEntryStub) => {
    setIsReviewOverlayOpen(false);
    setConfirmModalEntry(entry);
  }, []);

  // Diary card click handler
  const handleDiaryCardClick = useCallback((entry: JournalEntryStub, index: number) => {
    if (entry.status === "pending") {
      // Find index in pending entries
      const pendingIndex = pendingEntries.findIndex((e) => e.id === entry.id);
      if (pendingIndex !== -1) {
        handleOpenReviewOverlay(pendingIndex);
      }
    } else {
      // For non-pending entries, just highlight
      handleRowClick(entry.id);
    }
  }, [pendingEntries, handleOpenReviewOverlay, handleRowClick]);

  // Loading state
  if (pageState.isLoading) {
    return (
      <PageContainer testId="page-journal">
        <JournalSkeleton />
      </PageContainer>
    );
  }

  // Error state
  if (pageState.isError) {
    return (
      <PageContainer testId="page-journal">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Journal
            </h1>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load journal entries. Please try again.</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  // Empty state (no entries at all)
  const isCompletelyEmpty = entries.length === 0;

  // Determine if search returned no results
  const isSearchEmpty = searchQuery.trim() && filteredEntries.length === 0;

  return (
    <PageContainer testId="page-journal">
      <WalletGuard isConnected={isWalletConnected} onDemoMode={handleDemoMode}>
        <div className="space-y-6">
          <JournalHeader 
            entries={entries} 
            onLogEntry={handleOpenCreateDialog} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Entry not found alert */}
          {entryNotFound && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Entry "{entryNotFound}" not found in journal.</span>
                <Button variant="outline" size="sm" onClick={handleClearEntryNotFound}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Pending review banner */}
          {pendingEntries.length > 0 && (
            <JournalPendingBanner
              pendingCount={pendingEntries.length}
              onReviewNow={() => handleOpenReviewOverlay(0)}
            />
          )}

          {isCompletelyEmpty ? (
            <JournalEmptyState type="all" onLogEntry={handleOpenCreateDialog} />
          ) : (
            <>
              <JournalSegmentedControl
                value={activeView}
                onChange={handleViewChange}
                counts={counts}
              />

              <JournalSearchBar value={searchQuery} onChange={setSearchQuery} />

              {isSearchEmpty ? (
                <JournalEmptyState 
                  type="search" 
                  onClearSearch={() => setSearchQuery("")} 
                />
              ) : filteredEntries.length === 0 && viewMode === "list" ? (
                <JournalEmptyState 
                  type="segment" 
                  segmentName={activeView} 
                  onLogEntry={handleOpenCreateDialog}
                />
              ) : viewMode === "diary" ? (
                // Diary view
                diaryEntries.length === 0 ? (
                  <JournalEmptyState 
                    type="segment" 
                    segmentName={activeView} 
                    onLogEntry={handleOpenCreateDialog}
                  />
                ) : (
                  <JournalDiaryView
                    entries={diaryEntries}
                    activeSegment={activeView}
                    onCardClick={handleDiaryCardClick}
                  />
                )
              ) : (
                // List view (existing behavior)
                <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <JournalEntryRow
                      key={entry.id}
                      ref={(el) => setEntryRef(entry.id, el)}
                      entry={entry}
                      isHighlighted={entry.id === highlightedEntryId}
                      onRowClick={handleRowClick}
                      onConfirm={
                        entry.status === "pending"
                          ? () => setConfirmModalEntry(entry)
                          : undefined
                      }
                      onArchive={
                        entry.status === "pending" || entry.status === "confirmed"
                          ? () => setArchiveDialogEntry(entry)
                          : undefined
                      }
                      onDelete={() => setDeleteDialogEntry(entry)}
                      onRestore={
                        entry.status === "archived"
                          ? () => handleRestore(entry.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Dialogs */}
        <JournalCreateDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleCreateEntry}
        />

        <JournalConfirmModal
          entry={confirmModalEntry}
          isOpen={!!confirmModalEntry}
          onClose={() => setConfirmModalEntry(null)}
          onConfirm={handleConfirm}
        />

        <JournalArchiveDialog
          entry={archiveDialogEntry}
          isOpen={!!archiveDialogEntry}
          onClose={() => setArchiveDialogEntry(null)}
          onArchive={handleArchive}
        />

        <JournalDeleteDialog
          entry={deleteDialogEntry}
          isOpen={!!deleteDialogEntry}
          onClose={() => setDeleteDialogEntry(null)}
          onDelete={handleDelete}
        />

        {/* Review Overlay */}
        <JournalReviewOverlay
          isOpen={isReviewOverlayOpen}
          onClose={() => setIsReviewOverlayOpen(false)}
          pendingEntries={pendingEntries}
          initialIndex={reviewInitialIndex}
          onConfirm={handleReviewConfirm}
          onArchive={handleReviewArchive}
          onEdit={handleReviewEdit}
        />
      </WalletGuard>
    </PageContainer>
  );
}
