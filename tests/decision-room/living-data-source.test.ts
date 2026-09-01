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
