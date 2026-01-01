/**
 * Quick Actions Types
 * Shared types for the quick actions system
 */

export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  onAction: () => void;
  category?: 'navigation' | 'create' | 'symbol';
  keywords?: string[];
}

export interface SymbolItem {
  symbol: string;
  name: string;
  isRecent?: boolean;
  isWatchlist?: boolean;
  isFavorite?: boolean;
}

export interface QuickActionsContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  mode: 'actions' | 'symbol-picker';
  setMode: (mode: 'actions' | 'symbol-picker') => void;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
  symbolAction: 'chart' | 'replay' | 'alert' | 'journal' | null;
  setSymbolAction: (action: 'chart' | 'replay' | 'alert' | 'journal' | null) => void;
}
