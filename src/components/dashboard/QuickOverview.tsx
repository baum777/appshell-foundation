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
    <section aria-label="Quick overview">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = iconMap[card.type];
          return (
            <Card 
              key={card.id} 
              className="bg-card/50 border-border/50 hover:bg-card/70 hover:border-border/70 transition-colors"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">
                          {card.title}
                        </span>
                        {card.badge && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {card.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {card.summary}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(card.link)}
                    className="text-xs shrink-0 h-8 px-2 sm:px-3"
                    aria-label={`View ${card.title}`}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
