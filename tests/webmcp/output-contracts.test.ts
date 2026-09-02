import { describe, expect, it } from 'vitest';

import { assertToolOutput, ToolOutputContractError } from '@/lib/webmcp/output-contracts';

const explanation = {
  schemaVersion: 1,
  stateVersion: 5,
  status: 'synergy_explanation_ready',
  phase: 'SYNERGY_EXPLAINED',
  roomRef: 'room_nyc_cedar',
  personRef: 'person_demo_maya',
  displayName: 'Maya',
  scoreSource: 'synthetic_fixture',
  score: 92,
  evidencePercent: 88,
  readLabel: 'strong_read',
  reasonCodes: ['daily_rhythm_fit', 'shared_space_fit', 'household_boundaries_fit'],
  reasonLabels: ['Both prefer quiet mornings', 'Both value tidy shared spaces', 'Clear household boundaries align'],
  visibleExplanation: true,
} as const;

describe('exact WebMCP output contracts', () => {
  it('accepts the bounded synthetic Synergy explanation', () => {
    expect(assertToolOutput('explain_synergy_match', explanation)).toBe(explanation);
  });

  it.each([
    { ...explanation, score: 101 },
    { ...explanation, evidencePercent: -1 },
    { ...explanation, imageUrl: '/assets/people/maya.webp' },
    { ...explanation, reasonCodes: [...explanation.reasonCodes, 'invented_fit'] },
  ])('rejects an out-of-contract Synergy output', (value) => {
    expect(() => assertToolOutput('explain_synergy_match', value))
      .toThrowError(new ToolOutputContractError());
  });

  it('accepts the common typed failure and rejects unknown failure fields', () => {
    const failure = {
      schemaVersion: 1,
      stateVersion: 4,
      status: 'error',
      phase: 'RESULTS_READY',
      error: { code: 'canceled', message: 'The action was canceled without changing CoHabby Living.' },
    } as const;
    expect(assertToolOutput('explain_synergy_match', failure)).toBe(failure);
    expect(() => assertToolOutput('explain_synergy_match', { ...failure, retryAfter: 1 }))
      .toThrowError(new ToolOutputContractError());
  });
});
