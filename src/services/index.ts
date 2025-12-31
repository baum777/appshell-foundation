/**
 * Services Index
 * 
 * Zentraler Export für alle Services
 */

// API Client
export { apiClient, ApiClient } from './api/client';
export type { ApiClientConfig, ApiResponse, ApiError } from './api/client';

// Trading Services
export { journalService } from './trading/journal.service';
export type {
  JournalEntry,
  JournalEntryInput,
  JournalFilters,
  JournalStats,
} from './trading/journal.service';

// Analytics Services
export { performanceService } from './analytics/performance.service';
export type {
  PerformanceMetrics,
  PerformanceByPeriod,
  PerformanceByStrategy,
  PerformanceBySymbol,
  DateRange,
} from './analytics/performance.service';

// Auth Services
export { authService } from './auth/auth.service';
export type {
  User,
  UserPreferences,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthResponse,
} from './auth/auth.service';
