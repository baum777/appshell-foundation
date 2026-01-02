/**
 * Pulse Severity Helper
 * Derives alert severity from snapshot fields (frontend mirror of backend rules)
 */

import type { GrokSentimentSnapshot } from '../../../shared/contracts/grokPulse';
import { PulseSentimentLabel } from '../../../shared/contracts/grokPulse';

export type PulseSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

const SEVERITY_ORDER: PulseSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Bump severity one level up (max Critical)
 */
export function bumpSeverity(level: PulseSeverity): PulseSeverity {
  const idx = SEVERITY_ORDER.indexOf(level);
  return SEVERITY_ORDER[Math.min(idx + 1, SEVERITY_ORDER.length - 1)];
}

/**
 * Get severity based on snapshot fields
 * Rules:
 * - RUG or DEAD label → Critical
 * - score >= 80 or score <= -65 → Critical
 * - score >= 50 or score <= -40 → High
 * - score >= 30 or score <= -25 → Medium
 * - else → Low
 * 
 * Delta boost: if |delta| >= 30, bump one level
 * Low-confidence cap: if low_confidence && score > 0, max Medium
 */
export function getPulseSeverity(snapshot: GrokSentimentSnapshot): PulseSeverity {
  const { label, score, delta, low_confidence } = snapshot;
  
  // Base severity from label
  if (label === PulseSentimentLabel.RUG || label === PulseSentimentLabel.DEAD) {
    return 'Critical';
  }
  
  // Base severity from score
  let severity: PulseSeverity;
  
  if (score >= 80 || score <= -65) {
    severity = 'Critical';
  } else if (score >= 50 || score <= -40) {
    severity = 'High';
  } else if (score >= 30 || score <= -25) {
    severity = 'Medium';
  } else {
    severity = 'Low';
  }
  
  // Delta boost: if delta exists and |delta| >= 30, bump one level
  if (delta !== undefined && Math.abs(delta) >= 30) {
    severity = bumpSeverity(severity);
  }
  
  // Low-confidence cap: if low_confidence && positive score, cap at Medium
  if (low_confidence === true && score > 0) {
    const idx = SEVERITY_ORDER.indexOf(severity);
    const mediumIdx = SEVERITY_ORDER.indexOf('Medium');
    if (idx > mediumIdx) {
      severity = 'Medium';
    }
  }
  
  return severity;
}

/**
 * Get severity color class (using existing design tokens)
 */
export function getSeverityColorClass(severity: PulseSeverity): string {
  switch (severity) {
    case 'Critical':
      return 'text-destructive';
    case 'High':
      return 'text-orange-500';
    case 'Medium':
      return 'text-amber-500';
    case 'Low':
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get severity badge variant
 */
export function getSeverityBadgeVariant(severity: PulseSeverity): 'destructive' | 'secondary' | 'outline' | 'default' {
  switch (severity) {
    case 'Critical':
      return 'destructive';
    case 'High':
      return 'default';
    case 'Medium':
      return 'secondary';
    case 'Low':
    default:
      return 'outline';
  }
}

/**
 * Get severity border class for card accent
 */
export function getSeverityBorderClass(severity: PulseSeverity): string {
  switch (severity) {
    case 'Critical':
      return 'border-l-destructive';
    case 'High':
      return 'border-l-orange-500';
    case 'Medium':
      return 'border-l-amber-500';
    case 'Low':
    default:
      return 'border-l-border';
  }
}
