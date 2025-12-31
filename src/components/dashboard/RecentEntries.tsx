import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import type { RecentActivityStub } from '@/stubs/contracts';
import { formatDistanceToNow } from 'date-fns';

interface RecentEntriesProps {
  entries: RecentActivityStub[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  const navigate = useNavigate();

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Entries</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-xs"
            onClick={() => navigate('/journal')}
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => navigate(`/journal?entry=${entry.id}`)}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-background/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-md ${
                  entry.type === 'trade' ? 'bg-primary/10' : 
                  entry.type === 'alert' ? 'bg-chart-warning/10' : 
                  'bg-muted'
                }`}>
                  {entry.type === 'trade' ? (
                    entry.description.includes('+') ? (
                      <TrendingUp className="h-3.5 w-3.5 text-chart-positive" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-chart-negative" />
                    )
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{entry.description}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function JournalSnapshotCard() {
  const navigate = useNavigate();
  
  // BACKEND_TODO: Fetch journal snapshot stats
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Journal Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Pending</span>
          <Badge variant="secondary">3</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Confirmed</span>
          <Badge variant="secondary">12</Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-1.5"
          onClick={() => navigate('/journal')}
        >
          Open journal
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function AlertsSnapshotCard() {
  const navigate = useNavigate();
  
  // BACKEND_TODO: Fetch alerts snapshot stats
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Alerts Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active</span>
          <Badge variant="secondary">5</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Triggered today</span>
          <Badge variant="secondary">2</Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-1.5"
          onClick={() => navigate('/alerts')}
        >
          Manage alerts
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
