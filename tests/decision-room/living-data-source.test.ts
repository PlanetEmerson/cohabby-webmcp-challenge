import { describe, expect, it } from 'vitest';

import {
  syntheticLivingDataSource,
  syntheticRoomFixtures,
} from '@/lib/decision-room/living-data-source';

const sampleBrief = {
  market: 'New York',
  currency: 'USD',
  maxMonthlyBudget: 1900,
  moveWindow: 'within_30_days',
  homeType: 'room_in_shared_home',
  pets: 'cat',
  smoking: 'no_smoking',
  quietTime: 'early_evenings',
} as const;

describe('synthetic LivingDataSource', () => {
  it('returns three deterministic current options for the judge sample brief', async () => {
    const result = await syntheticLivingDataSource.findCompatibleRooms(
      sampleBrief,
      { limit: 6, order: 'best_fit' },
      new AbortController().signal,
    );

    expect(syntheticRoomFixtures).toHaveLength(12);
    expect(result).toEqual({
      status: 'ok',
      rooms: [
        expect.objectContaining({
          roomRef: 'room_nyc_cedar',
          fitBand: 'strong',
          housemate: {
            personRef: 'person_demo_maya',
            displayName: 'Maya',
            homeLine: 'Quiet mornings + tidy kitchen',
            housingPath: 'has_room',
          },
          synergy: expect.objectContaining({
            source: 'synthetic_fixture',
            score: 92,
            evidencePercent: 88,
            readLabel: 'strong_read',
          }),
        }),
        expect.objectContaining({ roomRef: 'room_nyc_hudson', housemate: expect.objectContaining({ displayName: 'Jordan' }), synergy: expect.objectContaining({ score: 87 }) }),
        expect.objectContaining({ roomRef: 'room_nyc_linden', housemate: expect.objectContaining({ displayName: 'Sam' }), synergy: expect.objectContaining({ score: 81 }) }),
      ],
    });
  });

  it('gives every synthetic room one fictional housemate and a bounded visible Synergy read', () => {
    expect(syntheticRoomFixtures).toHaveLength(12);
    for (const fixture of syntheticRoomFixtures) {
      expect(fixture.housemate.personRef).toMatch(/^person_demo_[a-z0-9_]{3,48}$/);
      expect(fixture.housemate.displayName).toBeTruthy();
      expect(fixture.synergy.source).toBe('synthetic_fixture');
      expect(Number.isInteger(fixture.synergy.score)).toBe(true);
      expect(fixture.synergy.score).toBeGreaterThanOrEqual(0);
      expect(fixture.synergy.score).toBeLessThanOrEqual(100);
      expect(fixture.synergy.evidencePercent).toBeGreaterThanOrEqual(0);
      expect(fixture.synergy.evidencePercent).toBeLessThanOrEqual(100);
      expect(fixture.synergy.reasonCodes).toHaveLength(3);
      expect(fixture.synergy.reasonLabels).toHaveLength(3);
    }
  });

  it('normalizes approved market aliases and reports unsupported markets without inventing inventory', async () => {
    const alias = await syntheticLivingDataSource.findCompatibleRooms(
      { ...sampleBrief, market: 'NYC' },
      { limit: 1, order: 'best_fit' },
      new AbortController().signal,
    );
    expect(alias).toMatchObject({ status: 'ok', rooms: [{ roomRef: 'room_nyc_cedar' }] });

    await expect(syntheticLivingDataSource.findCompatibleRooms(
      { market: 'Lisbon' },
      { limit: 5, order: 'best_fit' },
      new AbortController().signal,
    )).resolves.toEqual({
      status: 'unsupported_market',
      availableMarkets: ['New York', 'Amsterdam', 'Chicago'],
    });
  });

  it('does not produce any room output when the invocation is already canceled', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(syntheticLivingDataSource.findCompatibleRooms(
      sampleBrief,
      { limit: 6, order: 'best_fit' },
      controller.signal,
    )).rejects.toMatchObject({ name: 'AbortError' });
  });
});
