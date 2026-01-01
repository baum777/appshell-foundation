/**
 * Edge-Swipe Navigation Hook
 * Global app-wide navigation via edge swipes
 * Per Mobiles Gesten-Konzept
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Routes where edge-swipe is disabled (canvas-intensive screens)
const GATED_ROUTES = ['/chart', '/replay'];

// Edge detection zone width (px)
const EDGE_ZONE = 50;

// Gesture thresholds
const HORIZONTAL_THRESHOLD = 100; // Minimum horizontal distance
const VERTICAL_TOLERANCE = 30; // Maximum vertical deviation
const TIME_LIMIT = 500; // Maximum gesture duration (ms)

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isEdgeSwipe: boolean;
  edge: 'left' | 'right' | null;
}

interface UseEdgeSwipeOptions {
  enabled?: boolean;
}

export function useEdgeSwipe(options: UseEdgeSwipeOptions = {}) {
  const { enabled = true } = options;
  const navigate = useNavigate();
  const location = useLocation();
  const touchState = useRef<TouchState | null>(null);
  
  // Check if current route allows edge swipe
  const isRouteGated = GATED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );
  
  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  const isActive = enabled && !isRouteGated && !prefersReducedMotion;
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isActive) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const x = touch.clientX;
    const screenWidth = window.innerWidth;
    
    // Check if touch started in edge zone
    const isLeftEdge = x <= EDGE_ZONE;
    const isRightEdge = x >= screenWidth - EDGE_ZONE;
    
    if (!isLeftEdge && !isRightEdge) return;
    
    touchState.current = {
      startX: x,
      startY: touch.clientY,
      startTime: Date.now(),
      isEdgeSwipe: true,
      edge: isLeftEdge ? 'left' : 'right',
    };
  }, [isActive]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchState.current?.isEdgeSwipe) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const deltaY = Math.abs(touch.clientY - touchState.current.startY);
    
    // Cancel if vertical movement exceeds tolerance
    if (deltaY > VERTICAL_TOLERANCE) {
      touchState.current.isEdgeSwipe = false;
    }
  }, []);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchState.current?.isEdgeSwipe) {
      touchState.current = null;
      return;
    }
    
    const touch = e.changedTouches[0];
    if (!touch) {
      touchState.current = null;
      return;
    }
    
    const { startX, startY, startTime, edge } = touchState.current;
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - startX;
    const deltaY = Math.abs(endY - startY);
    const duration = endTime - startTime;
    
    // Validate gesture
    const isValidHorizontal = Math.abs(deltaX) >= HORIZONTAL_THRESHOLD;
    const isValidVertical = deltaY <= VERTICAL_TOLERANCE;
    const isValidTime = duration < TIME_LIMIT;
    
    if (isValidHorizontal && isValidVertical && isValidTime) {
      // Left edge, swiped right → go back
      if (edge === 'left' && deltaX > 0) {
        navigate(-1);
      }
      // Right edge, swiped left → go forward
      else if (edge === 'right' && deltaX < 0) {
        navigate(1);
      }
    }
    
    touchState.current = null;
  }, [navigate]);
  
  useEffect(() => {
    if (!isActive) return;
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive, handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return { isActive, isRouteGated };
}
