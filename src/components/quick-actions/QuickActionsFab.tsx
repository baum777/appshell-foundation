/**
 * Quick Actions FAB (Mobile)
 * Floating action button to open quick actions sheet
 */

import * as React from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuickActions } from './QuickActionsContext';

interface QuickActionsFabProps {
  className?: string;
}

export function QuickActionsFab({ className }: QuickActionsFabProps) {
  const { open } = useQuickActions();

  return (
    <Button
      onClick={open}
      size="icon"
      className={cn(
        'fixed right-4 bottom-24 z-40 h-14 w-14 rounded-full shadow-lg',
        'bg-primary hover:bg-primary/90 text-primary-foreground',
        'md:hidden', // Only show on mobile
        className
      )}
      aria-label="Quick actions"
    >
      <Zap className="h-6 w-6" />
    </Button>
  );
}
