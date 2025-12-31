// Shared type contracts for stub data - single source of truth

export interface UserStub {
  walletConnected: boolean;
}

export interface AlertStub {
  id: string;
  symbol: string;
  condition: string;
  targetPrice: number;
  status: 'active' | 'paused' | 'triggered';
  createdAt: string;
}

export interface JournalEntryStub {
  id: string;
  side: 'BUY' | 'SELL';
  status: 'pending' | 'confirmed' | 'archived';
  timestamp: string;
  summary: string;
}

export interface LessonStub {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  locked: boolean;
  progress: number;
}

export interface WatchItemStub {
  id: string;
  symbol: string;
  name: string;
}

export interface OracleStub {
  id: string;
  title: string;
  summary: string;
  theme: string;
  isRead: boolean;
  createdAt: string;
}

// Dashboard-specific types
export interface DashboardMetricStub {
  id: string;
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface RecentActivityStub {
  id: string;
  type: 'trade' | 'alert' | 'lesson';
  title: string;
  description: string;
  timestamp: string;
}
