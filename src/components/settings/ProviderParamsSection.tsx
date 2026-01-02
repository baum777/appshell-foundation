import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SettingsSectionCard } from "./SettingsSectionCard";
import { SettingsRow } from "./SettingsRow";
import type { AppSettingsV1, ProviderConfig } from "./types";
import { Lock } from "lucide-react";

interface ProviderParamsSectionProps {
  settings: AppSettingsV1;
  isEditable: boolean;
  onUpdate: (path: string, value: string | number | boolean) => void;
}

export function ProviderParamsSection({
  settings,
  isEditable,
  onUpdate,
}: ProviderParamsSectionProps) {
  const { providers } = settings;

  return (
    <SettingsSectionCard
      title="Provider Parameters"
      description="Model and connection settings"
    >
      <div data-testid="settings-provider-params" id="card-provider-params">
        <Accordion type="multiple" className="space-y-2">
          {/* OpenAI */}
          <AccordionItem value="openai" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-medium">OpenAI</span>
                {!isEditable && <Badge variant="secondary" className="text-xs">Read-only</Badge>}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <SettingsRow label="Model (Journal)" description="GPT model for journal analysis">
                {isEditable ? (
                  <Input
                    value={providers.openai.modelJournal}
                    onChange={(e) => onUpdate('openai.modelJournal', e.target.value)}
                    className="w-40 h-8"
                  />
                ) : (
                  <Badge variant="secondary" className="font-mono text-xs">{providers.openai.modelJournal}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Model (Insights)" description="GPT model for insights">
                {isEditable ? (
                  <Input
                    value={providers.openai.modelInsights}
                    onChange={(e) => onUpdate('openai.modelInsights', e.target.value)}
                    className="w-40 h-8"
                  />
                ) : (
                  <Badge variant="secondary" className="font-mono text-xs">{providers.openai.modelInsights}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Model (Charts)" description="GPT model for chart analysis">
                {isEditable ? (
                  <Input
                    value={providers.openai.modelCharts}
                    onChange={(e) => onUpdate('openai.modelCharts', e.target.value)}
                    className="w-40 h-8"
                  />
                ) : (
                  <Badge variant="secondary" className="font-mono text-xs">{providers.openai.modelCharts}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Timeout (ms)" description="Request timeout">
                {isEditable ? (
                  <Input
                    type="number"
                    min={1000}
                    max={60000}
                    value={providers.openai.timeoutMs}
                    onChange={(e) => onUpdate('openai.timeoutMs', parseInt(e.target.value) || 12000)}
                    className="w-24 h-8 text-right"
                  />
                ) : (
                  <Badge variant="secondary" className="tabular-nums">{providers.openai.timeoutMs}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Max Retries" description="Retry attempts on failure">
                {isEditable ? (
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={providers.openai.maxRetries}
                    onChange={(e) => onUpdate('openai.maxRetries', parseInt(e.target.value) || 2)}
                    className="w-16 h-8 text-right"
                  />
                ) : (
                  <Badge variant="secondary" className="tabular-nums">{providers.openai.maxRetries}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="JSON Strict" description="Enforce strict JSON responses">
                {isEditable ? (
                  <Switch
                    checked={providers.openai.jsonStrict}
                    onCheckedChange={(checked) => onUpdate('openai.jsonStrict', checked)}
                  />
                ) : (
                  <Badge variant="secondary">{providers.openai.jsonStrict ? 'Yes' : 'No'}</Badge>
                )}
              </SettingsRow>
            </AccordionContent>
          </AccordionItem>

          {/* DeepSeek */}
          <AccordionItem value="deepseek" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-medium">DeepSeek</span>
                {!isEditable && <Badge variant="secondary" className="text-xs">Read-only</Badge>}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <SettingsRow label="Model (Reasoning)" description="DeepSeek model for reasoning">
                {isEditable ? (
                  <Input
                    value={providers.deepseek.modelReasoning}
                    onChange={(e) => onUpdate('deepseek.modelReasoning', e.target.value)}
                    className="w-40 h-8"
                  />
                ) : (
                  <Badge variant="secondary" className="font-mono text-xs">{providers.deepseek.modelReasoning}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Timeout (ms)" description="Request timeout">
                {isEditable ? (
                  <Input
                    type="number"
                    min={1000}
                    max={60000}
                    value={providers.deepseek.timeoutMs}
                    onChange={(e) => onUpdate('deepseek.timeoutMs', parseInt(e.target.value) || 12000)}
                    className="w-24 h-8 text-right"
                  />
                ) : (
                  <Badge variant="secondary" className="tabular-nums">{providers.deepseek.timeoutMs}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Max Retries" description="Retry attempts on failure">
                {isEditable ? (
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={providers.deepseek.maxRetries}
                    onChange={(e) => onUpdate('deepseek.maxRetries', parseInt(e.target.value) || 2)}
                    className="w-16 h-8 text-right"
                  />
                ) : (
                  <Badge variant="secondary" className="tabular-nums">{providers.deepseek.maxRetries}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="JSON Strict" description="Locked to true for DeepSeek">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <Badge variant="secondary">Yes (locked)</Badge>
                </div>
              </SettingsRow>
            </AccordionContent>
          </AccordionItem>

          {/* Grok */}
          <AccordionItem value="grok" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-medium">Grok</span>
                {!isEditable && <Badge variant="secondary" className="text-xs">Read-only</Badge>}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <SettingsRow label="Model (Pulse)" description="Grok model for pulse analysis">
                {isEditable ? (
                  <Input
                    value={providers.grok.modelPulse}
                    onChange={(e) => onUpdate('grok.modelPulse', e.target.value)}
                    className="w-40 h-8"
                  />
                ) : (
                  <Badge variant="secondary" className="font-mono text-xs">{providers.grok.modelPulse}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Refresh Interval (min)" description="Auto-refresh interval">
                {isEditable ? (
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={providers.grok.refreshIntervalMin}
                    onChange={(e) => onUpdate('grok.refreshIntervalMin', parseInt(e.target.value) || 15)}
                    className="w-20 h-8 text-right"
                  />
                ) : (
                  <Badge variant="secondary" className="tabular-nums">{providers.grok.refreshIntervalMin}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Timeout (ms)" description="Request timeout">
                {isEditable ? (
                  <Input
                    type="number"
                    min={1000}
                    max={60000}
                    value={providers.grok.timeoutMs}
                    onChange={(e) => onUpdate('grok.timeoutMs', parseInt(e.target.value) || 12000)}
                    className="w-24 h-8 text-right"
                  />
                ) : (
                  <Badge variant="secondary" className="tabular-nums">{providers.grok.timeoutMs}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="Max Retries" description="Retry attempts on failure">
                {isEditable ? (
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={providers.grok.maxRetries}
                    onChange={(e) => onUpdate('grok.maxRetries', parseInt(e.target.value) || 2)}
                    className="w-16 h-8 text-right"
                  />
                ) : (
                  <Badge variant="secondary" className="tabular-nums">{providers.grok.maxRetries}</Badge>
                )}
              </SettingsRow>
              <SettingsRow label="JSON Strict" description="Enforce strict JSON responses">
                {isEditable ? (
                  <Switch
                    checked={providers.grok.jsonStrict}
                    onCheckedChange={(checked) => onUpdate('grok.jsonStrict', checked)}
                  />
                ) : (
                  <Badge variant="secondary">{providers.grok.jsonStrict ? 'Yes' : 'No'}</Badge>
                )}
              </SettingsRow>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </SettingsSectionCard>
  );
}
