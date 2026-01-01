import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Local types - not exported
type TAModalState = "idle" | "loading" | "result" | "error";
type TrendDirection = "Bullish" | "Bearish" | "Range";
type ConfidenceLevel = "Low" | "Medium" | "High";

interface SupportResistanceLevel {
  label: string;
  level: number;
  note?: string;
}

interface TPLevel {
  label: string;
  level: number;
  rationale: string;
}

interface StopLoss {
  soft: { level: number; rule: string };
  hard: { level: number; rule: string };
}

interface TAReport {
  assumptions: {
    market: string;
    timeframe: string;
    replay: boolean;
    dataSource: string;
    timestamp: string;
  };
  trend: {
    direction: TrendDirection;
    confidence: ConfidenceLevel;
    summary: string;
  };
  support: SupportResistanceLevel[];
  resistance: SupportResistanceLevel[];
  takeProfitLevels: TPLevel[];
  stopLoss: StopLoss;
  reversalCriteria: string[];
}

interface AITAAnalyzerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMarket: string | null;
  selectedTimeframe: string;
  isReplayMode: boolean;
}

// BACKEND_TODO: replace stub generator with API call to TA endpoint (market/timeframe/replay + chart image/context)
function generateStubTAReport(input: {
  market: string;
  timeframe: string;
  replay: boolean;
  timestamp: string;
}): TAReport {
  const basePrice = input.market === "SOL" ? 145.5 : input.market === "BTC" ? 67500 : 0.0234;
  const decimals = basePrice > 100 ? 2 : basePrice > 1 ? 4 : 6;
  const fmt = (v: number) => v.toFixed(decimals);

  const directions: TrendDirection[] = ["Bullish", "Bearish", "Range"];
  const direction = directions[Math.floor(Math.random() * 3)];

  return {
    assumptions: {
      market: input.market,
      timeframe: input.timeframe,
      replay: input.replay,
      dataSource: "Stub data / placeholder chart (v1)",
      timestamp: input.timestamp,
    },
    trend: {
      direction,
      confidence: direction === "Range" ? "Low" : "Medium",
      summary:
        direction === "Bullish"
          ? `${input.market} shows strength on ${input.timeframe} with higher highs forming. RSI approaching overbought but momentum favors continuation.`
          : direction === "Bearish"
          ? `${input.market} exhibiting weakness on ${input.timeframe} with lower lows. Watch for potential support retest.`
          : `${input.market} consolidating in a range on ${input.timeframe}. Await breakout confirmation before directional bias.`,
    },
    support: [
      { label: "S1", level: parseFloat(fmt(basePrice * 0.97)), note: "Recent swing low" },
      { label: "S2", level: parseFloat(fmt(basePrice * 0.94)), note: "Daily support zone" },
      { label: "S3", level: parseFloat(fmt(basePrice * 0.90)) },
      { label: "S4", level: parseFloat(fmt(basePrice * 0.85)), note: "Major support" },
    ],
    resistance: [
      { label: "R1", level: parseFloat(fmt(basePrice * 1.03)), note: "Immediate resistance" },
      { label: "R2", level: parseFloat(fmt(basePrice * 1.06)), note: "Previous high" },
      { label: "R3", level: parseFloat(fmt(basePrice * 1.10)) },
      { label: "R4", level: parseFloat(fmt(basePrice * 1.15)), note: "Major resistance" },
    ],
    takeProfitLevels: [
      {
        label: "TP1",
        level: parseFloat(fmt(basePrice * 1.04)),
        rationale: "Conservative target at minor resistance",
      },
      {
        label: "TP2",
        level: parseFloat(fmt(basePrice * 1.08)),
        rationale: "Mid target near R2 zone",
      },
      {
        label: "TP3",
        level: parseFloat(fmt(basePrice * 1.12)),
        rationale: "Extended target if momentum continues",
      },
    ],
    stopLoss: {
      soft: {
        level: parseFloat(fmt(basePrice * 0.96)),
        rule: "Close position if price closes below S1 on selected timeframe",
      },
      hard: {
        level: parseFloat(fmt(basePrice * 0.93)),
        rule: "Immediate exit if price breaks below S2 intracandle",
      },
    },
    reversalCriteria: [
      `Break and close above R1 (${fmt(basePrice * 1.03)}), then successful retest as support`,
      `Higher high + higher low confirmed on ${input.timeframe}`,
      "Volume expansion exceeds 20-period average on breakout candle",
      `Invalidation: close below S1 (${fmt(basePrice * 0.97)}) negates bullish setup`,
      "RSI divergence on lower timeframe would confirm momentum shift",
    ],
  };
}

