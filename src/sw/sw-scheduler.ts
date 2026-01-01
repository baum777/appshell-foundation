/**
 * Service Worker Scheduler
 * Handles polling with backoff and jitter
 * Per SW_SPEC.md
 */

import { POLL_INTERVALS, MAX_BACKOFF } from './sw-contracts';

export interface SchedulerState {
  lastPoll: number;
  backoffStep: number;
  nextPoll: number;
}

const schedulerState: Record<string, SchedulerState> = {
  alerts: {
    lastPoll: 0,
    backoffStep: 0,
    nextPoll: 0,
  },
  oracle: {
    lastPoll: 0,
    backoffStep: 0,
    nextPoll: 0,
  },
};

/**
 * Add jitter to interval (±10%)
 */
function addJitter(interval: number): number {
  const jitterPercent = 0.1;
  const jitter = interval * jitterPercent * (Math.random() * 2 - 1);
  return Math.round(interval + jitter);
}

/**
 * Calculate next poll time with exponential backoff
 */
function calculateBackoff(
  baseInterval: number,
  maxBackoff: number,
  backoffStep: number
): number {
  const backoffInterval = Math.min(maxBackoff, baseInterval * Math.pow(2, backoffStep));
  return addJitter(backoffInterval);
}

/**
 * Check if it's time to poll
 */
export function shouldPoll(domain: 'alerts' | 'oracle'): boolean {
  const state = schedulerState[domain];
  const now = Date.now();
  
  return now >= state.nextPoll;
}

/**
 * Record successful poll
 */
export function recordPollSuccess(domain: 'alerts' | 'oracle'): void {
  const state = schedulerState[domain];
  const now = Date.now();
  const baseInterval = POLL_INTERVALS[domain];
  
  state.lastPoll = now;
  state.backoffStep = 0;
  state.nextPoll = now + addJitter(baseInterval);
}

/**
 * Record failed poll (triggers backoff)
 */
export function recordPollFailure(domain: 'alerts' | 'oracle'): void {
  const state = schedulerState[domain];
  const now = Date.now();
  const baseInterval = POLL_INTERVALS[domain];
  const maxBackoff = MAX_BACKOFF[domain];
  
  state.backoffStep++;
  state.nextPoll = now + calculateBackoff(baseInterval, maxBackoff, state.backoffStep);
}

/**
 * Handle rate limit response
 */
export function handleRateLimit(domain: 'alerts' | 'oracle', retryAfterSeconds?: number): void {
  const state = schedulerState[domain];
  const now = Date.now();
  
  if (retryAfterSeconds) {
    state.nextPoll = now + retryAfterSeconds * 1000;
  } else {
    recordPollFailure(domain);
  }
}

/**
 * Reset scheduler state
 */
export function resetScheduler(domain: 'alerts' | 'oracle'): void {
  schedulerState[domain] = {
    lastPoll: 0,
    backoffStep: 0,
    nextPoll: 0,
  };
}

/**
 * Get scheduler state (for debugging)
 */
export function getSchedulerState(domain: 'alerts' | 'oracle'): SchedulerState {
  return { ...schedulerState[domain] };
}
