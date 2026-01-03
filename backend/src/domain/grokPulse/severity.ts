import type { GrokSentimentSnapshot } from './types.js';

export type PulseSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const SEVERITY_LEVELS: PulseSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function getLevelIndex(severity: PulseSeverity): number {
  return SEVERITY_LEVELS.indexOf(severity);
}

function getSeverityFromIndex(index: number): PulseSeverity {
  if (index >= SEVERITY_LEVELS.length) return 'CRITICAL';
  if (index < 0) return 'LOW';
  return SEVERITY_LEVELS[index];
}

export function calculateSeverity(snapshot: Pick<GrokSentimentSnapshot, 'score' | 'label' | 'delta' | 'low_confidence'>): PulseSeverity {
  const { score, label, delta = 0, low_confidence } = snapshot;

  // 1. Base Severity from Matrix
  let severity: PulseSeverity = 'LOW';

  if (label === 'RUG' || label === 'DEAD') {
    severity = 'CRITICAL';
  } else if (score >= 80 || score <= -65) {
    severity = 'CRITICAL';
  } else if ((score >= 50 && score <= 79) || (score >= -64 && score <= -40)) {
    severity = 'HIGH';
  } else if ((score >= 30 && score <= 49) || (score >= -39 && score <= -25)) {
    severity = 'MEDIUM';
  } else {
    // Score -14..+29 covers the rest roughly, defaulting to LOW
    severity = 'LOW';
  }

  // 2. Delta-based Severity Boost
  // Conditions: abs(delta) >= 30 OR delta <= -25 OR delta >= 25
  // These essentially boil down to: delta >= 25 OR delta <= -25 (since abs(30) >= 25)
  // So if abs(delta) >= 25 -> Boost +1
  if (Math.abs(delta) >= 25) {
    const currentIndex = getLevelIndex(severity);
    severity = getSeverityFromIndex(currentIndex + 1);
  }

  // 3. Low-confidence Penalty
  if (low_confidence) {
    // Bullish/Positive Snapshots (Score >= 0) -> Max Medium
    if (score >= 0) {
      const currentIndex = getLevelIndex(severity);
      const mediumIndex = getLevelIndex('MEDIUM');
      if (currentIndex > mediumIndex) {
        severity = 'MEDIUM';
      }
    }
    // Bearish/Negative Snapshots -> No penalty (can be critical due to rug risk)
  }

  return severity;
}