function formatReportToText(report: TAReport): string {
  const lines: string[] = [];
  const { assumptions, trend, support, resistance, takeProfitLevels, stopLoss, reversalCriteria } =
    report;

  lines.push("═══════════════════════════════════════");
  lines.push("       AI TECHNICAL ANALYSIS REPORT    ");
  lines.push("═══════════════════════════════════════");
  lines.push("");

  lines.push("📋 ASSUMPTIONS");
  lines.push(`   Market: ${assumptions.market}`);
  lines.push(`   Timeframe: ${assumptions.timeframe}`);
  lines.push(`   Replay Mode: ${assumptions.replay ? "Yes" : "No"}`);
  lines.push(`   Data Source: ${assumptions.dataSource}`);
  lines.push(`   Generated: ${assumptions.timestamp}`);
  lines.push("");

  lines.push(`📈 TREND: ${trend.direction.toUpperCase()} (${trend.confidence} confidence)`);
  lines.push(`   ${trend.summary}`);
  lines.push("");

  lines.push("🟢 SUPPORT LEVELS");
  support.forEach((s) => {
    lines.push(`   ${s.label}: ${s.level}${s.note ? ` — ${s.note}` : ""}`);
  });
  lines.push("");

  lines.push("🔴 RESISTANCE LEVELS");
  resistance.forEach((r) => {
    lines.push(`   ${r.label}: ${r.level}${r.note ? ` — ${r.note}` : ""}`);
  });
  lines.push("");

  lines.push("🎯 TAKE PROFIT TARGETS");
  takeProfitLevels.forEach((tp) => {
    lines.push(`   ${tp.label}: ${tp.level} — ${tp.rationale}`);
  });
  lines.push("");

  lines.push("🛑 STOP LOSS");
  lines.push(`   Soft SL: ${stopLoss.soft.level}`);
  lines.push(`   └─ ${stopLoss.soft.rule}`);
  lines.push(`   Hard SL: ${stopLoss.hard.level}`);
  lines.push(`   └─ ${stopLoss.hard.rule}`);
  lines.push("");

  lines.push("🔄 TREND REVERSAL CONFIRMATION");
  reversalCriteria.forEach((c, i) => {
    lines.push(`   ${i + 1}. ${c}`);
  });
  lines.push("");

  lines.push("═══════════════════════════════════════");
  lines.push("  Generated by Sparkfined AI (v1 stub)");
  lines.push("═══════════════════════════════════════");

  return lines.join("\n");
}

function AssumptionsCard({
  assumptions,
}: {
  assumptions: TAReport["assumptions"];
}) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Assumptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Market</span>
          <span className="font-medium">{assumptions.market}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timeframe</span>
          <span className="font-medium">{assumptions.timeframe}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Replay Mode</span>
          <span className="font-medium">{assumptions.replay ? "Yes" : "No"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data Source</span>
          <span className="font-medium text-xs">{assumptions.dataSource}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timestamp</span>
          <span className="font-medium text-xs">{assumptions.timestamp}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-2 italic">
          {/* BACKEND_TODO: Capture chart canvas + send to TA endpoint with market/timeframe context. */}
          Note: This is a UI stub. Real analysis requires backend integration.
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Analyzing chart…</span>
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  );
}

