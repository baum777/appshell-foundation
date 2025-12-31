import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Info, Clock, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  type AlertType,
  type SimpleCondition,
  type TwoStageTemplate,
  type PrefillData,
  type DeadTokenParams,
  TIMEFRAMES,
  SIMPLE_CONDITIONS,
  TWO_STAGE_TEMPLATES,
  TEMPLATE_INDICATORS,
  DEFAULT_DEAD_TOKEN_PARAMS,
} from "./types";

interface AlertsQuickCreateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSimple: (params: {
    symbolOrAddress: string;
    timeframe: string;
    condition: SimpleCondition;
    targetPrice: number;
    note?: string;
  }) => void;
  onSubmitTwoStage: (params: {
    symbolOrAddress: string;
    timeframe: string;
    template: TwoStageTemplate;
    windowCandles?: number;
    windowMinutes?: number;
    expiryMinutes: number;
    cooldownMinutes: number;
    note?: string;
  }) => void;
  onSubmitDeadToken: (params: {
    symbolOrAddress: string;
    timeframe: string;
    params: DeadTokenParams;
    note?: string;
  }) => void;
  prefillData?: PrefillData;
}

export function AlertsQuickCreate({
  isOpen,
  onOpenChange,
  onSubmitSimple,
  onSubmitTwoStage,
  onSubmitDeadToken,
  prefillData,
}: AlertsQuickCreateProps) {
  const isMobile = useIsMobile();

  // Common state
  const [alertType, setAlertType] = useState<AlertType>("SIMPLE");
  const [symbolOrAddress, setSymbolOrAddress] = useState("");
  const [timeframe, setTimeframe] = useState<string>("1h");
  const [note, setNote] = useState("");

  // Simple alert state
  const [condition, setCondition] = useState<SimpleCondition>("ABOVE");
  const [targetPrice, setTargetPrice] = useState("");

  // Two-stage state
  const [template, setTemplate] = useState<TwoStageTemplate>("TREND_MOMENTUM_STRUCTURE");
  const [windowCandles, setWindowCandles] = useState("20");
  const [expiryMinutes, setExpiryMinutes] = useState("60");
  const [cooldownMinutes, setCooldownMinutes] = useState("15");

  // Dead token state
  const [deadTokenParams, setDeadTokenParams] = useState<DeadTokenParams>({ ...DEFAULT_DEAD_TOKEN_PARAMS });

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Apply prefill
  useEffect(() => {
    if (prefillData) {
      if (prefillData.symbol) setSymbolOrAddress(prefillData.symbol.toUpperCase());
      if (prefillData.timeframe) setTimeframe(prefillData.timeframe);
      if (prefillData.condition) {
        setCondition(prefillData.condition.toUpperCase() as SimpleCondition);
      }
      if (prefillData.target !== undefined) setTargetPrice(String(prefillData.target));
      if (prefillData.type) {
        if (prefillData.type === "simple") setAlertType("SIMPLE");
        else if (prefillData.type === "twoStage") setAlertType("TWO_STAGE_CONFIRMED");
        else if (prefillData.type === "deadToken") setAlertType("DEAD_TOKEN_AWAKENING_V2");
      }
      if (prefillData.template) {
        const templateMap: Record<string, TwoStageTemplate> = {
          trendMomentumStructure: "TREND_MOMENTUM_STRUCTURE",
          macdRsiVolume: "MACD_RSI_VOLUME",
          breakoutRetestVolume: "BREAKOUT_RETEST_VOLUME",
        };
        if (templateMap[prefillData.template]) {
          setTemplate(templateMap[prefillData.template]);
        }
      }
      if (prefillData.windowCandles) setWindowCandles(String(prefillData.windowCandles));
      if (prefillData.expiryMinutes) setExpiryMinutes(String(prefillData.expiryMinutes));
      if (prefillData.cooldownMinutes) setCooldownMinutes(String(prefillData.cooldownMinutes));
    }
  }, [prefillData]);

  const resetForm = () => {
    setSymbolOrAddress("");
    setTimeframe("1h");
    setNote("");
    setCondition("ABOVE");
    setTargetPrice("");
    setTemplate("TREND_MOMENTUM_STRUCTURE");
    setWindowCandles("20");
    setExpiryMinutes("60");
    setCooldownMinutes("15");
    setDeadTokenParams({ ...DEFAULT_DEAD_TOKEN_PARAMS });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedSymbol = symbolOrAddress.trim();
    if (!trimmedSymbol) {
      newErrors.symbolOrAddress = "Symbol or address is required";
    }

    if (alertType === "SIMPLE") {
      const price = parseFloat(targetPrice);
      if (!targetPrice || isNaN(price) || price <= 0) {
        newErrors.targetPrice = "Price must be greater than 0";
      }
    }

    if (alertType === "TWO_STAGE_CONFIRMED") {
      const expiry = parseInt(expiryMinutes, 10);
      if (isNaN(expiry) || expiry <= 0) {
        newErrors.expiryMinutes = "Expiry must be greater than 0";
      }
      const cooldown = parseInt(cooldownMinutes, 10);
      if (isNaN(cooldown) || cooldown < 0) {
        newErrors.cooldownMinutes = "Cooldown must be 0 or greater";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (alertType === "SIMPLE") {
      onSubmitSimple({
        symbolOrAddress: symbolOrAddress.trim().toUpperCase(),
        timeframe,
        condition,
        targetPrice: parseFloat(targetPrice),
        note: note.trim() || undefined,
      });
    } else if (alertType === "TWO_STAGE_CONFIRMED") {
      const candles = parseInt(windowCandles, 10);
      onSubmitTwoStage({
        symbolOrAddress: symbolOrAddress.trim().toUpperCase(),
        timeframe,
        template,
        windowCandles: !isNaN(candles) && candles > 0 ? candles : undefined,
        expiryMinutes: parseInt(expiryMinutes, 10),
        cooldownMinutes: parseInt(cooldownMinutes, 10),
        note: note.trim() || undefined,
      });
    } else {
      onSubmitDeadToken({
        symbolOrAddress: symbolOrAddress.trim(),
        timeframe,
        params: deadTokenParams,
        note: note.trim() || undefined,
      });
    }

    resetForm();
    onOpenChange(false);
  };

  const selectedIndicators = TEMPLATE_INDICATORS[template];

  const formContent = (
    <div className="space-y-5">
      {/* Prefill hint */}
      {prefillData && Object.keys(prefillData).length > 0 && (
        <div className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-md flex items-center gap-2">
          <Info className="h-3 w-3" />
          Prefilled from link
        </div>
      )}

      {/* Alert Type Selector */}
      <div className="space-y-2">
        <Label>Alert Type</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={alertType === "SIMPLE" ? "default" : "outline"}
            size="sm"
            onClick={() => setAlertType("SIMPLE")}
          >
            Simple
          </Button>
          <Button
            type="button"
            variant={alertType === "TWO_STAGE_CONFIRMED" ? "default" : "outline"}
            size="sm"
            onClick={() => setAlertType("TWO_STAGE_CONFIRMED")}
          >
            2-Stage Confirmed
          </Button>
          <Button
            type="button"
            variant={alertType === "DEAD_TOKEN_AWAKENING_V2" ? "default" : "outline"}
            size="sm"
            onClick={() => setAlertType("DEAD_TOKEN_AWAKENING_V2")}
          >
            Dead Token v2
          </Button>
        </div>
      </div>

      <Separator />

      {/* Common Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="symbolOrAddress">Symbol or Address</Label>
          <Input
            id="symbolOrAddress"
            placeholder="SOL or 7xKXt..."
            value={symbolOrAddress}
            onChange={(e) => setSymbolOrAddress(e.target.value.trim())}
            className={errors.symbolOrAddress ? "border-destructive" : ""}
          />
          {errors.symbolOrAddress && (
            <p className="text-xs text-destructive">{errors.symbolOrAddress}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger id="timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Simple Alert Fields */}
      {alertType === "SIMPLE" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as SimpleCondition)}>
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIMPLE_CONDITIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Price</Label>
            <Input
              id="targetPrice"
              type="number"
              placeholder="150.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className={errors.targetPrice ? "border-destructive" : ""}
            />
            {errors.targetPrice && (
              <p className="text-xs text-destructive">{errors.targetPrice}</p>
            )}
          </div>
        </div>
      )}

      {/* Two-Stage Fields */}
      {alertType === "TWO_STAGE_CONFIRMED" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Template (2 of 3 confirmation)</Label>
            <Select value={template} onValueChange={(v) => setTemplate(v as TwoStageTemplate)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TWO_STAGE_TEMPLATES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {TWO_STAGE_TEMPLATES.find((t) => t.value === template)?.description}
            </p>
          </div>

          {/* Indicator Preview */}
          <Card className="bg-muted/30 border-border/50">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Indicators Preview</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-2">
                {selectedIndicators.map((ind) => (
                  <div key={ind.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ind.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {ind.category}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-xs">{ind.params}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rule Config */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="windowCandles">Window (candles)</Label>
              <Input
                id="windowCandles"
                type="number"
                placeholder="20"
                value={windowCandles}
                onChange={(e) => setWindowCandles(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryMinutes">Expiry (min)</Label>
              <Input
                id="expiryMinutes"
                type="number"
                placeholder="60"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                className={errors.expiryMinutes ? "border-destructive" : ""}
              />
              {errors.expiryMinutes && (
                <p className="text-xs text-destructive">{errors.expiryMinutes}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooldownMinutes">Cooldown (min)</Label>
              <Input
                id="cooldownMinutes"
                type="number"
                placeholder="15"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(e.target.value)}
                className={errors.cooldownMinutes ? "border-destructive" : ""}
              />
              {errors.cooldownMinutes && (
                <p className="text-xs text-destructive">{errors.cooldownMinutes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dead Token Fields */}
      {alertType === "DEAD_TOKEN_AWAKENING_V2" && (
        <div className="space-y-4">
          {/* Preset Summary */}
          <Card className="bg-muted/30 border-border/50">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Dead Token Awakening v2
              </CardTitle>
              <CardDescription className="text-xs">
                Multi-stage session alert for dormant tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Session max: 12 hours</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">1. AWAKENING</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary">2. SUSTAINED</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary">3. SECOND_SURGE</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Timeframe policy: 5m for awakening detection, 15m for sustained, 1h for surge confirmation
              </p>
            </CardContent>
          </Card>

          {/* Optional params editor */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                Advanced Parameters
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(deadTokenParams).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={key} className="text-xs">
                      {key.replace(/_/g, " ")}
                    </Label>
                    <Input
                      id={key}
                      type="number"
                      value={value}
                      onChange={(e) =>
                        setDeadTokenParams((prev) => ({
                          ...prev,
                          [key]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Note field */}
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Alert</Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="bg-background max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Alert</SheetTitle>
          </SheetHeader>
          <div className="mt-4 pb-safe">{formContent}</div>
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
          <CardContent className="pt-0">{formContent}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
