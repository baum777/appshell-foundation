import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";

const INDICATORS = [
  { id: "sma", label: "SMA (20)" },
  { id: "ema", label: "EMA (50)" },
  { id: "rsi", label: "RSI" },
  { id: "macd", label: "MACD" },
  { id: "bollinger", label: "Bollinger Bands" },
];

const DRAWING_TOOLS = [
  { id: "line", label: "Line" },
  { id: "ray", label: "Ray" },
  { id: "channel", label: "Channel" },
  { id: "pitchfork", label: "Pitchfork" },
];

interface ToolsPanelContentProps {
  enabledIndicators: string[];
  onToggleIndicator: (id: string) => void;
  onOpenAIAnalyzer?: () => void;
}

function ToolsPanelContent({
  enabledIndicators,
  onToggleIndicator,
  onOpenAIAnalyzer,
}: ToolsPanelContentProps) {
  return (
    <Accordion type="multiple" defaultValue={["indicators", "ai-tools"]} className="w-full">
      {/* AI Tools Section */}
      <AccordionItem value="ai-tools">
        <AccordionTrigger className="text-sm font-medium py-3">
          AI Tools
        </AccordionTrigger>
        <AccordionContent>
          <div className="py-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={onOpenAIAnalyzer}
              aria-label="Analyze chart with AI"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              AI TA Analyze
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="indicators">
        <AccordionTrigger className="text-sm font-medium py-3">
          Indicators
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 py-2">
            {INDICATORS.map((indicator) => (
              <div key={indicator.id} className="flex items-center justify-between">
                <Label htmlFor={indicator.id} className="text-sm cursor-pointer">
                  {indicator.label}
                </Label>
                <Switch
                  id={indicator.id}
                  checked={enabledIndicators.includes(indicator.id)}
                  onCheckedChange={() => onToggleIndicator(indicator.id)}
                />
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="drawing">
        <AccordionTrigger className="text-sm font-medium py-3">
          Drawing Tools
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 py-2">
            {DRAWING_TOOLS.map((tool) => (
              <p key={tool.id} className="text-sm text-muted-foreground">
                {tool.label}
              </p>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="settings">
        <AccordionTrigger className="text-sm font-medium py-3">
          Settings
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="grid" className="text-sm cursor-pointer">
                Show grid
              </Label>
              <Switch id="grid" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="volume" className="text-sm cursor-pointer">
                Show volume
              </Label>
              <Switch id="volume" defaultChecked />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface ToolsIndicatorsPanelProps {
  enabledIndicators: string[];
  onToggleIndicator: (id: string) => void;
  onOpenAIAnalyzer?: () => void;
}

export function ToolsIndicatorsPanel(props: ToolsIndicatorsPanelProps) {
  return (
    <div className="w-52 shrink-0 border border-border/50 rounded-lg bg-card/50 overflow-hidden">
      <div className="p-3 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Tools</h2>
      </div>
      <div className="p-3">
        <ToolsPanelContent {...props} />
      </div>
    </div>
  );
}

interface ToolsIndicatorsSheetProps extends ToolsIndicatorsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolsIndicatorsSheet({
  isOpen,
  onOpenChange,
  ...props
}: ToolsIndicatorsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0 bg-background pb-20">
        <SheetHeader className="p-4 border-b border-border/50">
          <SheetTitle>Tools & Indicators</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <ToolsPanelContent {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
