import type { OracleDailyFeed, OracleInsight, OraclePinned } from './types.js';

/**
 * Oracle Daily Feed Generator
 * Creates deterministic daily content based on date
 * 
 * // BACKEND_TODO: Replace with real content generation/curation
 */

const THEMES = [
  'Market Sentiment',
  'Technical Analysis',
  'On-Chain Metrics',
  'Macro Trends',
  'Token Analysis',
  'Risk Management',
];

const INSIGHT_TEMPLATES = [
  {
    titleTemplate: 'Bitcoin Dominance {direction}',
    summaryTemplate: 'BTC dominance has {moved} to {value}%. This typically signals {implication} for altcoins.',
  },
  {
    titleTemplate: 'ETH Gas Fees {level}',
    summaryTemplate: 'Ethereum gas fees are currently {level}. {recommendation} for on-chain activity.',
  },
  {
    titleTemplate: 'Fear & Greed Index: {value}',
    summaryTemplate: 'Market sentiment is in {sentiment} territory. Historical data suggests {action}.',
  },
  {
    titleTemplate: 'DeFi TVL {change}',
    summaryTemplate: 'Total Value Locked in DeFi protocols has {changed} {percent}% this week. {analysis}',
  },
  {
    titleTemplate: 'Stablecoin Flows {direction}',
    summaryTemplate: '{amount}B in stablecoins {moved} exchanges. This is typically {signal}.',
  },
];

const TAKEAWAY_TEMPLATES = [
  {
    title: 'Market is showing strength',
    summary: 'Multiple indicators suggest bullish momentum. Consider scaling into positions but maintain risk management.',
  },
  {
    title: 'Caution advised',
    summary: 'Mixed signals across timeframes. Wait for confirmation before taking new positions.',
  },
  {
    title: 'Range-bound conditions',
    summary: 'Market is consolidating. Look for breakout or breakdown levels for directional trades.',
  },
  {
    title: 'Risk-off environment',
    summary: 'Defensive positioning recommended. Consider reducing exposure and tightening stops.',
  },
  {
    title: 'Altseason indicators active',
    summary: 'Rotation into altcoins detected. Mid-cap tokens showing relative strength.',
  },
];

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateInsight(dateStr: string, index: number): OracleInsight {
  const hash = hashDate(`${dateStr}:insight:${index}`);
  const template = INSIGHT_TEMPLATES[hash % INSIGHT_TEMPLATES.length];
  const theme = THEMES[hash % THEMES.length];
  
  // Fill in template placeholders with deterministic values
  const values = {
    direction: hash % 2 === 0 ? 'Rising' : 'Falling',
    moved: hash % 2 === 0 ? 'increased' : 'decreased',
    value: 40 + (hash % 25),
    implication: hash % 2 === 0 ? 'risk-on conditions' : 'potential rotation',
    level: ['Low', 'Moderate', 'High', 'Very High'][hash % 4],
    recommendation: hash % 2 === 0 ? 'Good time' : 'Consider waiting',
    sentiment: ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'][hash % 5],
    action: hash % 2 === 0 ? 'contrarian opportunities' : 'trend continuation',
    change: hash % 2 === 0 ? 'Increased' : 'Decreased',
    changed: hash % 2 === 0 ? 'increased' : 'decreased',
    percent: 2 + (hash % 15),
    analysis: 'Monitor for continuation.',
    amount: (hash % 5) + 1,
    signal: hash % 2 === 0 ? 'bullish' : 'bearish',
  };
  
  let title = template.titleTemplate;
  let summary = template.summaryTemplate;
  
  for (const [key, value] of Object.entries(values)) {
    title = title.replace(`{${key}}`, String(value));
    summary = summary.replace(`{${key}}`, String(value));
  }
  
  return {
    id: `insight-${dateStr}-${index}`,
    title,
    summary,
    theme,
    isRead: false,
    createdAt: `${dateStr}T08:00:00.000Z`,
  };
}

function generateTakeaway(dateStr: string): OraclePinned {
  const hash = hashDate(dateStr);
  const template = TAKEAWAY_TEMPLATES[hash % TAKEAWAY_TEMPLATES.length];
  
  return {
    id: 'today-takeaway',
    title: template.title,
    summary: template.summary,
    isRead: false,
    createdAt: `${dateStr}T06:00:00.000Z`,
  };
}

export function generateDailyFeed(dateStr: string): OracleDailyFeed {
  const hash = hashDate(dateStr);
  const insightCount = 3 + (hash % 3); // 3-5 insights per day
  
  const insights: OracleInsight[] = [];
  for (let i = 0; i < insightCount; i++) {
    insights.push(generateInsight(dateStr, i));
  }
  
  return {
    pinned: generateTakeaway(dateStr),
    insights,
  };
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
