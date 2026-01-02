/**
 * Open Symbol Picker Button
 * One-tap button to open symbol picker with a specific intent
 * Per Global UI Infrastructure spec - TASK C
 */

import * as React from 'react';
import { LineChart, Play, Bell, BookOpen } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuickActions } from './QuickActionsContext';

type SymbolPickerIntent = 'chart' | 'replay' | 'alert' | 'journal';

interface OpenSymbolPickerButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** The intent/action to perform after symbol selection */
  intent: SymbolPickerIntent;
  /** Show icon only */
  iconOnly?: boolean;
}

const intentConfig: Record<SymbolPickerIntent, { icon: React.ElementType; label: string }> = {
  chart: { icon: LineChart, label: 'Open Chart' },
  replay: { icon: Play, label: 'Open Replay' },
  alert: { icon: Bell, label: 'Create Alert' },
  journal: { icon: BookOpen, label: 'New Journal Entry' },
};

export function OpenSymbolPickerButton({
  intent,
  iconOnly = false,
  className,
  variant = 'outline',
  size = 'sm',
  ...props
}: OpenSymbolPickerButtonProps) {
  const { open, setMode, setSymbolAction } = useQuickActions();
  
  const config = intentConfig[intent];
  const Icon = config.icon;

  const handleClick = React.useCallback(() => {
    setSymbolAction(intent);
    setMode('symbol-picker');
    open();
  }, [intent, open, setMode, setSymbolAction]);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'focus-visible:ring-2 focus-visible:ring-brand',
        iconOnly && 'h-9 w-9 p-0',
        className
      )}
      onClick={handleClick}
      aria-label={config.label}
      {...props}
    >
      <Icon className={cn('h-4 w-4', !iconOnly && 'mr-2')} />
      {!iconOnly && <span>{config.label}</span>}
    </Button>
  );
}
