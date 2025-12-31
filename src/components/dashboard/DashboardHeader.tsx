import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';

interface DashboardHeaderProps {
  entriesToday: number;
  activeAlerts: number;
  streak: string;
}

export function DashboardHeader({ entriesToday, activeAlerts, streak }: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{entriesToday} entries today</span>
          <span className="text-border">•</span>
          <span>{activeAlerts} active alerts</span>
          <span className="text-border">•</span>
          <span>{streak} streak</span>
        </div>
      </div>
      <Button 
        onClick={() => navigate('/journal')}
        className="gap-2 w-full sm:w-auto"
      >
        <PenLine className="h-4 w-4" />
        Log entry
      </Button>
    </div>
  );
}
