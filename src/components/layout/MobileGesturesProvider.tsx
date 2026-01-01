/**
 * Mobile Gestures Provider
 * Global initialization of mobile gesture handling
 * Per Mobiles Gesten-Konzept
 * 
 * Wires edge-swipe navigation globally with route gating
 * for canvas-intensive screens (Chart, Replay).
 */

import * as React from 'react';
import { useEdgeSwipe, type UseEdgeSwipeOptions } from '@/hooks/use-edge-swipe';

interface MobileGesturesProviderProps {
  children: React.ReactNode;
  /** Override edge-swipe options */
  edgeSwipeOptions?: Partial<UseEdgeSwipeOptions>;
}

export function MobileGesturesProvider({ 
  children, 
  edgeSwipeOptions 
}: MobileGesturesProviderProps) {
  // Initialize edge-swipe navigation globally with spec-compliant defaults
  const { isActive, isRouteGated } = useEdgeSwipe({
    enabled: true,
    edgePx: 50,
    thresholdPx: 100,
    verticalTolerancePx: 30,
    maxDurationMs: 500,
    ...edgeSwipeOptions,
  });
  
  // Debug info in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[MobileGestures] Edge-swipe active:', isActive, '| Route gated:', isRouteGated);
    }
  }, [isActive, isRouteGated]);
  
  return <>{children}</>;
}
