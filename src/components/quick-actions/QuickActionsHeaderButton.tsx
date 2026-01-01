/**
 * Quick Actions Header Button (Desktop)
 * Button in header to open command palette
 */

import * as React from 'react';
import { Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuickActions } from './QuickActionsContext';

interface QuickActionsHeaderButtonProps {
  className?: string;
}

export function QuickActionsHeaderButton({ className }: QuickActionsHeaderButtonProps) {
  const { open } = useQuickActions();

  return (
    <Button
      onClick={open}
      variant="outline"
      size="sm"
      className={cn(
        'hidden md:flex items-center gap-2 text-muted-foreground',
        'hover:text-foreground',
        className
      )}
    >
      <Command className="h-4 w-4" />
      <span className="text-sm">Quick actions</span>
      <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
