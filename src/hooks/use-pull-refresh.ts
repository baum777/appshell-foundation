/**
 * Pull-to-Refresh Hook
 * For list views with refresh semantics
 * Per Mobiles Gesten-Konzept
 */

import { useCallback, useRef, useState, useEffect } from 'react';

const PULL_THRESHOLD = 80; // px needed to trigger refresh
const MAX_PULL = 120; // max pull distance
const RESISTANCE = 2.5; // resistance factor

interface UsePullRefreshOptions {
  onRefresh: () => Promise<void>;
  enabled?: boolean;
}

interface UsePullRefreshReturn {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  indicatorStyle: React.CSSProperties;
}

export function usePullRefresh(options: UsePullRefreshOptions): UsePullRefreshReturn {
  const { onRefresh, enabled = true } = options;
  
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  
  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Only trigger if scrolled to top
    if (container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [enabled, isRefreshing]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY.current === null || !isPulling) return;
    
    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;
    
    // Only pull down
    if (delta <= 0) {
      setPullDistance(0);
      return;
    }
    
    // Apply resistance
    const distance = Math.min(delta / RESISTANCE, MAX_PULL);
    setPullDistance(distance);
    
    // Prevent default scroll when pulling
    if (distance > 0) {
      e.preventDefault();
    }
  }, [isPulling]);
  
  const handleTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    
    setIsPulling(false);
    
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    startY.current = null;
    currentY.current = null;
    setPullDistance(0);
  }, [pullDistance, isRefreshing, onRefresh]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  const indicatorStyle: React.CSSProperties = {
    transform: `translateY(${pullDistance}px)`,
    transition: isPulling || prefersReducedMotion ? 'none' : 'transform 0.2s ease-out',
    opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
  };
  
  return {
    pullDistance,
    isRefreshing,
    isPulling,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    indicatorStyle,
  };
}
