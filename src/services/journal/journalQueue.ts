// BACKEND_HOOK: Journal offline queue for mutations

export type JournalMutationType = 
  | "confirm"
  | "archive"
  | "restore"
  | "add_note"
  | "create";

export interface JournalQueueItem {
  id: string;
  type: JournalMutationType;
  entryId: string;
  payload?: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
}

const QUEUE_KEY = "journal_mutation_queue_v1";
const SYNC_ERRORS_KEY = "journal_sync_errors_v1";

export function getQueue(): JournalQueueItem[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveQueue(queue: JournalQueueItem[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function addToQueue(item: Omit<JournalQueueItem, "id" | "createdAt" | "retryCount">): JournalQueueItem {
  const queue = getQueue();
  const newItem: JournalQueueItem = {
    ...item,
    id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    retryCount: 0,
  };
  queue.push(newItem);
  saveQueue(queue);
  return newItem;
}

export function removeFromQueue(id: string): void {
  const queue = getQueue();
  saveQueue(queue.filter((item) => item.id !== id));
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export function getSyncErrors(): Set<string> {
  try {
    const stored = localStorage.getItem(SYNC_ERRORS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function addSyncError(entryId: string): void {
  const errors = getSyncErrors();
  errors.add(entryId);
  localStorage.setItem(SYNC_ERRORS_KEY, JSON.stringify(Array.from(errors)));
}

export function removeSyncError(entryId: string): void {
  const errors = getSyncErrors();
  errors.delete(entryId);
  localStorage.setItem(SYNC_ERRORS_KEY, JSON.stringify(Array.from(errors)));
}

export function clearSyncErrors(): void {
  localStorage.removeItem(SYNC_ERRORS_KEY);
}

// Retry dispatcher - no-op safe without backend
export async function processQueue(): Promise<void> {
  const queue = getQueue();
  if (queue.length === 0) return;

  // BACKEND_HOOK: Process each item in queue
  // For now, this is a no-op since we have no backend
  // When backend is ready, implement API calls here
  
  for (const item of queue) {
    try {
      // BACKEND_HOOK: Make API call based on item.type
      // await journalApi[item.type](item.entryId, item.payload);
      
      // On success, remove from queue
      removeFromQueue(item.id);
      removeSyncError(item.entryId);
    } catch (error) {
      // Mark as sync error
      addSyncError(item.entryId);
      
      // Update retry count
      const updatedQueue = getQueue().map((q) =>
        q.id === item.id ? { ...q, retryCount: q.retryCount + 1 } : q
      );
      saveQueue(updatedQueue);
    }
  }
}
