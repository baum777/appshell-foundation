/**
 * Command Palette (Desktop)
 * ⌘K / Ctrl+K dialog with cmdk
 * Per Global UI Infrastructure spec
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Play,
  Bell,
  BookOpen,
  Compass,
  Settings,
  LayoutDashboard,
  Eye,
  GraduationCap,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command';
import { useQuickActions } from './QuickActionsContext';
import { useOffline } from '@/components/offline';
import { SymbolPicker } from './SymbolPicker';

export function CommandPalette() {
  const navigate = useNavigate();
  const { isOpen, close, mode, setMode } = useQuickActions();
  const { isOnline } = useOffline();

  const handleNavigation = React.useCallback((path: string) => {
    navigate(path);
    close();
  }, [navigate, close]);

  const handleSymbolAction = React.useCallback(() => {
    setMode('symbol-picker');
  }, [setMode]);

  // Hide on mobile (use sheet instead)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (isMobile) return null;

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      {mode === 'actions' ? (
        <>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {/* Quick Actions */}
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={handleSymbolAction}>
                <LineChart className="mr-2 h-4 w-4" />
                <span>Open Chart</span>
                <CommandShortcut>→ Pick Symbol</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={handleSymbolAction}>
                <Play className="mr-2 h-4 w-4" />
                <span>Open Replay</span>
                <CommandShortcut>→ Pick Symbol</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/alerts?create=true')}>
                <Bell className="mr-2 h-4 w-4" />
                <span>Create Alert</span>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/journal?create=true')}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>New Journal Entry</span>
              </CommandItem>
            </CommandGroup>
            
            <CommandSeparator />
            
            {/* Navigation */}
            <CommandGroup heading="Navigate">
              <CommandItem onSelect={() => handleNavigation('/')}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/chart')}>
                <LineChart className="mr-2 h-4 w-4" />
                <span>Chart</span>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/watchlist')}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Watchlist</span>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/alerts')}>
                <Bell className="mr-2 h-4 w-4" />
                <span>Alerts</span>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/journal')}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Journal</span>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/oracle')}>
                <Compass className="mr-2 h-4 w-4" />
                <span>Oracle</span>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/lessons')}>
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>Lessons</span>
              </CommandItem>
              <CommandItem onSelect={() => handleNavigation('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            </CommandGroup>
            
            {/* Offline indicator */}
            {!isOnline && (
              <>
                <CommandSeparator />
                <div className="px-2 py-1.5 text-xs text-warning text-center bg-warning/10">
                  Offline — Actions will be queued
                </div>
              </>
            )}
          </CommandList>
        </>
      ) : (
        <SymbolPicker
          onBack={() => setMode('actions')}
          showBackButton
        />
      )}
    </CommandDialog>
  );
}