export function AITAAnalyzerDialog({
  isOpen,
  onOpenChange,
  selectedMarket,
  selectedTimeframe,
  isReplayMode,
}: AITAAnalyzerDialogProps) {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState<TAModalState>("idle");
  const [report, setReport] = useState<TAReport | null>(null);
  const [chartSource, setChartSource] = useState<"current" | "upload">("current");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Dev-only error simulation (set to true to test error state)
  const simulateError = false;

  const currentTimestamp = new Date().toLocaleString();

  const assumptions = {
    market: selectedMarket || "—",
    timeframe: selectedTimeframe,
    replay: isReplayMode,
    dataSource: "Stub data / placeholder chart (v1)",
    timestamp: currentTimestamp,
  };

  const canAnalyze = !!selectedMarket && !!selectedTimeframe;

  const handleAnalyze = useCallback(() => {
    if (!selectedMarket) return;

    setModalState("loading");

    // Simulate API delay
    const delay = 900 + Math.random() * 500;
    setTimeout(() => {
      if (simulateError) {
        setModalState("error");
      } else {
        const generatedReport = generateStubTAReport({
          market: selectedMarket,
          timeframe: selectedTimeframe,
          replay: isReplayMode,
          timestamp: new Date().toLocaleString(),
        });
        setReport(generatedReport);
        setModalState("result");
      }
    }, delay);
  }, [selectedMarket, selectedTimeframe, isReplayMode, simulateError]);

  const handleRetry = useCallback(() => {
    handleAnalyze();
  }, [handleAnalyze]);

  const handleCopy = useCallback(async () => {
    if (!report) return;
    const text = formatReportToText(report);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      // Clipboard failed silently
    }
  }, [report]);

  const handleCreateAlert = useCallback(() => {
    // BACKEND_TODO: pass TA levels as URL prefill
    navigate("/alerts");
    onOpenChange(false);
  }, [navigate, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setModalState("idle");
      setReport(null);
      setUploadedFile(null);
      setChartSource("current");
    }, 200);
  }, [onOpenChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // BACKEND_TODO: send uploaded image to analysis endpoint
    }
  };

  const getTrendIcon = (direction: TrendDirection) => {
    switch (direction) {
      case "Bullish":
        return <TrendingUp className="h-4 w-4" />;
      case "Bearish":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (direction: TrendDirection) => {
    switch (direction) {
      case "Bullish":
        return "bg-success/10 text-success border-success/30";
      case "Bearish":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-warning/10 text-warning border-warning/30";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Technical Analysis</DialogTitle>
          <DialogDescription>
            Generates a TA snapshot from the current chart view (UI-only).
          </DialogDescription>
        </DialogHeader>

        {/* Idle State */}
        {modalState === "idle" && (
          <div className="space-y-4">
            <AssumptionsCard assumptions={assumptions} />

            {/* Chart Source Picker */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Chart Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup
                  value={chartSource}
                  onValueChange={(v) => setChartSource(v as "current" | "upload")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="current" />
                    <Label htmlFor="current" className="cursor-pointer">
                      Use current chart view
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label htmlFor="upload" className="cursor-pointer">
                      Upload screenshot
                    </Label>
                  </div>
                </RadioGroup>

                {chartSource === "upload" && (
                  <div className="pt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-sm"
                    />
                    {uploadedFile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Selected: {uploadedFile.name}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                aria-label="Analyze chart with AI"
              >
                Analyze
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {modalState === "loading" && <LoadingSkeleton />}

        {/* Error State */}
        {modalState === "error" && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Analysis failed. Please try again.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleRetry}>Retry</Button>
            </div>
          </div>
        )}

        {/* Result State */}
        {modalState === "result" && report && (
          <div className="space-y-4">
            {/* A) Assumptions */}
            <AssumptionsCard assumptions={report.assumptions} />

            {/* B) Trend */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Trend</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getTrendColor(report.trend.direction)}
                    >
                      {getTrendIcon(report.trend.direction)}
                      <span className="ml-1">{report.trend.direction}</span>
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {report.trend.confidence}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.trend.summary}</p>
              </CardContent>
            </Card>

            {/* C & D) Support and Resistance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-success">
                    Support Levels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {report.support.map((s) => (
                    <div key={s.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-mono">
                        {s.level}
                        {s.note && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({s.note})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-destructive">
                    Resistance Levels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {report.resistance.map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className="font-mono">
                        {r.level}
                        {r.note && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({r.note})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* E) Take Profit Targets */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Take Profit Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.takeProfitLevels.map((tp) => (
                  <div key={tp.label} className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-medium">{tp.label}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {tp.rationale}
                      </span>
                    </div>
                    <span className="font-mono">{tp.level}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* F) Stop Loss */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stop Loss</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-md bg-warning/10 border border-warning/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-warning">Soft SL</span>
                    <span className="font-mono text-sm">{report.stopLoss.soft.level}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{report.stopLoss.soft.rule}</p>
                </div>
                <Separator />
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-destructive">Hard SL</span>
                    <span className="font-mono text-sm">{report.stopLoss.hard.level}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{report.stopLoss.hard.rule}</p>
                </div>
              </CardContent>
            </Card>

            {/* G) Trend Reversal Confirmation */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Trend Reversal Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.reversalCriteria.map((criteria, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* H) Footer Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  aria-label="Copy TA summary"
                >
                  {copyFeedback ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Summary
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateAlert}
                  aria-label="Create alert from TA levels"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Create Alert
                </Button>
              </div>
              <Button variant="secondary" size="sm" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
