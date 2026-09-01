import { describe, expect, it } from 'vitest';

import { buildIntroductionDraft } from '@/lib/decision-room/introduction-template';
import type { SafeRoomSummary } from '@/lib/decision-room/types';

const room: SafeRoomSummary = {
  roomRef: 'room_nyc_cedar',
  headline: 'Quiet room with sunny shared space',
  marketLabel: 'New York',
  monthlyPrice: 1750,
  currency: 'USD',
  availableWindow: 'within_30_days',
  homeType: 'room_in_shared_home',
  fitBand: 'strong',
  reasonCodes: ['budget_fit'],
  reasonLabels: ['Within the approved budget'],
  housemate: {
    personRef: 'person_demo_maya',
    displayName: 'Maya',
    homeLine: 'Quiet mornings + tidy kitchen',
    housingPath: 'has_room',
  },
  synergy: {
    source: 'synthetic_fixture',
    score: 92,
    evidencePercent: 88,
    readLabel: 'strong_read',
    reasonCodes: ['daily_rhythm_fit', 'shared_space_fit', 'household_boundaries_fit'],
    reasonLabels: ['Both prefer quiet mornings', 'Both value tidy shared spaces', 'Clear household boundaries align'],
  },
};

describe('people-first introduction template', () => {
  it('addresses the fictional housemate and uses allowlisted Synergy reasons without quoting the score', () => {
    const draft = buildIntroductionDraft({
      room,
      tone: 'warm',
      highlightCodes: ['daily_rhythm_fit', 'budget_fit'],
    });

    expect(draft).toContain('Hi Maya!');
    expect(draft).toContain('both prefer quiet mornings');
    expect(draft).toContain('within the approved budget');
    expect(draft).toContain('our home habits may fit');
    expect(draft).toContain('compare how we each use shared space');
    expect(draft).not.toContain('92');
    expect(draft).not.toMatch(/caught my eye|chemistry|date|romance|relationship/i);
  });

  it('keeps every tone friendly, plain, and firmly about roommate life', () => {
    const direct = buildIntroductionDraft({ room, tone: 'direct', highlightCodes: ['shared_space_fit'] });
    const casual = buildIntroductionDraft({ room, tone: 'casual', highlightCodes: ['household_boundaries_fit'] });

    expect(direct).toContain('Are you open to a quick chat about shared-space habits and the home?');
    expect(casual).toContain('Want to compare roommate routines and talk about the home?');
    expect(`${direct} ${casual}`).not.toMatch(/chemistry|date|romance|relationship|love to meet/i);
  });
});
