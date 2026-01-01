/**
 * Quick Actions Context & Provider
 * Global state for quick actions and command palette
 * Per Global UI Infrastructure spec
 */

import * as React from 'react';
import type { QuickActionsContextValue } from './types';

const QuickActionsContext = React.createContext<QuickActionsContextValue | null>(null);

interface QuickActionsProviderProps {
  children: React.ReactNode;
}

export function QuickActionsProvider({ children }: QuickActionsProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'actions' | 'symbol-picker'>('actions');
  const [selectedSymbol, setSelectedSymbol] = React.useState<string | null>(null);
  const [symbolAction, setSymbolAction] = React.useState<'chart' | 'replay' | 'alert' | 'journal' | null>(null);

  // Handle keyboard shortcut (⌘K / Ctrl+K)
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setMode('actions');
      }

      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset mode when closing
  React.useEffect(() => {
    if (!isOpen) {
      setMode('actions');
      setSelectedSymbol(null);
      setSymbolAction(null);
    }
  }, [isOpen]);

  const open = React.useCallback(() => {
    setIsOpen(true);
    setMode('actions');
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value: QuickActionsContextValue = {
    isOpen,
    open,
    close,
    toggle,
    mode,
    setMode,
    selectedSymbol,
    setSelectedSymbol,
    symbolAction,
    setSymbolAction,
  };

  return (
    <QuickActionsContext.Provider value={value}>
      {children}
    </QuickActionsContext.Provider>
  );
}

export function useQuickActions(): QuickActionsContextValue {
  const context = React.useContext(QuickActionsContext);
  if (!context) {
    throw new Error('useQuickActions must be used within a QuickActionsProvider');
  }
  return context;
}
