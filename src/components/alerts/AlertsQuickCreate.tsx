import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PrefillData {
  symbol?: string;
  condition?: string;
  targetPrice?: number;
  timeframe?: string;
}

interface AlertsQuickCreateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (symbol: string, condition: string, targetPrice: number) => void;
  prefillData?: PrefillData;
}

const CONDITIONS = [
  { value: "above", label: "Above" },
  { value: "below", label: "Below" },
  { value: "crosses_above", label: "Crosses above" },
  { value: "crosses_below", label: "Crosses below" },
];

export function AlertsQuickCreate({
  isOpen,
  onOpenChange,
  onSubmit,
  prefillData,
}: AlertsQuickCreateProps) {
  const isMobile = useIsMobile();
  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [errors, setErrors] = useState<{ symbol?: string; targetPrice?: string }>({});

  // Apply prefill data
  useEffect(() => {
    if (prefillData) {
      if (prefillData.symbol) setSymbol(prefillData.symbol.toUpperCase());
      if (prefillData.condition) setCondition(prefillData.condition);
      if (prefillData.targetPrice) setTargetPrice(String(prefillData.targetPrice));
    }
  }, [prefillData]);

  const validate = (): boolean => {
    const newErrors: { symbol?: string; targetPrice?: string } = {};
    
    const trimmedSymbol = symbol.trim();
    if (!trimmedSymbol) {
      newErrors.symbol = "Symbol is required";
    }
    
    const price = parseFloat(targetPrice);
    if (!targetPrice || isNaN(price) || price <= 0) {
      newErrors.targetPrice = "Price must be greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    onSubmit(symbol.toUpperCase().trim(), condition, parseFloat(targetPrice));
    
    // Reset form
    setSymbol("");
    setCondition("above");
    setTargetPrice("");
    setErrors({});
    onOpenChange(false);
  };

  const formContent = (
    <div className="space-y-4">
      {prefillData?.timeframe && (
        <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
          Timeframe: {prefillData.timeframe} (readonly)
        </div>
      )}
      
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            placeholder="BTC"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className={errors.symbol ? "border-destructive" : ""}
          />
          {errors.symbol && (
            <p className="text-xs text-destructive">{errors.symbol}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="targetPrice">Target price</Label>
          <Input
            id="targetPrice"
            type="number"
            placeholder="45000"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className={errors.targetPrice ? "border-destructive" : ""}
          />
          {errors.targetPrice && (
            <p className="text-xs text-destructive">{errors.targetPrice}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Create
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="bg-background">
          <SheetHeader>
            <SheetTitle>Create Alert</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card className="bg-card/50 border-border/50">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Quick Create</CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {formContent}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
