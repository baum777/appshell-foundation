import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  RefreshCw,
  Copy,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/components/settings/useSettingsStore';
import { toast } from '@/hooks/use-toast';
import {
  type JournalInsightV1,
  type InsightCardState,
  type ExtendedJournalEntry,
  getCachedInsight,
  setCachedInsight,
  clearCachedInsight,
  generateLocalInsight,
  canGenerateInsight,
  incrementDailyInsightCalls,
  getDailyInsightCalls,
  getDailyInsightLimit,
} from '@/services/journal/insights';
import type { JournalEntryStub } from '@/stubs/contracts';

interface JournalInsightCardProps {
  entry: JournalEntryStub;
}

export function JournalInsightCard({ entry }: JournalInsightCardProps) {
  const { settings } = useSettingsStore();
  const [state, setState] = useState<InsightCardState>('idle');
  const [insight, setInsight] = useState<JournalInsightV1 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);

  // Load cached insight on mount or entry change
  useEffect(() => {
    const cached = getCachedInsight(entry.id);
    if (cached) {
      setInsight(cached);
      setState('ready');
      setError(null);
    } else {
      setState('idle');
      setInsight(null);
    }
    setIsOverLimit(false);
  }, [entry.id]);

  const handleGenerate = useCallback((forceRegenerate = false) => {
    // Check budget
    const budgetCheck = canGenerateInsight(settings);
    
    // If cached and not forcing regenerate, use cache (doesn't count budget)
    if (!forceRegenerate && insight?.meta.cache === 'hit') {
      return; // Already have cached insight
    }
    
    // Check if blocked
    if (!budgetCheck.allowed && !budgetCheck.adminFailOpen) {
      setState('blocked');
      return;
    }
    
    // Track over limit for admin failOpen
    if (!budgetCheck.allowed && budgetCheck.adminFailOpen) {
      setIsOverLimit(true);
    }
    
    setState('loading');
    setError(null);
    
    // Simulate async delay for UX
    setTimeout(() => {
      try {
        // Clear old cache if regenerating
        if (forceRegenerate) {
          clearCachedInsight(entry.id);
        }
        
        // Convert stub to extended entry (in real app, this would have more fields)
        const extendedEntry: ExtendedJournalEntry = {
          ...entry,
          // These would come from full entry data
          notes: undefined,
          riskPercent: undefined,
          emotionTag: undefined,
          sessionTag: undefined,
          stopLoss: undefined,
          invalidation: undefined,
          attachments: undefined,
          chartLink: undefined,
        };
        
        const generated = generateLocalInsight(extendedEntry);
        
        // Increment budget usage
        incrementDailyInsightCalls();
        
        // Cache the insight
        setCachedInsight(generated);
        
        setInsight(generated);
        setState('ready');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate insight');
        setState('error');
      }
    }, 300 + Math.random() * 200); // Simulate small latency
  }, [entry, insight, settings]);

  const handleCopy = useCallback(() => {
    if (!insight) return;
    
    navigator.clipboard.writeText(JSON.stringify(insight, null, 2))
      .then(() => {
        toast({
          title: 'Copied',
          description: 'Insight JSON copied to clipboard',
        });
      })
      .catch(() => {
        toast({
          title: 'Failed to copy',
          description: 'Could not copy to clipboard',
          variant: 'destructive',
        });
      });
  }, [insight]);

  const priorityColors: Record<string, string> = {
    P1: 'bg-red-500/20 text-red-400 border-red-500/30',
    P2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    P3: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const timeAgo = insight ? Math.round((Date.now() - insight.createdAt) / 60000) : 0;

  return (
    <Card 
      data-testid="journal-insight-card"
      className="border-border/50 bg-muted/20"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI Insight</span>
          </div>
          
          {state === 'ready' && (
            <div className="flex items-center gap-1">
              <Button
                data-testid="journal-insight-regenerate"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleGenerate(true)}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
              <Button
                data-testid="journal-insight-copy"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Idle state */}
        {state === 'idle' && (
          <div className="flex flex-col items-center py-4 gap-3">
            <p className="text-sm text-muted-foreground text-center">
              Generate an AI-powered insight for this entry
            </p>
            <Button
              data-testid="journal-insight-generate"
              variant="secondary"
              size="sm"
              onClick={() => handleGenerate(false)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        )}

        {/* Loading state */}
        {state === 'loading' && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/6" />
            </div>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div 
            data-testid="journal-insight-error"
            className="flex flex-col items-center py-4 gap-3"
          >
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive text-center">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerate(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Blocked state */}
        {state === 'blocked' && (
          <div 
            data-testid="journal-insight-blocked"
            className="flex flex-col items-center py-4 gap-3"
          >
            <Ban className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Daily insights limit reached ({getDailyInsightCalls()}/{getDailyInsightLimit(settings)})
            </p>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href="/settings">Go to Settings</a>
            </Button>
          </div>
        )}

        {/* Ready state */}
        {state === 'ready' && insight && (
          <div className="space-y-3">
            {/* Summary */}
            <p className="text-sm text-foreground leading-relaxed line-clamp-2">
              {insight.summary}
            </p>

            {/* Top improvements */}
            {insight.improvements.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Top improvements
                </span>
                <div className="space-y-1.5">
                  {insight.improvements.map((imp, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2"
                    >
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-5 shrink-0",
                          priorityColors[imp.priority]
                        )}
                      >
                        {imp.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {imp.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  insight.meta.cache === 'hit' 
                    ? 'text-emerald-400 border-emerald-500/30'
                    : 'text-amber-400 border-amber-500/30'
                )}
              >
                {insight.meta.cache === 'hit' ? (
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                ) : null}
                cache: {insight.meta.cache}
              </Badge>
              
              <span className="text-[10px] text-muted-foreground">
                confidence: {Math.round(insight.confidence * 100)}%
              </span>
              
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {timeAgo < 1 ? 'just now' : `${timeAgo} min ago`}
              </span>
              
              {isOverLimit && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0 text-amber-400 border-amber-500/30"
                >
                  over limit
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
