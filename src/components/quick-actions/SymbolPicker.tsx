/**
 * Symbol Picker Component
 * Shared component for selecting symbols with quick actions
 * Per Global Quick-Actions + Command Palette spec
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Play, 
  Bell, 
  BookOpen, 
  Star, 
  Clock, 
  List,
  ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { makeWatchlist } from '@/stubs/fixtures';
import { useQuickActions } from './QuickActionsContext';
import type { SymbolItem } from './types';

// Local storage key for recent symbols
const RECENTS_KEY = 'sparkfined_recent_symbols_v1';
const MAX_RECENTS = 5;

function getRecentSymbols(): SymbolItem[] {
  try {
    const stored = localStorage.getItem(RECENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSymbol(symbol: SymbolItem) {
  try {
    const recents = getRecentSymbols().filter((s) => s.symbol !== symbol.symbol);
    recents.unshift({ ...symbol, isRecent: true });
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, MAX_RECENTS)));
  } catch {
    // Ignore storage errors
  }
}

interface SymbolPickerProps {
  onSelect?: (symbol: SymbolItem, action: 'chart' | 'replay' | 'alert' | 'journal') => void;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function SymbolPicker({ onSelect, onBack, showBackButton = true, className }: SymbolPickerProps) {
  const navigate = useNavigate();
  const { close, isOffline } = useQuickActions();
  const [search, setSearch] = React.useState('');
  const [expandedSymbol, setExpandedSymbol] = React.useState<string | null>(null);
  
  // Get watchlist and recents
  const watchlist = React.useMemo(() => makeWatchlist(8).map(w => ({ 
    symbol: w.symbol, 
    name: w.name, 
    isWatchlist: true 
  })), []);
  
  const recents = React.useMemo(() => getRecentSymbols(), []);
  
  // Filter symbols based on search
  const filteredSymbols = React.useMemo(() => {
    const allSymbols: SymbolItem[] = [];
    
    // Add recents first
    recents.forEach((s) => {
      if (!allSymbols.find((x) => x.symbol === s.symbol)) {
        allSymbols.push({ ...s, isRecent: true });
      }
    });
    
    // Add watchlist
    watchlist.forEach((s) => {
      if (!allSymbols.find((x) => x.symbol === s.symbol)) {
        allSymbols.push(s);
      } else {
        // Mark as both
        const existing = allSymbols.find((x) => x.symbol === s.symbol);
        if (existing) existing.isWatchlist = true;
      }
    });
    
    if (!search) return allSymbols;
    
    const term = search.toLowerCase();
    return allSymbols.filter(
      (s) =>
        s.symbol.toLowerCase().includes(term) ||
        s.name.toLowerCase().includes(term)
    );
  }, [recents, watchlist, search]);
  
  const handleAction = React.useCallback((symbol: SymbolItem, action: 'chart' | 'replay' | 'alert' | 'journal') => {
    addRecentSymbol(symbol);
    
    if (onSelect) {
      onSelect(symbol, action);
      return;
    }
    
    // Default navigation behavior
    switch (action) {
      case 'chart':
        navigate(`/chart?symbol=${symbol.symbol}`);
        break;
      case 'replay':
        navigate(`/chart?symbol=${symbol.symbol}&mode=replay`);
        break;
      case 'alert':
        navigate(`/alerts?create=true&symbol=${symbol.symbol}`);
        break;
      case 'journal':
        navigate(`/journal?create=true&symbol=${symbol.symbol}`);
        break;
    }
    
    close();
  }, [navigate, close, onSelect]);
  
  const handleSymbolClick = React.useCallback((symbol: SymbolItem) => {
    if (expandedSymbol === symbol.symbol) {
      setExpandedSymbol(null);
    } else {
      setExpandedSymbol(symbol.symbol);
    }
  }, [expandedSymbol]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Search */}
      <div className="p-3 border-b border-border">
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-2 -ml-2 text-muted-foreground"
          >
            ← Back to actions
          </Button>
        )}
        <Input
          placeholder="Search symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
          autoFocus
        />
      </div>
      
      {/* Symbol List */}
      <ScrollArea className="flex-1 max-h-[300px]">
        <div className="p-2">
          {/* Recents section */}
          {recents.length > 0 && !search && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                Recents
              </div>
              {recents.map((symbol) => (
                <SymbolRow
                  key={`recent-${symbol.symbol}`}
                  symbol={symbol}
                  isExpanded={expandedSymbol === symbol.symbol}
                  onClick={() => handleSymbolClick(symbol)}
                  onAction={(action) => handleAction(symbol, action)}
                  isOffline={isOffline}
                />
              ))}
            </div>
          )}
          
          {/* Watchlist section */}
          {watchlist.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
                <List className="h-3 w-3" />
                Watchlist
              </div>
              {filteredSymbols
                .filter((s) => s.isWatchlist && (!search || !s.isRecent))
                .map((symbol) => (
                  <SymbolRow
                    key={`watch-${symbol.symbol}`}
                    symbol={symbol}
                    isExpanded={expandedSymbol === symbol.symbol}
                    onClick={() => handleSymbolClick(symbol)}
                    onAction={(action) => handleAction(symbol, action)}
                    isOffline={isOffline}
                  />
                ))}
            </div>
          )}
          
          {filteredSymbols.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No symbols found
            </p>
          )}
        </div>
      </ScrollArea>
      
      {/* Offline indicator */}
      {isOffline && (
        <div className="p-2 border-t border-border bg-warning/10">
          <p className="text-xs text-warning text-center">
            Offline — Actions will be queued
          </p>
        </div>
      )}
    </div>
  );
}

interface SymbolRowProps {
  symbol: SymbolItem;
  isExpanded: boolean;
  onClick: () => void;
  onAction: (action: 'chart' | 'replay' | 'alert' | 'journal') => void;
  isOffline: boolean;
}

function SymbolRow({ symbol, isExpanded, onClick, onAction, isOffline }: SymbolRowProps) {
  return (
    <div className="mb-1">
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center justify-between px-2 py-2 rounded-md text-left',
          'hover:bg-accent/50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isExpanded && 'bg-accent/30'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{symbol.symbol}</span>
          <span className="text-xs text-muted-foreground">{symbol.name}</span>
          {symbol.isFavorite && <Star className="h-3 w-3 text-warning fill-warning" />}
        </div>
        <ChevronRight className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          isExpanded && 'rotate-90'
        )} />
      </button>
      
      {/* Expanded actions */}
      {isExpanded && (
        <div className="flex gap-1 px-2 py-1.5 bg-muted/30 rounded-md ml-2 mr-2 mb-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onAction('chart')}
          >
            <LineChart className="h-3.5 w-3.5 mr-1" />
            Chart
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onAction('replay')}
          >
            <Play className="h-3.5 w-3.5 mr-1" />
            Replay
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onAction('alert')}
          >
            <Bell className="h-3.5 w-3.5 mr-1" />
            Alert
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onAction('journal')}
          >
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            Journal
          </Button>
        </div>
      )}
    </div>
  );
}
