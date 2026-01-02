/**
 * Grok Pulse API Client
 * Fetches sentiment snapshot, history, and last-run metadata
 */

import type {
  GrokSentimentSnapshot,
  PulseHistoryPoint,
  PulseMetaLastRun,
  GrokSnapshotResponse,
  GrokHistoryResponse,
  GrokLastRunResponse,
  GrokPulseApiError,
} from '../../../shared/contracts/grokPulse';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ErrorResponse {
  error: GrokPulseApiError;
}

async function handleResponse<T>(response: Response, endpoint: string): Promise<T> {
  if (!response.ok) {
    let errorMessage = `GrokPulse ${endpoint} failed (${response.status})`;
    
    try {
      const errorBody = await response.json() as ErrorResponse;
      if (errorBody.error) {
        errorMessage = `${errorMessage}: ${errorBody.error.code} - ${errorBody.error.message}`;
      }
    } catch {
      // JSON parse failed, use default message
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json() as Promise<T>;
}

/**
 * Fetch sentiment snapshot for a token address
 */
export async function fetchGrokSnapshot(address: string): Promise<GrokSentimentSnapshot | null> {
  const response = await fetch(`${API_BASE}/grok-pulse/snapshot/${encodeURIComponent(address)}`);
  const data = await handleResponse<GrokSnapshotResponse>(response, 'snapshot');
  return data.snapshot;
}

/**
 * Fetch score history for sparkline visualization
 */
export async function fetchGrokHistory(address: string): Promise<PulseHistoryPoint[]> {
  const response = await fetch(`${API_BASE}/grok-pulse/history/${encodeURIComponent(address)}`);
  const data = await handleResponse<GrokHistoryResponse>(response, 'history');
  return data.history;
}

/**
 * Fetch last run metadata
 */
export async function fetchGrokLastRun(): Promise<PulseMetaLastRun | null> {
  const response = await fetch(`${API_BASE}/grok-pulse/meta/last-run`);
  const data = await handleResponse<GrokLastRunResponse>(response, 'last-run');
  return data.lastRun;
}
