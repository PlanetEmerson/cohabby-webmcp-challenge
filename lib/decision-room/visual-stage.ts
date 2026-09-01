import type { DecisionRoomPhase } from './types';

export type LivingMatchboardStage =
  | 'ready'
  | 'brief'
  | 'rooms'
  | 'synergy'
  | 'comparison'
  | 'introduction'
  | 'confirmed';

export function visualStageForPhase(phase: DecisionRoomPhase): LivingMatchboardStage {
  switch (phase) {
    case 'READY':
      return 'ready';
    case 'BRIEF_STAGED':
    case 'BRIEF_APPLIED_BY_HUMAN':
      return 'brief';
    case 'RESULTS_READY':
      return 'rooms';
    case 'SYNERGY_EXPLAINED':
      return 'synergy';
    case 'COMPARISON_READY':
      return 'comparison';
    case 'INTRODUCTION_STAGED':
      return 'introduction';
    case 'INTRODUCTION_CONFIRMED_BY_HUMAN':
      return 'confirmed';
  }
}
