/**
 * Oracle Domain Types
 * Matches CONTRACTS.md OracleInsight and OracleDailyFeed schemas
 */

export interface OracleInsight {
  id: string;
  title: string;
  summary: string;
  theme: string;
  isRead: boolean;
  createdAt: string;
}

export interface OraclePinned {
  id: 'today-takeaway';
  title: string;
  summary: string;
  isRead: boolean;
  createdAt: string;
}

export interface OracleDailyFeed {
  pinned: OraclePinned;
  insights: OracleInsight[];
}

export interface OracleReadState {
  id: string;
  isRead: boolean;
  updatedAt: string;
}

// Database row types
export interface OracleDailyRow {
  date: string;
  payload_json: string;
  created_at: string;
}

export interface OracleReadStateRow {
  user_id: string;
  id: string;
  is_read: number;
  updated_at: string;
}
