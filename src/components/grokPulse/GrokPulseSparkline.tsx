/**
 * GrokPulseSparkline - Minimal SVG sparkline for score history
 */

import type { PulseHistoryPoint } from '../../../shared/contracts/grokPulse';
import type { PulseSeverity } from './severity';
import { getSeverityColorClass } from './severity';
import { cn } from '@/lib/utils';

interface GrokPulseSparklineProps {
  history: PulseHistoryPoint[];
  severity?: PulseSeverity;
  className?: string;
}

export function GrokPulseSparkline({
  history,
  severity = 'Low',
  className,
}: GrokPulseSparklineProps) {
  // Handle empty history
  if (!history || history.length === 0) {
    return (
      <div
        data-testid="grok-pulse-sparkline"
        className={cn(
          'flex items-center justify-center h-8 text-muted-foreground text-xs',
          className
        )}
      >
        —
      </div>
    );
  }

  // SVG dimensions
  const width = 120;
  const height = 32;
  const padding = 2;

  // Calculate bounds
  const scores = history.map((p) => p.score);
  const minScore = Math.min(...scores, -100);
  const maxScore = Math.max(...scores, 100);
  const range = maxScore - minScore || 1;

  // Generate points for polyline
  const points = history.map((point, index) => {
    const x = padding + (index / Math.max(history.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((point.score - minScore) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  // Get stroke color based on severity
  const strokeColorClass = getSeverityColorClass(severity);

  return (
    <svg
      data-testid="grok-pulse-sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      role="img"
      aria-label="Score history sparkline"
    >
      {/* Zero line */}
      <line
        x1={padding}
        y1={height / 2}
        x2={width - padding}
        y2={height / 2}
        className="stroke-border"
        strokeWidth="1"
        strokeDasharray="2,2"
        opacity="0.5"
      />
      {/* Sparkline */}
      <polyline
        points={points}
        fill="none"
        className={cn('stroke-current', strokeColorClass)}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {history.length > 0 && (
        <circle
          cx={width - padding}
          cy={
            height -
            padding -
            ((history[history.length - 1].score - minScore) / range) *
              (height - 2 * padding)
          }
          r="2"
          className={cn('fill-current', strokeColorClass)}
        />
      )}
    </svg>
  );
}
