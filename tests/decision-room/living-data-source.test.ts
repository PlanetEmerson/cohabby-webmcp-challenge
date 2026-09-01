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
        expect.objectContaining({ roomRef: 'room_nyc_cedar', fitBand: 'strong' }),
        expect.objectContaining({ roomRef: 'room_nyc_hudson', fitBand: 'strong' }),
        expect.objectContaining({ roomRef: 'room_nyc_linden', fitBand: 'good' }),
      ],
    });
  });
});
