import type { GrokSentimentSnapshot } from './types.js';
import mappingRaw from './defaultPulseMapping.json';

const mapping = mappingRaw as PulseMappingConfig;

// Types for the JSON structure
interface PulseMappingConfig {
  version: string;
  scoreBands: Array<{
    id: string;
    min: number;
    max: number;
    label: string;
    sentiment_term: string;
    default_cta: string;
    cta_phrase: string;
  }>;
  overrides: {
    labelHardRules: Array<{
      when: { label: string };
      set: OverrideSet;
    }>;
    confidenceRules: Array<{
      when: { minConfidence?: number; minScore?: number; low_confidence?: boolean; maxScore?: number };
      set: OverrideSet;
    }>;
    deltaRules: Array<{
      when: { minDelta?: number; minScore?: number; maxDelta?: number; maxScore?: number };
      set: OverrideSet;
    }>;
  };
  lexicon: {
    sentiment_terms: string[];
    cta_phrases: string[];
  };
}

interface OverrideSet {
  sentiment_term?: string;
  cta_phrase?: string;
  default_cta?: string;
}

export const SENTIMENT_TERMS = mapping.lexicon.sentiment_terms;
export const CTA_PHRASES = mapping.lexicon.cta_phrases;

function findOverride(snapshot: Pick<GrokSentimentSnapshot, 'score' | 'label' | 'low_confidence' | 'delta' | 'confidence'>): OverrideSet | null {
  const { score, label, low_confidence, delta = 0, confidence } = snapshot;

  // 1. Label Hard Rules
  for (const rule of mapping.overrides.labelHardRules) {
    if (rule.when.label === label) return rule.set;
  }

  // 2. Confidence Rules
  for (const rule of mapping.overrides.confidenceRules) {
    const w = rule.when;
    let match = true;
    if (w.minConfidence !== undefined && confidence < w.minConfidence / 100) match = false; // Assuming confidence is 0-1 but JSON uses 90 for 90%? Wait, check JSON. JSON says minConfidence: 90. Snapshot uses 0-1.
    if (w.low_confidence !== undefined && w.low_confidence !== low_confidence) match = false;
    if (w.minScore !== undefined && score < w.minScore) match = false;
    if (w.maxScore !== undefined && score > w.maxScore) match = false;
    
    // Correction: Snapshot confidence is 0-1. JSON minConfidence 90 likely means 0.9.
    // However, if JSON says 90, I should probably check if it means 90 or 0.9.
    // Looking at JSON: "minConfidence": 90. Typically implies percentage.
    // Code in lexicon.ts used `confidence >= 0.9`. 
    // I will assume JSON 90 -> 0.9 in snapshot.
    if (w.minConfidence !== undefined) {
         if (confidence < w.minConfidence / 100) match = false; 
    }

    if (match) return rule.set;
  }

  // 3. Delta Rules
  for (const rule of mapping.overrides.deltaRules) {
    const w = rule.when;
    let match = true;
    if (w.minDelta !== undefined && delta < w.minDelta) match = false;
    if (w.maxDelta !== undefined && delta > w.maxDelta) match = false;
    if (w.minScore !== undefined && score < w.minScore) match = false;
    if (w.maxScore !== undefined && score > w.maxScore) match = false;

    if (match) return rule.set;
  }

  return null;
}

function findBand(score: number) {
  return mapping.scoreBands.find(b => score >= b.min && score <= b.max);
}

export function mapSentimentTerm(snapshot: Pick<GrokSentimentSnapshot, 'score' | 'label' | 'low_confidence' | 'delta' | 'confidence'>): string {
  const override = findOverride(snapshot);
  if (override?.sentiment_term) return override.sentiment_term;

  const band = findBand(snapshot.score);
  return band?.sentiment_term ?? 'choppy market'; // Fallback
}

export function mapCtaPhrase(snapshot: Pick<GrokSentimentSnapshot, 'cta' | 'score' | 'label' | 'delta' | 'low_confidence' | 'confidence'>): string {
  const override = findOverride(snapshot);
  if (override?.cta_phrase) return override.cta_phrase;

  const band = findBand(snapshot.score);
  return band?.cta_phrase ?? 'watch closely'; // Fallback
}
