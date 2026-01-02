/**
 * Offline Status Context & Provider
 * Global state for offline-first behavior with sync status
 * Per Global UI Infrastructure spec - TASK B
 */

import * as React from 'react';
import { toast } from 'sonner';

// Local storage key for sync stub
const SYNC_STORAGE_KEY = 'sparkfined_sync_stub_v1';

type SyncState = 'synced' | 'queued';

interface QueuedItem {
  id: string;
  reason?: string;
  timestamp: number;
}

interface OfflineContextValue {
  /** Current online/offline status */
  isOnline: boolean;
  /** Current sync state */
  syncState: SyncState;
  /** Number of queued items */
  queuedCount: number;
  /** Mark an action as queued (offline) */
  markQueued: (reason?: string) => string;
  /** Mark an item as synced */
  markSynced: (itemId?: string) => void;
  /** Clear all queued items */
  clearQueue: () => void;
  /** Last synced timestamp (stub) */
  lastSyncedAt: number | null;
}

const OfflineContext = React.createContext<OfflineContextValue | null>(null);

interface OfflineProviderProps {
  children: React.ReactNode;
}

function loadQueuedItems(): QueuedItem[] {
  try {
    const stored = localStorage.getItem(SYNC_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQueuedItems(items: QueuedItem[]) {
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queuedItems, setQueuedItems] = React.useState<QueuedItem[]>(loadQueuedItems);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<number | null>(null);
  const prevOnlineRef = React.useRef(isOnline);

import { syncService } from '@/services/sync/sync.service';

// ... (existing imports)

export function OfflineProvider({ children }: OfflineProviderProps) {
  // ... (existing state)

  // Online/offline event listeners
  React.useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      // Trigger sync when back online
      syncService.processQueue();
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
       syncService.processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ... (rest of component)
}

  // Toast notifications on connectivity change
  React.useEffect(() => {
    if (prevOnlineRef.current !== isOnline) {
      if (isOnline) {
        toast.success('Back online', {
          description: queuedItems.length > 0 
            ? `${queuedItems.length} item(s) ready to sync`
            : undefined,
          duration: 3000,
        });
      } else {
        toast.warning('You are offline', {
          description: 'Actions will be queued',
          duration: 4000,
        });
      }
      prevOnlineRef.current = isOnline;
    }
  }, [isOnline, queuedItems.length]);

  // Persist queued items
  React.useEffect(() => {
    saveQueuedItems(queuedItems);
  }, [queuedItems]);

  const syncState: SyncState = queuedItems.length > 0 ? 'queued' : 'synced';

  const markQueued = React.useCallback((reason?: string): string => {
    const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const item: QueuedItem = {
      id,
      reason,
      timestamp: Date.now(),
    };
    
    setQueuedItems((prev) => [...prev, item]);
    
    toast.info('Queued (offline)', {
      description: reason || 'Will sync when online',
      duration: 3000,
    });
    
    return id;
  }, []);

  const markSynced = React.useCallback((itemId?: string) => {
    if (itemId) {
      setQueuedItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      // Clear all if no specific ID
      setQueuedItems([]);
    }
    
    setLastSyncedAt(Date.now());
    
    toast.success('Synced', {
      duration: 2000,
    });
  }, []);

  const clearQueue = React.useCallback(() => {
    setQueuedItems([]);
    setLastSyncedAt(Date.now());
  }, []);

  const value: OfflineContextValue = {
    isOnline,
    syncState,
    queuedCount: queuedItems.length,
    markQueued,
    markSynced,
    clearQueue,
    lastSyncedAt,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline(): OfflineContextValue {
  const context = React.useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
