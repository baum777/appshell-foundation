/**
 * Offline Status Badge
 * Global status indicator for connectivity and sync state
 * Per Global UI Infrastructure spec - TASK B
 */

import * as React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOffline } from './OfflineContext';

interface OfflineStatusBadgeProps {
  /** Show compact version (icon only) */
  compact?: boolean;
  /** Additional class names */
  className?: string;
  /** Show last synced time */
  showLastSynced?: boolean;
}

function formatTimeAgo(timestamp: number | null): string {
  if (!timestamp) return '';
  
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function OfflineStatusBadge({ 
  compact = false, 
  className,
  showLastSynced = false,
}: OfflineStatusBadgeProps) {
  const { isOnline, syncState, queuedCount, lastSyncedAt, markQueued, markSynced } = useOffline();
  
  // Force re-render for time updates
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!showLastSynced || !lastSyncedAt) return;
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [showLastSynced, lastSyncedAt]);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {/* Connectivity indicator */}
        <div
          className={cn(
            'flex items-center justify-center h-6 w-6 rounded-full',
            isOnline ? 'text-success' : 'text-destructive'
          )}
          title={isOnline ? 'Online' : 'Offline'}
        >
          {isOnline ? (
            <Wifi className="h-3.5 w-3.5" />
          ) : (
            <WifiOff className="h-3.5 w-3.5" />
          )}
        </div>
        
        {/* Sync indicator */}
        {syncState === 'queued' && (
          <div
            className="flex items-center justify-center h-6 w-6 rounded-full text-warning"
            title={`${queuedCount} queued`}
          >
            <CloudOff className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Online/Offline Badge */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
          isOnline
            ? 'bg-success/10 text-success'
            : 'bg-destructive/10 text-destructive'
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        )}
      </div>
      
      {/* Sync Badge */}
      <button
        type="button"
        onClick={() => {
          // UI-only toggle (stub) per spec: allow toggling queued/synced.
          if (syncState === 'synced') {
            markQueued('Manual sync toggle');
          } else {
            markSynced();
          }
        }}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          syncState === 'synced'
            ? 'bg-muted text-muted-foreground hover:bg-muted/80'
            : 'bg-warning/10 text-warning hover:bg-warning/15'
        )}
        aria-label={syncState === 'synced' ? 'Toggle to queued (stub)' : 'Mark all synced (stub)'}
      >
        {syncState === 'synced' ? (
          <>
            <Cloud className="h-3 w-3" />
            <span>Synced</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3" />
            <span>Queued ({queuedCount})</span>
          </>
        )}
      </button>
      
      {/* Last synced time */}
      {showLastSynced && (
        <span className="text-xs text-muted-foreground min-w-[100px] text-right">
          {lastSyncedAt ? `Updated ${formatTimeAgo(lastSyncedAt)}` : 'Updated —'}
        </span>
      )}
    </div>
  );
}
