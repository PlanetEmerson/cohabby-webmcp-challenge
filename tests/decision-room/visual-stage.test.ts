import { describe, expect, it } from 'vitest';

import { visualStageForPhase } from '@/lib/decision-room/visual-stage';
import type { DecisionRoomPhase } from '@/lib/decision-room/types';

describe('CoHabby Living visual stage', () => {
  it.each<readonly [DecisionRoomPhase, string]>([
    ['READY', 'ready'],
    ['BRIEF_STAGED', 'brief'],
    ['BRIEF_APPLIED_BY_HUMAN', 'brief'],
    ['RESULTS_READY', 'rooms'],
    ['SYNERGY_EXPLAINED', 'synergy'],
    ['COMPARISON_READY', 'comparison'],
    ['INTRODUCTION_STAGED', 'introduction'],
    ['INTRODUCTION_CONFIRMED_BY_HUMAN', 'confirmed'],
  ])('maps %s to %s without adding a product phase', (phase, expected) => {
    expect(visualStageForPhase(phase)).toBe(expected);
  });
});
