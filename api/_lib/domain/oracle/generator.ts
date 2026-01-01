/**
 * Oracle Feed Generator
 * Generates deterministic daily oracle content
 */

import type { OracleDailyFeed, OracleInsight, OraclePinnedTakeaway } from '../../types';

// Deterministic hash function
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Takeaway templates
const TAKEAWAY_TEMPLATES = [
  {
    title: 'Market showing consolidation signals',
    summary: 'Focus on range-bound strategies today. Major support and resistance levels are holding, suggesting a period of accumulation before the next move.',
  },
  {
    title: 'Momentum building in key sectors',
    summary: 'Watch for breakout setups in high-volume tokens. Volume precedes price - early signs of institutional interest emerging.',
  },
  {
    title: 'Risk-off sentiment prevailing',
    summary: 'Defensive positioning recommended. Market breadth weakening suggests caution. Reduce position sizes and tighten stops.',
  },
  {
    title: 'Bullish divergence forming',
    summary: 'Technical indicators showing hidden strength despite price weakness. Potential accumulation phase in progress.',
  },
  {
    title: 'Volatility compression detected',
    summary: 'Tight ranges often precede significant moves. Prepare for expansion - have your watchlist and entry criteria ready.',
  },
  {
    title: 'Trend continuation patterns emerging',
    summary: 'Higher timeframe trends remain intact. Look for pullback entries aligned with the dominant trend.',
  },
  {
    title: 'Mixed signals across timeframes',
    summary: 'Conflicting signals between short and long-term charts. Best to wait for alignment before committing capital.',
  },
];

// Insight templates
const INSIGHT_TEMPLATES = [
  {
    title: 'Volume Profile Analysis',
    summary: 'Point of Control shifted higher indicating buyer absorption at key levels.',
    theme: 'Volume Analysis',
  },
  {
    title: 'Moving Average Convergence',
    summary: 'Short-term MAs approaching long-term MAs. Watch for golden/death cross signals.',
    theme: 'Technical Analysis',
  },
  {
    title: 'RSI Divergence Alert',
    summary: 'Price making new highs while RSI fails to confirm. Potential exhaustion signal.',
    theme: 'Momentum Trading',
  },
  {
    title: 'Support Zone Test',
    summary: 'Major support level being tested for the third time. Failed breakdowns often lead to strong bounces.',
    theme: 'Market Structure',
  },
  {
    title: 'Fear & Greed Indicator',
    summary: 'Extreme readings suggest contrarian opportunity. Smart money often positions against the crowd.',
    theme: 'Psychology',
  },
  {
    title: 'Correlation Breakdown',
    summary: 'Traditional correlations decoupling. Independent price action emerging in select assets.',
    theme: 'Macro Trends',
  },
  {
    title: 'Trend Line Respect',
    summary: 'Long-standing trend line holding. Multiple touches validate the significance of this level.',
    theme: 'Trend Following',
  },
  {
    title: 'Position Sizing Reminder',
    summary: 'Volatility-adjusted position sizing is key. Never risk more than 1-2% on any single trade.',
    theme: 'Risk Management',
  },
  {
    title: 'Order Flow Imbalance',
    summary: 'Large buy orders absorbing selling pressure. Potential accumulation by larger players.',
    theme: 'Volume Analysis',
  },
  {
    title: 'Breakout Confirmation',
    summary: 'Volume expansion on breakout attempt. Follow-through required for confirmation.',
    theme: 'Technical Analysis',
  },
];

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateDailyFeed(dateStr: string): OracleDailyFeed {
  const hash = hashString(`oracle:${dateStr}:v1`);
  
  // Select takeaway
  const takeawayIndex = hash % TAKEAWAY_TEMPLATES.length;
  const takeawayTemplate = TAKEAWAY_TEMPLATES[takeawayIndex];
  
  const pinned: OraclePinnedTakeaway = {
    id: 'today-takeaway',
    title: takeawayTemplate.title,
    summary: takeawayTemplate.summary,
    isRead: false,
    createdAt: `${dateStr}T06:00:00.000Z`,
  };
  
  // Select 3-5 insights based on date hash
  const insightCount = 3 + (hash % 3);
  const insights: OracleInsight[] = [];
  
  for (let i = 0; i < insightCount; i++) {
    const insightHash = hashString(`insight:${dateStr}:${i}`);
    const insightIndex = insightHash % INSIGHT_TEMPLATES.length;
    const template = INSIGHT_TEMPLATES[insightIndex];
    
    // Avoid duplicates
    if (insights.some(ins => ins.title === template.title)) {
      continue;
    }
    
    insights.push({
      id: `insight-${dateStr}-${i}`,
      title: template.title,
      summary: template.summary,
      theme: template.theme,
      isRead: false,
      createdAt: `${dateStr}T${String(6 + i).padStart(2, '0')}:${String(insightHash % 60).padStart(2, '0')}:00.000Z`,
    });
  }
  
  return {
    pinned,
    insights,
  };
}
