import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';

interface DashboardHeaderProps {
  entriesToday: number;
  activeAlerts: number;
  streak: string;
}

export function DashboardHeader({ entriesToday, activeAlerts, streak }: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">{entriesToday} entries today</span>
            <span className="hidden sm:inline text-border" aria-hidden="true">•</span>
            <span className="whitespace-nowrap">{activeAlerts} active alerts</span>
            <span className="hidden sm:inline text-border" aria-hidden="true">•</span>
            <span className="whitespace-nowrap">{streak} streak</span>
          </p>
        </div>
        <Button 
          onClick={() => navigate('/journal')}
          className="gap-2 w-full sm:w-auto shrink-0"
          aria-label="Log a new journal entry"
        >
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Log entry
        </Button>
      </div>

      {/* Global Search Bar */}
      <GlobalSearchBar />
    </header>
  );
}
