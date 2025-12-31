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
  type JournalView,
  type CreateEntryPayload,
} from "@/components/journal";
import type { JournalEntryStub } from "@/stubs/contracts";

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

  // Wallet guard state (stub)
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // View state
  const [activeView, setActiveView] = useState<JournalView>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [confirmModalEntry, setConfirmModalEntry] = useState<JournalEntryStub | null>(null);
  const [archiveDialogEntry, setArchiveDialogEntry] = useState<JournalEntryStub | null>(null);
  const [deleteDialogEntry, setDeleteDialogEntry] = useState<JournalEntryStub | null>(null);

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
    toast.success("Entry confirmed");

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
    toast.success("Entry archived");

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
          <JournalHeader entries={entries} onLogEntry={handleOpenCreateDialog} />

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
              ) : filteredEntries.length === 0 ? (
                <JournalEmptyState 
                  type="segment" 
                  segmentName={activeView} 
                  onLogEntry={handleOpenCreateDialog}
                />
              ) : (
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
      </WalletGuard>
    </PageContainer>
  );
}
