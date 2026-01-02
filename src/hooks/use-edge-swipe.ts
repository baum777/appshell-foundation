/**
 * Edge-Swipe Navigation Hook
 * Global app-wide navigation via edge swipes
 * Per Mobiles Gesten-Konzept
 * 
 * Spec:
 * - Active only within edgePx zone (left + right)
 * - Thresholds: horizontal >= thresholdPx, vertical <= verticalTolerancePx, duration < maxDurationMs
 * - left-edge swipe right => navigate(-1)
 * - right-edge swipe left => navigate(+1)
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Routes where edge-swipe is disabled (canvas-intensive screens)
const GATED_ROUTES = ['/chart', '/replay'];

// Routes where edge-swipe is explicitly allowed (optional allowlist)
const ALLOWED_ROUTES = [
  '/',
  '/dashboard',
  '/watchlist',
  '/alerts',
  '/oracle',
  '/journal',
  '/learn',
  '/handbook',
  '/settings',
];

interface PointerState {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  isEdgeSwipe: boolean;
  edge: 'left' | 'right' | null;
}

export interface UseEdgeSwipeOptions {
  /** Enable/disable the hook */
  enabled?: boolean;
  /** Edge zone width in pixels */
  edgePx?: number;
  /** Minimum horizontal distance to trigger navigation */
  thresholdPx?: number;
  /** Maximum vertical deviation allowed */
  verticalTolerancePx?: number;
  /** Maximum gesture duration in ms */
  maxDurationMs?: number;
  /** Custom callback for back navigation */
  onNavigateBack?: () => void;
  /** Custom callback for forward navigation */
  onNavigateForward?: () => void;
}

/**
 * Check if an element is a text input that should block gestures
 */
function isTextInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  
  const tagName = activeElement.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true;
  }
  
  if ((activeElement as HTMLElement).isContentEditable) {
    return true;
  }
  
  return false;
}

/**
 * Check if a dialog/sheet/popover is currently open
 * Checks for Radix UI data attributes and common modal patterns
 */
function isOverlayOpen(): boolean {
  // Check for Radix dialog/sheet/popover
  const hasRadixOverlay = document.querySelector(
    '[data-state="open"][role="dialog"], ' +
    '[data-state="open"][role="alertdialog"], ' +
    '[data-state="open"][data-radix-popper-content-wrapper], ' +
    '[data-vaul-drawer][data-state="open"]'
  );
  
  if (hasRadixOverlay) return true;
  
  // Check for body data attribute (custom overlay tracking)
  if (document.body.hasAttribute('data-overlay-open')) {
    return true;
  }
  
  // Check for common modal backdrop classes
  const hasModalBackdrop = document.querySelector(
    '.fixed.inset-0[data-state="open"], ' +
    '[class*="DialogOverlay"], ' +
    '[class*="SheetOverlay"]'
  );
  
  return !!hasModalBackdrop;
}

/**
 * Check if the route is gated (canvas-intensive)
 */
function isRouteGated(pathname: string): boolean {
  return GATED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if the route is explicitly allowed
 */
function isRouteAllowed(pathname: string): boolean {
  // If route is gated, it's never allowed
  if (isRouteGated(pathname)) return false;
  
  // Check allowlist - match exact or prefix
  return ALLOWED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

export function useEdgeSwipe(options: UseEdgeSwipeOptions = {}) {
  const {
    enabled = true,
    edgePx = 50,
    thresholdPx = 100,
    verticalTolerancePx = 30,
    maxDurationMs = 500,
    onNavigateBack,
    onNavigateForward,
  } = options;
  
  const navigate = useNavigate();
  const location = useLocation();
  const pointerState = useRef<PointerState | null>(null);
  
  // Check route gating
  const routeGated = isRouteGated(location.pathname);
  const routeAllowed = isRouteAllowed(location.pathname);
  
  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // Final active state
  const isActive = enabled && !routeGated && routeAllowed && !prefersReducedMotion;
  
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (!isActive) return;
    
    // Only handle primary pointer (ignore multi-touch)
    if (!e.isPrimary) return;
    
    // Ignore if text input is focused
    if (isTextInputFocused()) return;
    
    // Ignore if overlay is open
    if (isOverlayOpen()) return;
    
    const x = e.clientX;
    const screenWidth = window.innerWidth;
    
    // Check if pointer started in edge zone
    const isLeftEdge = x <= edgePx;
    const isRightEdge = x >= screenWidth - edgePx;
    
    if (!isLeftEdge && !isRightEdge) return;
    
    pointerState.current = {
      pointerId: e.pointerId,
      startX: x,
      startY: e.clientY,
      startTime: Date.now(),
      isEdgeSwipe: true,
      edge: isLeftEdge ? 'left' : 'right',
    };
  }, [isActive, edgePx]);
  
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!pointerState.current?.isEdgeSwipe) return;
    
    // Only track the same pointer
    if (e.pointerId !== pointerState.current.pointerId) return;
    
    const deltaY = Math.abs(e.clientY - pointerState.current.startY);
    
    // Cancel if vertical movement exceeds tolerance
    if (deltaY > verticalTolerancePx) {
      pointerState.current.isEdgeSwipe = false;
    }
    
    // Cancel if duration exceeds limit (slow drag)
    const duration = Date.now() - pointerState.current.startTime;
    if (duration >= maxDurationMs) {
      pointerState.current.isEdgeSwipe = false;
    }
  }, [verticalTolerancePx, maxDurationMs]);
  
  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!pointerState.current?.isEdgeSwipe) {
      pointerState.current = null;
      return;
    }
    
    // Only handle the same pointer
    if (e.pointerId !== pointerState.current.pointerId) return;
    
    const { startX, startY, startTime, edge } = pointerState.current;
    const endX = e.clientX;
    const endY = e.clientY;
    const endTime = Date.now();
    
    const deltaX = endX - startX;
    const deltaY = Math.abs(endY - startY);
    const duration = endTime - startTime;
    
    // Validate gesture thresholds
    const isValidHorizontal = Math.abs(deltaX) >= thresholdPx;
    const isValidVertical = deltaY <= verticalTolerancePx;
    const isValidTime = duration < maxDurationMs;
    
    if (isValidHorizontal && isValidVertical && isValidTime) {
      // Left edge, swiped right → go back
      if (edge === 'left' && deltaX > 0) {
        if (onNavigateBack) {
          onNavigateBack();
        } else {
          navigate(-1);
        }
      }
      // Right edge, swiped left → go forward
      else if (edge === 'right' && deltaX < 0) {
        if (onNavigateForward) {
          onNavigateForward();
        } else {
          navigate(1);
        }
      }
    }
    
    pointerState.current = null;
  }, [navigate, thresholdPx, verticalTolerancePx, maxDurationMs, onNavigateBack, onNavigateForward]);
  
  const handlePointerCancel = useCallback(() => {
    pointerState.current = null;
  }, []);
  
  useEffect(() => {
    if (!isActive) return;
    
    // Use pointer events for unified touch/mouse handling
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('pointercancel', handlePointerCancel, { passive: true });
    
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [isActive, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel]);
  
  return { 
    isActive, 
    isRouteGated: routeGated,
    isRouteAllowed: routeAllowed,
  };
}
