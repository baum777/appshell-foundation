import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bell, BookOpen } from 'lucide-react';
import type { OverviewCardStub } from '@/stubs/contracts';

interface QuickOverviewProps {
  cards: OverviewCardStub[];
}

const iconMap = {
  today: Sparkles,
  alerts: Bell,
  journal: BookOpen,
};

export function QuickOverview({ cards }: QuickOverviewProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = iconMap[card.type];
        return (
          <Card key={card.id} className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{card.title}</span>
                      {card.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {card.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{card.summary}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(card.link)}
                  className="text-xs shrink-0"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
