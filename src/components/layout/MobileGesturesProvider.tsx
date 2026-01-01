/**
 * Mobile Gestures Provider
 * Global initialization of mobile gesture handling
 * Per Mobiles Gesten-Konzept
 */

import * as React from 'react';
import { useEdgeSwipe } from '@/hooks/use-edge-swipe';

interface MobileGesturesProviderProps {
  children: React.ReactNode;
}

export function MobileGesturesProvider({ children }: MobileGesturesProviderProps) {
  // Initialize edge-swipe navigation globally
  useEdgeSwipe({ enabled: true });
  
  return <>{children}</>;
}
