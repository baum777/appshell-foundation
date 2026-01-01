/**
 * Deterministic TA Report Generator
 * 
 * Generates stable TA analysis based on inputs + time bucket
 * Same input + same day = same output
 * 
 * // BACKEND_TODO: wire GPT vision for real TA analysis
 */

import type { TAReport, TrendDirection, ConfidenceLevel } from '../../types';

function hashInputs(market: string, timeframe: string, replay: boolean, bucket: string): number {
  const str = `${market}:${timeframe}:${replay}:${bucket}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getDayBucket(date: Date): string {
  return date.toISOString().split('T')[0];
}

const TREND_DIRECTIONS: TrendDirection[] = ['Bullish', 'Bearish', 'Range'];
const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['Low', 'Medium', 'High'];

const TREND_SUMMARIES: Record<TrendDirection, string[]> = {
  Bullish: [
    'Price action shows higher highs and higher lows. Momentum indicators confirm upward bias.',
    'Strong bullish structure with volume confirmation. Trend continuation expected.',
    'Bullish breakout confirmed with increasing volume. Watch for pullback entries.',
  ],
  Bearish: [
    'Lower highs and lower lows established. Momentum favors downside continuation.',
    'Bearish structure intact with resistance holding. Risk-off approach recommended.',
    'Distribution pattern visible. Expect further downside with bounces as selling opportunities.',
  ],
  Range: [
    'Price consolidating between defined levels. Wait for breakout for directional bias.',
    'Sideways action with decreasing volatility. Breakout imminent but direction unclear.',
    'Range-bound market. Trade the boundaries or wait for resolution.',
  ],
};

const REVERSAL_CRITERIA = [
  'Break below 20-day EMA with volume',
  'RSI divergence on higher timeframe',
  'Failed breakout at resistance',
  'Volume climax with rejection wick',
  'Break of market structure (lower low in uptrend)',
  'MACD bearish crossover on daily',
  'Loss of key support level',
  'Double top/bottom pattern completion',
];

export function generateTAReport(
  market: string,
  timeframe: string,
  replay: boolean,
  timestamp: Date
): TAReport {
  const bucket = getDayBucket(timestamp);
  const hash = hashInputs(market, timeframe, replay, bucket);
  
  // Generate deterministic base price (simulated current price)
  const basePrice = 10 + (hash % 1000) + (hash % 100) / 100;
  
  // Trend
  const trendDirection = TREND_DIRECTIONS[hash % 3];
  const confidence = CONFIDENCE_LEVELS[(hash >> 2) % 3];
  const summaries = TREND_SUMMARIES[trendDirection];
  const summary = summaries[(hash >> 4) % summaries.length];
  
  // Support levels (2-3 levels below current price)
  const supportCount = 2 + (hash % 2);
  const support = [];
  for (let i = 0; i < supportCount; i++) {
    const level = basePrice * (0.9 - i * 0.05);
    support.push({
      label: `S${i + 1}`,
      level: Math.round(level * 100) / 100,
      note: i === 0 ? 'Key support - watch for reaction' : undefined,
    });
  }
  
  // Resistance levels (2-3 levels above current price)
  const resistanceCount = 2 + ((hash >> 6) % 2);
  const resistance = [];
  for (let i = 0; i < resistanceCount; i++) {
    const level = basePrice * (1.1 + i * 0.05);
    resistance.push({
      label: `R${i + 1}`,
      level: Math.round(level * 100) / 100,
      note: i === 0 ? 'First resistance target' : undefined,
    });
  }
  
  // Take profit levels (based on trend direction)
  const tpMultiplier = trendDirection === 'Bullish' ? 1 : -1;
  const takeProfitLevels = [
    {
      label: 'TP1',
      level: Math.round(basePrice * (1 + 0.05 * tpMultiplier) * 100) / 100,
      rationale: 'Conservative target at first resistance/support',
    },
    {
      label: 'TP2',
      level: Math.round(basePrice * (1 + 0.1 * tpMultiplier) * 100) / 100,
      rationale: 'Extended target based on measured move',
    },
    {
      label: 'TP3',
      level: Math.round(basePrice * (1 + 0.15 * tpMultiplier) * 100) / 100,
      rationale: 'Aggressive target - consider trailing stop',
    },
  ];
  
  // Stop loss levels
  const stopLoss = {
    soft: {
      level: Math.round(basePrice * (1 - 0.03 * tpMultiplier) * 100) / 100,
      rule: 'Close position on close below level',
    },
    hard: {
      level: Math.round(basePrice * (1 - 0.05 * tpMultiplier) * 100) / 100,
      rule: 'Immediate exit on break of level',
    },
  };
  
  // Reversal criteria (select 3-4 relevant ones)
  const criteriaCount = 3 + ((hash >> 8) % 2);
  const reversalCriteria: string[] = [];
  for (let i = 0; i < criteriaCount; i++) {
    const idx = (hash + i * 7) % REVERSAL_CRITERIA.length;
    if (!reversalCriteria.includes(REVERSAL_CRITERIA[idx])) {
      reversalCriteria.push(REVERSAL_CRITERIA[idx]);
    }
  }
  
  return {
    assumptions: {
      market,
      timeframe,
      replay,
      dataSource: 'Deterministic stub generator (v1)',
      timestamp: timestamp.toISOString(),
    },
    trend: {
      direction: trendDirection,
      confidence,
      summary,
    },
    support,
    resistance,
    takeProfitLevels,
    stopLoss,
    reversalCriteria,
  };
}
