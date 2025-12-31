import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import type { NextActionStub } from '@/stubs/contracts';

interface NextActionsProps {
  actions: NextActionStub[];
}

const priorityStyles = {
  high: 'bg-chart-negative/10 text-chart-negative',
  medium: 'bg-chart-warning/10 text-chart-warning',
  low: 'bg-muted text-muted-foreground',
};

const priorityIcons = {
  high: AlertCircle,
  medium: CheckCircle,
  low: CheckCircle,
};

export function NextActions({ actions }: NextActionsProps) {
  const navigate = useNavigate();

  if (actions.length === 0) return null;

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Next Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = priorityIcons[action.priority];
          return (
            <div 
              key={action.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border border-border/30"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${priorityStyles[action.priority]}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(action.link)}
                className="shrink-0 gap-1"
              >
                Go
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
