/**
 * Offline Status Context & Provider
 * Global state for offline-first behavior with sync status
 * Per Global UI Infrastructure spec - TASK B
 */

import * as React from 'react';
import { toast } from 'sonner';

type SyncState = 'synced' | 'queued';

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

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastSyncedAt, setLastSyncedAt] = React.useState<number | null>(null);
  const prevOnlineRef = React.useRef(isOnline);

  // Online/offline event listeners
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toast notifications on connectivity change
  React.useEffect(() => {
    if (prevOnlineRef.current !== isOnline) {
      if (isOnline) {
        toast.success('Back online', {
          duration: 3000,
        });
      } else {
        toast.warning('You are offline', {
          description: 'Read-only mode: write actions are disabled',
          duration: 4000,
        });
      }
      prevOnlineRef.current = isOnline;
    }
  }, [isOnline]);

  // Offline v1: read-only. No write queue.
  const syncState: SyncState = 'synced';
  const queuedCount = 0;

  const markQueued = React.useCallback((reason?: string): string => {
    const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    toast.warning('Offline: action disabled', {
      description: reason || 'This action is disabled while offline',
      duration: 3000,
    });
    return id;
  }, []);

  const markSynced = React.useCallback((itemId?: string) => {
    setLastSyncedAt(Date.now());
  }, []);

  const clearQueue = React.useCallback(() => {
    setLastSyncedAt(Date.now());
  }, []);

  const value: OfflineContextValue = {
    isOnline,
    syncState,
    queuedCount,
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
