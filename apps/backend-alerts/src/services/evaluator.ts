import { AssetSnapshot } from './providers/types';

export type TriggerKind = 'VOLUME_SPIKE' | 'PRICE_MOVE';

export interface TriggerRule {
  kind: TriggerKind;
  windowMinutes: number; 
  minIncreasePct?: number; 
  minMovePct?: number;
}

export interface AlertRules {
  asset: { type: string; id: string };
  triggers: TriggerRule[];
  confirm: { need: number; of: number; withinMinutes: number };
}

export interface EvaluationResult {
  shouldFire: boolean;
  indicatorsHit: string[];
  eventType?: 'TRIGGERED' | 'RESET' | 'COOLDOWN' | 'ERROR';
  payload: any;
}

export class Evaluator {
  evaluate(rules: AlertRules, prev: AssetSnapshot | null, curr: AssetSnapshot): EvaluationResult {
    if (!prev) {
      return {
        shouldFire: false,
        indicatorsHit: [],
        payload: { curr }
      };
    }

    const hits: string[] = [];
    
    for (const trigger of rules.triggers) {
      if (trigger.kind === 'VOLUME_SPIKE') {
        // Prevent division by zero
        const safePrevVol = prev.volume === 0 ? 1 : prev.volume;
        const pctIncrease = ((curr.volume - safePrevVol) / safePrevVol) * 100;
        if (trigger.minIncreasePct && pctIncrease >= trigger.minIncreasePct) {
          hits.push(`VOLUME_SPIKE: ${pctIncrease.toFixed(1)}% >= ${trigger.minIncreasePct}%`);
        }
      } else if (trigger.kind === 'PRICE_MOVE') {
        const safePrevPrice = prev.price === 0 ? 1 : prev.price;
        const movePct = Math.abs((curr.price - safePrevPrice) / safePrevPrice) * 100;
        if (trigger.minMovePct && movePct >= trigger.minMovePct) {
          hits.push(`PRICE_MOVE: ${movePct.toFixed(1)}% >= ${trigger.minMovePct}%`);
        }
      }
    }

    // Confirm logic: count indicators true this tick
    const needed = rules.confirm.need || 1;
    const shouldFire = hits.length >= needed;

    return {
      shouldFire,
      indicatorsHit: hits,
      eventType: shouldFire ? 'TRIGGERED' : undefined,
      payload: {
        prev,
        curr,
        hits
      }
    };
  }
}

export const evaluator = new Evaluator();

