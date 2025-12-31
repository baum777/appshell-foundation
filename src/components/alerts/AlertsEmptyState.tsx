import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Plus } from "lucide-react";

interface ExampleAlert {
  label: string;
  symbol: string;
  condition: string;
  targetPrice: number;
}

const EXAMPLE_ALERTS: ExampleAlert[] = [
  { label: "BTC above 45000", symbol: "BTC", condition: "above", targetPrice: 45000 },
  { label: "SOL below 100", symbol: "SOL", condition: "below", targetPrice: 100 },
];

interface AlertsEmptyStateProps {
  onCreateClick: () => void;
  onExampleClick: (example: { symbol: string; condition: string; targetPrice: number }) => void;
}

export function AlertsEmptyState({ onCreateClick, onExampleClick }: AlertsEmptyStateProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Bell className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No alerts yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Create alerts to get notified when assets reach your target price levels.
        </p>
        
        <Button onClick={onCreateClick} className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Create alert
        </Button>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLE_ALERTS.map((example) => (
            <Button
              key={example.label}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => onExampleClick({
                symbol: example.symbol,
                condition: example.condition,
                targetPrice: example.targetPrice,
              })}
            >
              {example.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertsFilterEmptyProps {
  onClearFilter: () => void;
}

export function AlertsFilterEmpty({ onClearFilter }: AlertsFilterEmptyProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          No alerts match this filter
        </p>
        <Button variant="outline" size="sm" onClick={onClearFilter}>
          Clear filter
        </Button>
      </CardContent>
    </Card>
  );
}
