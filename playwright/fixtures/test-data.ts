/**
 * Test Fixtures und Mock-Daten für Playwright Tests
 */

export const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  preferences: {
    theme: 'light' as const,
    language: 'en' as const,
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      alerts: true,
    },
    trading: {
      defaultStrategy: 'Momentum',
      defaultPositionSize: 100,
      riskPerTrade: 2,
    },
  },
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: '2024-12-31T00:00:00Z',
};

export const mockJournalEntry = {
  id: 'entry-1',
  date: '2024-12-31',
  symbol: 'AAPL',
  direction: 'long' as const,
  entryPrice: 150.0,
  exitPrice: 155.0,
  quantity: 10,
  pnl: 50.0,
  pnlPercent: 3.33,
  strategy: 'Momentum',
  tags: ['tech', 'breakout'],
  screenshots: [],
  notes: 'Strong momentum, broke resistance',
  emotions: ['confident', 'focused'],
  mistakes: [],
  createdAt: '2024-12-31T10:00:00Z',
  updatedAt: '2024-12-31T10:00:00Z',
};

export const mockJournalEntries = [
  mockJournalEntry,
  {
    ...mockJournalEntry,
    id: 'entry-2',
    symbol: 'TSLA',
    direction: 'short' as const,
    entryPrice: 250.0,
    exitPrice: 245.0,
    pnl: -50.0,
    pnlPercent: -2.0,
  },
  {
    ...mockJournalEntry,
    id: 'entry-3',
    symbol: 'MSFT',
    entryPrice: 350.0,
    exitPrice: 360.0,
    pnl: 100.0,
    pnlPercent: 2.86,
  },
];

export const mockPerformanceMetrics = {
  period: {
    start: '2024-01-01',
    end: '2024-12-31',
  },
  overview: {
    totalTrades: 150,
    winningTrades: 90,
    losingTrades: 60,
    winRate: 60,
    totalPnl: 5000,
    averagePnl: 33.33,
    profitFactor: 1.5,
  },
  streaks: {
    currentWinStreak: 3,
    currentLossStreak: 0,
    longestWinStreak: 8,
    longestLossStreak: 5,
  },
  timing: {
    averageHoldingTime: 120,
    bestTimeOfDay: '10:00',
    worstTimeOfDay: '15:00',
    bestDayOfWeek: 'Tuesday',
    worstDayOfWeek: 'Friday',
  },
  riskMetrics: {
    sharpeRatio: 1.5,
    maxDrawdown: 500,
    maxDrawdownPercent: 10,
    recoveryFactor: 10,
    averageRiskRewardRatio: 2.0,
  },
};

export const mockWatchlistItems = [
  {
    id: 'watch-1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 150.0,
    change: 2.5,
    changePercent: 1.69,
    notes: 'Testing resistance at $155',
  },
  {
    id: 'watch-2',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 250.0,
    change: -5.0,
    changePercent: -1.96,
    notes: 'Oversold, potential bounce',
  },
  {
    id: 'watch-3',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 360.0,
    change: 3.0,
    changePercent: 0.84,
    notes: 'Strong uptrend',
  },
];

export const mockOracleInsights = [
  {
    id: 'insight-1',
    category: 'market' as const,
    title: 'Market Trend Analysis',
    content: 'Current market shows bullish momentum with increased volume.',
    confidence: 85,
    createdAt: '2024-12-31T09:00:00Z',
    isPinned: false,
  },
  {
    id: 'insight-2',
    category: 'personal' as const,
    title: 'Performance Improvement',
    content: 'Your win rate has improved by 5% this month. Great job!',
    confidence: 90,
    createdAt: '2024-12-31T08:00:00Z',
    isPinned: true,
  },
  {
    id: 'insight-3',
    category: 'educational' as const,
    title: 'Risk Management Tip',
    content: 'Consider reducing position size when trading against the trend.',
    confidence: 95,
    createdAt: '2024-12-30T10:00:00Z',
    isPinned: false,
  },
];

export const mockLessons = [
  {
    id: 'lesson-1',
    title: 'Introduction to Technical Analysis',
    description: 'Learn the basics of chart reading and technical indicators',
    duration: 30,
    difficulty: 'beginner' as const,
    category: 'Technical Analysis',
    progress: 100,
    isLocked: false,
  },
  {
    id: 'lesson-2',
    title: 'Risk Management Fundamentals',
    description: 'Master the art of protecting your capital',
    duration: 45,
    difficulty: 'beginner' as const,
    category: 'Risk Management',
    progress: 50,
    isLocked: false,
  },
  {
    id: 'lesson-3',
    title: 'Advanced Chart Patterns',
    description: 'Identify and trade complex chart formations',
    duration: 60,
    difficulty: 'advanced' as const,
    category: 'Technical Analysis',
    progress: 0,
    isLocked: true,
  },
];

export const mockAlerts = [
  {
    id: 'alert-1',
    symbol: 'AAPL',
    type: 'price' as const,
    condition: 'above' as const,
    value: 155,
    currentValue: 150,
    isActive: true,
    createdAt: '2024-12-30T10:00:00Z',
    triggeredAt: null,
  },
  {
    id: 'alert-2',
    symbol: 'TSLA',
    type: 'price' as const,
    condition: 'below' as const,
    value: 240,
    currentValue: 250,
    isActive: true,
    createdAt: '2024-12-29T15:00:00Z',
    triggeredAt: null,
  },
  {
    id: 'alert-3',
    symbol: 'MSFT',
    type: 'volume' as const,
    condition: 'above' as const,
    value: 1000000,
    currentValue: 800000,
    isActive: false,
    createdAt: '2024-12-28T09:00:00Z',
    triggeredAt: '2024-12-30T14:30:00Z',
  },
];

/**
 * Helper function to wait for network idle
 */
export async function waitForNetworkIdle(page: any, timeout = 2000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Helper function to wait for element with timeout
 */
export async function waitForElement(page: any, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { timeout, state: 'visible' });
}

/**
 * Helper function to take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: any, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `screenshots/${name}-${timestamp}.png` });
}
