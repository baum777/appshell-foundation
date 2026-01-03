import type { JournalInsightV1, ExtendedJournalEntry } from './types';

/**
 * Local deterministic insight engine
 * Generates insights based on heuristics without backend
 */
export function generateLocalInsight(entry: ExtendedJournalEntry): JournalInsightV1 {
  const startTime = performance.now();
  
  const findings: JournalInsightV1['findings'] = [];
  const improvements: JournalInsightV1['improvements'] = [];
  
  // === FINDINGS (based on entry state) ===
  
  // Missing exit/result
  if (!entry.exitPrice && !entry.result) {
    findings.push({
      title: 'Missing exit/result data',
      detail: 'Trade outcome not recorded. Complete this to track performance.',
      evidence: [{ entryId: entry.id, field: 'exitPrice' }, { entryId: entry.id, field: 'result' }],
    });
  }
  
  // Risk above default
  if (entry.riskPercent && entry.riskPercent > 3) {
    findings.push({
      title: 'Risk above default threshold',
      detail: `Risk set to ${entry.riskPercent}% which exceeds the recommended 2-3% per trade.`,
      evidence: [{ entryId: entry.id, field: 'riskPercent', value: `${entry.riskPercent}%` }],
    });
  }
  
  // Notes too short
  if (!entry.notes || entry.notes.length < 20) {
    findings.push({
      title: 'Notes too short',
      detail: 'Brief notes may be hard to review later. Consider adding more context.',
      evidence: [{ entryId: entry.id, field: 'notes', value: entry.notes || '(empty)' }],
    });
  }
  
  // Pending status
  if (entry.status === 'pending') {
    findings.push({
      title: 'Pending review',
      detail: 'Entry awaits confirmation. Verify key fields before marking complete.',
      evidence: [{ entryId: entry.id, field: 'status', value: 'pending' }],
    });
  }
  
  // Missing stop/invalidation
  if (!entry.stopLoss && !entry.invalidation) {
    findings.push({
      title: 'No stop or invalidation defined',
      detail: 'Risk management requires clear exit criteria.',
      evidence: [{ entryId: entry.id, field: 'stopLoss' }, { entryId: entry.id, field: 'invalidation' }],
    });
  }
  
  // === IMPROVEMENTS (prioritized) ===
  
  // P1: Exit reasoning
  if (!entry.exitPrice && !entry.result) {
    improvements.push({
      action: 'Add exit reasoning',
      why: 'Helps identify what drove the decision to close the trade.',
      priority: 'P1',
      evidence: [{ entryId: entry.id, field: 'exitPrice' }],
    });
  }
  
  // P1: Stop/invalidation
  if (!entry.stopLoss && !entry.invalidation) {
    improvements.push({
      action: 'Define stop or invalidation',
      why: 'Clear invalidation protects capital and removes emotion from exits.',
      priority: 'P1',
      evidence: [{ entryId: entry.id, field: 'stopLoss' }],
    });
  }
  
  // P2: Risk reduction
  if (entry.riskPercent && entry.riskPercent > 2) {
    improvements.push({
      action: 'Consider reducing risk to default 2%',
      why: 'Smaller position sizes allow for more attempts and reduce drawdown.',
      priority: 'P2',
      evidence: [{ entryId: entry.id, field: 'riskPercent' }],
    });
  }
  
  // P2: Emotion tag
  if (!entry.emotionTag) {
    improvements.push({
      action: 'Add emotion tag',
      why: 'Tracking emotions helps identify patterns affecting decision quality.',
      priority: 'P2',
      evidence: [{ entryId: entry.id, field: 'emotionTag' }],
    });
  }
  
  // P3: Screenshot/chart reference
  if (!entry.attachments?.length && !entry.chartLink) {
    improvements.push({
      action: 'Add a screenshot or chart reference',
      why: 'Visual context makes future review more effective.',
      priority: 'P3',
      evidence: [{ entryId: entry.id, field: 'attachments' }],
    });
  }
  
  // P3: Session tag
  if (!entry.sessionTag) {
    improvements.push({
      action: 'Tag the session (Asia/London/NY)',
      why: 'Session tagging helps identify optimal trading times.',
      priority: 'P3',
      evidence: [{ entryId: entry.id, field: 'sessionTag' }],
    });
  }
  
  // Limit to top 3 improvements
  const topImprovements = improvements.slice(0, 3);
  
  // Calculate confidence and strength
  const hasExplicitMissing = findings.some(f => 
    f.title.includes('Missing') || f.title.includes('No stop')
  );
  
  const confidence = hasExplicitMissing ? 0.9 : 
                     findings.length > 2 ? 0.75 : 
                     findings.length > 0 ? 0.6 : 0.5;
  
  const strength: JournalInsightV1['strength'] = 
    findings.length >= 3 ? 'high' :
    findings.length >= 1 ? 'medium' : 'low';
  
  // Generate summary
  const summaryParts: string[] = [];
  
  if (findings.length === 0) {
    summaryParts.push('Entry looks complete.');
  } else {
    if (findings.some(f => f.title.includes('Missing exit'))) {
      summaryParts.push('Missing trade outcome.');
    }
    if (findings.some(f => f.title.includes('Risk above'))) {
      summaryParts.push('Risk elevated.');
    }
    if (findings.some(f => f.title.includes('Pending'))) {
      summaryParts.push('Needs confirmation.');
    }
    if (findings.some(f => f.title.includes('stop'))) {
      summaryParts.push('No clear invalidation.');
    }
  }
  
  const summary = summaryParts.join(' ').slice(0, 160);
  
  const endTime = performance.now();
  
  return {
    insightId: `insight_${entry.id}_${Date.now()}`,
    version: 'insight_v1',
    entryId: entry.id,
    createdAt: Date.now(),
    summary: summary || 'Review this entry to improve your trading journal.',
    confidence,
    strength,
    findings: findings.slice(0, 5), // Max 5 findings
    improvements: topImprovements,
    meta: {
      cache: 'miss',
      latencyMs: Math.round(endTime - startTime),
    },
  };
}
