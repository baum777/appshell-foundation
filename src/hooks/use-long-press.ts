/**
 * Long-Press Hook
 * Touch substitute for hover interactions
 * Per Mobiles Gesten-Konzept
 */

import { useCallback, useRef, useState } from 'react';

const LONG_PRESS_DURATION = 500; // ms

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  duration?: number;
  disabled?: boolean;
}

interface UseLongPressReturn {
  isPressed: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
  };
}

export function useLongPress(options: UseLongPressOptions): UseLongPressReturn {
  const { 
    onLongPress, 
    onClick, 
    duration = LONG_PRESS_DURATION, 
    disabled = false 
  } = options;
  
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPressed(false);
  }, []);
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    
    didLongPress.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsPressed(true);
    
    // Use pointer capture for reliable tracking
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    
    timeoutRef.current = setTimeout(() => {
      didLongPress.current = true;
      setIsPressed(false);
      onLongPress();
    }, duration);
  }, [disabled, duration, onLongPress]);
  
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    
    clear();
    
    // Release pointer capture
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    
    // If didn't long press, treat as click
    if (!didLongPress.current && onClick) {
      onClick();
    }
  }, [disabled, clear, onClick]);
  
  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    clear();
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  }, [clear]);
  
  const handlePointerLeave = useCallback(() => {
    clear();
  }, [clear]);
  
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent native context menu on long press
    if (didLongPress.current) {
      e.preventDefault();
    }
  }, []);
  
  return {
    isPressed,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave,
      onContextMenu: handleContextMenu,
    },
  };
}
