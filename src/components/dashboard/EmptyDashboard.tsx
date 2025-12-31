import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Bell, PenLine, Rocket } from 'lucide-react';

export function EmptyDashboard() {
  const navigate = useNavigate();

  // BACKEND_TODO: Track onboarding progress
  const steps = [
    { id: 'connect', label: 'Connect your wallet or import data', icon: Upload, done: false },
    { id: 'alert', label: 'Set up your first price alert', icon: Bell, done: false },
    { id: 'journal', label: 'Log your first trade entry', icon: PenLine, done: false },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Empty State */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/8 to-primary/10 border-primary/20">
        <CardContent className="p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Welcome to your trading dashboard
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Get started by connecting your data or logging your first trade. We'll help you track, analyze, and improve your trading.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button 
              onClick={() => navigate('/journal')} 
              className="gap-2"
              aria-label="Log your first trade entry"
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              Log first trade
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              aria-label="Import existing trading data"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Start Here Checklist */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Start here
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg bg-background/50 border border-border/30"
              >
                <Checkbox 
                  checked={step.done} 
                  disabled 
                  className="shrink-0" 
                  aria-label={step.done ? `${step.label} - completed` : step.label}
                />
                <div className="p-1.5 rounded-md bg-muted shrink-0">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                </div>
                <span className={`text-sm ${step.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Placeholder Cards Grid (disabled state) */}
      <div 
        className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 opacity-40 pointer-events-none select-none"
        aria-hidden="true"
      >
        <Card className="bg-card/30 border-border/30 border-dashed">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Your holdings will appear here</p>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30 border-dashed">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Last Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Recent trades will appear here</p>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30 border-dashed">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">AI insights will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
