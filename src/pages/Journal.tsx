import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { useJournalStub, type ConfirmPayload } from "@/stubs/hooks";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  WalletGuard,
  JournalHeader,
  JournalSegmentedControl,
  JournalSearchBar,
  JournalEntryRow,
  JournalConfirmModal,
  JournalArchiveDialog,
  JournalDeleteDialog,
  JournalEmptyState,
  JournalSkeleton,
  type JournalView,
} from "@/components/journal";
import type { JournalEntryStub } from "@/stubs/contracts";

export default function Journal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    pageState,
    entries,
    confirmEntry,
    archiveEntry,
    deleteEntry,
    restoreEntry,
  } = useJournalStub();

  // Wallet guard state (stub)
  const [isWalletConnected, setIsWalletConnected] = useState(true);

  // View state
  const [activeView, setActiveView] = useState<JournalView>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [confirmModalEntry, setConfirmModalEntry] = useState<JournalEntryStub | null>(null);
  const [archiveDialogEntry, setArchiveDialogEntry] = useState<JournalEntryStub | null>(null);
  const [deleteDialogEntry, setDeleteDialogEntry] = useState<JournalEntryStub | null>(null);

  // Highlight state
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);
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

  // Handle URL ?view= sync
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
    if (!entry) return;

    urlProcessedRef.current = true;

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

      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedEntryId(null);
      }, 3000);
    }, 100);
  }, [entries, searchParams, activeView, setSearchParams]);

  // Handlers
  const handleConfirm = (id: string, payload: ConfirmPayload) => {
    confirmEntry(id, payload);
    toast.success("Entry confirmed");
  };

  const handleArchive = (id: string, reason: string) => {
    archiveEntry(id, reason);
    toast.success("Entry archived");
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast.success("Entry deleted");
  };

  const handleRestore = (id: string) => {
    restoreEntry(id);
    toast.success("Entry restored");
  };

  const handleRetry = () => {
    pageState.setState("loading");
    setTimeout(() => pageState.setState("ready"), 1000);
  };

  const handleWalletConnect = () => {
    // BACKEND_TODO: wallet connect integration
    setIsWalletConnected(true);
    toast.success("Wallet connected");
  };

  // Set ref for entry row
  const setEntryRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      entryRefs.current.set(id, el);
    } else {
      entryRefs.current.delete(id);
    }
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

  return (
    <PageContainer testId="page-journal">
      <WalletGuard isConnected={isWalletConnected} onConnect={handleWalletConnect}>
        <div className="space-y-6">
          <JournalHeader entries={entries} />

          {isCompletelyEmpty ? (
            <JournalEmptyState type="all" />
          ) : (
            <>
              <JournalSegmentedControl
                value={activeView}
                onChange={handleViewChange}
                counts={counts}
              />

              <JournalSearchBar value={searchQuery} onChange={setSearchQuery} />

              {filteredEntries.length === 0 ? (
                <JournalEmptyState type="segment" segmentName={activeView} />
              ) : (
                <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <JournalEntryRow
                      key={entry.id}
                      ref={(el) => setEntryRef(entry.id, el)}
                      entry={entry}
                      isHighlighted={entry.id === highlightedEntryId}
                      onConfirm={
                        entry.status === "pending"
                          ? () => setConfirmModalEntry(entry)
                          : undefined
                      }
                      onArchive={
                        entry.status === "pending"
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
