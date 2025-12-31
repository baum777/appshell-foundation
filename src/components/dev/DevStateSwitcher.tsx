import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings2, X, Loader2, AlertTriangle, Inbox, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PageState } from '@/stubs/pageState';

interface DevStateSwitcherProps {
  currentState: PageState;
  onStateChange: (state: PageState) => void;
  hasData?: boolean;
  onToggleData?: () => void;
}

const stateOptions: { value: PageState; label: string; icon: React.ReactNode }[] = [
  { value: 'loading', label: 'Loading', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  { value: 'error', label: 'Error', icon: <AlertTriangle className="h-3 w-3" /> },
  { value: 'empty', label: 'Empty', icon: <Inbox className="h-3 w-3" /> },
  { value: 'ready', label: 'Ready', icon: <CheckCircle2 className="h-3 w-3" /> },
];

export function DevStateSwitcher({
  currentState,
  onStateChange,
  hasData = true,
  onToggleData,
}: DevStateSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Only render in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const currentRoute = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-200',
        // Position: bottom-right on desktop, above bottom nav on mobile
        'bottom-4 right-4 md:bottom-6 md:right-6',
        // On mobile, account for bottom nav (h-16 + pb-safe)
        'mb-16 md:mb-0'
      )}
    >
      {isOpen ? (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dev Controls
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Current route indicator */}
            <div className="text-xs text-muted-foreground">
              Route: <span className="text-foreground font-mono">/{currentRoute}</span>
            </div>

            {/* State switcher */}
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Page State</span>
              <div className="grid grid-cols-2 gap-1">
                {stateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onStateChange(option.value)}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors',
                      currentState === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Data toggle */}
            {onToggleData && (
              <div className="pt-2 border-t border-border">
                <button
                  onClick={onToggleData}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors',
                    'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span>Mock Data</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                      hasData
                        ? 'bg-accent/20 text-accent'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    )}
                  >
                    {hasData ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-10 w-10 rounded-full bg-card shadow-lg border-border hover:bg-muted"
          title="Dev State Switcher"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
