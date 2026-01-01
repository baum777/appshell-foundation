/**
 * Pull-to-Refresh Indicator
 * Visual feedback for pull-to-refresh gesture
 * Per Mobiles Gesten-Konzept
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface PullRefreshIndicatorProps {
  pullDistance: number;
  threshold: number;
  isRefreshing: boolean;
  className?: string;
}

export function PullRefreshIndicator({
  pullDistance,
  threshold,
  isRefreshing,
  className,
}: PullRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const isTriggered = pullDistance >= threshold;
  
  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  if (pullDistance <= 0 && !isRefreshing) return null;
  
  return (
    <div 
      className={cn(
        'absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center',
        'w-10 h-10 rounded-full bg-background border border-border shadow-md',
        className
      )}
      style={{
        top: Math.max(pullDistance - 48, -48),
        opacity: isRefreshing ? 1 : progress,
      }}
      aria-live="polite"
      aria-label={isRefreshing ? 'Refreshing' : isTriggered ? 'Release to refresh' : 'Pull to refresh'}
    >
      <RefreshCw 
        className={cn(
          'h-5 w-5 text-muted-foreground',
          isRefreshing && !prefersReducedMotion && 'animate-spin'
        )}
        style={{
          transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
          transition: prefersReducedMotion ? 'none' : undefined,
        }}
      />
    </div>
  );
}
