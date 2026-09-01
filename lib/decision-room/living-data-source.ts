import type { FindCompatibleRoomsInput, StageLivingBriefInput } from '@/lib/webmcp/tool-contracts';
import type { SafeReasonCode, SafeRoomSummary } from './types';

type RoomFixture = Readonly<{
  roomRef: string;
  headline: string;
  marketLabel: 'New York' | 'Amsterdam' | 'Chicago';
  monthlyPrice: number;
  currency: 'USD' | 'EUR';
  availableWindow: 'now' | 'within_30_days' | 'within_60_days' | 'flexible';
  homeType: 'room_in_shared_home' | 'entire_place';
  petPolicy: 'none' | 'cat' | 'dog' | 'other' | 'flexible';
  smokingPolicy: 'no_smoking' | 'outdoor_only' | 'flexible';
  quietTimePolicy: 'early_evenings' | 'late_evenings' | 'flexible';
  houseRules: ReadonlyArray<'quiet_after_10' | 'shared_cleaning' | 'guest_notice' | 'pet_cleanup' | 'no_indoor_smoking'>;
}>;

export const syntheticRoomFixtures: ReadonlyArray<RoomFixture> = [
  {
    roomRef: 'room_nyc_cedar', headline: 'Quiet room with sunny shared space', marketLabel: 'New York',
    monthlyPrice: 1750, currency: 'USD', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'cat', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'shared_cleaning', 'pet_cleanup', 'no_indoor_smoking'],
  },
  {
    roomRef: 'room_nyc_hudson', headline: 'Calm room with clear shared-home rules', marketLabel: 'New York',
    monthlyPrice: 1890, currency: 'USD', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'flexible', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'guest_notice', 'pet_cleanup', 'no_indoor_smoking'],
  },
  {
    roomRef: 'room_nyc_linden', headline: 'Flexible room ready for an earlier move', marketLabel: 'New York',
    monthlyPrice: 1680, currency: 'USD', availableWindow: 'now', homeType: 'room_in_shared_home',
    petPolicy: 'cat', smokingPolicy: 'no_smoking', quietTimePolicy: 'late_evenings',
    houseRules: ['shared_cleaning', 'guest_notice'],
  },
  {
    roomRef: 'room_nyc_orchard', headline: 'Private place with a later move window', marketLabel: 'New York',
    monthlyPrice: 2050, currency: 'USD', availableWindow: 'within_60_days', homeType: 'entire_place',
    petPolicy: 'none', smokingPolicy: 'outdoor_only', quietTimePolicy: 'late_evenings',
    houseRules: ['guest_notice'],
  },
  {
    roomRef: 'room_ams_canal', headline: 'Shared room with quiet evening hours', marketLabel: 'Amsterdam',
    monthlyPrice: 1450, currency: 'EUR', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'cat', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'shared_cleaning', 'no_indoor_smoking'],
  },
  {
    roomRef: 'room_ams_harbor', headline: 'Simple room available now', marketLabel: 'Amsterdam',
    monthlyPrice: 1325, currency: 'EUR', availableWindow: 'now', homeType: 'room_in_shared_home',
    petPolicy: 'none', smokingPolicy: 'no_smoking', quietTimePolicy: 'flexible',
    houseRules: ['shared_cleaning', 'guest_notice'],
  },
  {
    roomRef: 'room_ams_tulip', headline: 'Private place with flexible house rules', marketLabel: 'Amsterdam',
    monthlyPrice: 1690, currency: 'EUR', availableWindow: 'within_60_days', homeType: 'entire_place',
    petPolicy: 'cat', smokingPolicy: 'outdoor_only', quietTimePolicy: 'late_evenings',
    houseRules: ['guest_notice', 'pet_cleanup'],
  },
  {
    roomRef: 'room_ams_courtyard', headline: 'Shared room with a steady home rhythm', marketLabel: 'Amsterdam',
    monthlyPrice: 1550, currency: 'EUR', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'dog', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'shared_cleaning', 'pet_cleanup'],
  },
  {
    roomRef: 'room_chi_maple', headline: 'Bright room ready now', marketLabel: 'Chicago',
    monthlyPrice: 1250, currency: 'USD', availableWindow: 'now', homeType: 'room_in_shared_home',
    petPolicy: 'cat', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'shared_cleaning', 'pet_cleanup'],
  },
  {
    roomRef: 'room_chi_lake', headline: 'Flexible room with practical shared rules', marketLabel: 'Chicago',
    monthlyPrice: 1490, currency: 'USD', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'flexible', smokingPolicy: 'no_smoking', quietTimePolicy: 'flexible',
    houseRules: ['guest_notice', 'shared_cleaning', 'no_indoor_smoking'],
  },
  {
    roomRef: 'room_chi_river', headline: 'Private place with a relaxed move window', marketLabel: 'Chicago',
    monthlyPrice: 1700, currency: 'USD', availableWindow: 'within_60_days', homeType: 'entire_place',
    petPolicy: 'dog', smokingPolicy: 'no_smoking', quietTimePolicy: 'flexible',
    houseRules: ['guest_notice', 'pet_cleanup'],
  },
  {
    roomRef: 'room_chi_garden', headline: 'Budget room with flexible evening hours', marketLabel: 'Chicago',
    monthlyPrice: 1190, currency: 'USD', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'none', smokingPolicy: 'outdoor_only', quietTimePolicy: 'late_evenings',
    houseRules: ['shared_cleaning', 'guest_notice'],
  },
];

export const demoMarkets = ['New York', 'Amsterdam', 'Chicago'] as const;

const reasonLabels: Record<SafeReasonCode, string> = {
  budget_fit: 'Within the approved budget',
  move_timing_fit: 'Available in the approved move window',
  home_type_fit: 'Matches the requested home type',
  pet_fit: 'Works with the approved pet need',
  smoke_free_fit: 'Matches the smoking preference',
  quiet_time_fit: 'Supports the preferred evening rhythm',
  house_rules_fit: 'Shared-home rules support the brief',
};

function canonicalMarket(value: string | undefined): string | null {
  if (!value) return null;
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
  if (normalized === 'new york' || normalized === 'new york city' || normalized === 'nyc') return 'New York';
  if (normalized === 'amsterdam') return 'Amsterdam';
  if (normalized === 'chicago') return 'Chicago';
  return null;
}

function moveWindowFits(
  wanted: StageLivingBriefInput['moveWindow'],
  available: RoomFixture['availableWindow'],
): boolean {
  if (!wanted || wanted === 'flexible') return true;
  if (wanted === 'now') return available === 'now';
  if (wanted === 'within_30_days') return available === 'now' || available === 'within_30_days';
  return available !== 'flexible';
}

function scoreFixture(brief: StageLivingBriefInput, fixture: RoomFixture) {
  const reasonCodes: SafeReasonCode[] = [];
  if (brief.maxMonthlyBudget === undefined || fixture.monthlyPrice <= brief.maxMonthlyBudget) reasonCodes.push('budget_fit');
  if (moveWindowFits(brief.moveWindow, fixture.availableWindow)) reasonCodes.push('move_timing_fit');
  if (!brief.homeType || brief.homeType === 'either' || brief.homeType === fixture.homeType) reasonCodes.push('home_type_fit');
  if (!brief.pets || brief.pets === 'none' || brief.pets === 'flexible' || fixture.petPolicy === 'flexible' || brief.pets === fixture.petPolicy) reasonCodes.push('pet_fit');
  if (!brief.smoking || brief.smoking === 'flexible' || brief.smoking === fixture.smokingPolicy) reasonCodes.push('smoke_free_fit');
  if (!brief.quietTime || brief.quietTime === 'flexible' || brief.quietTime === fixture.quietTimePolicy) reasonCodes.push('quiet_time_fit');
  if (
    (brief.quietTime === 'early_evenings' && fixture.houseRules.includes('quiet_after_10'))
    || (brief.smoking === 'no_smoking' && fixture.houseRules.includes('no_indoor_smoking'))
  ) reasonCodes.push('house_rules_fit');
  const fitBand = reasonCodes.length >= 6 ? 'strong' : reasonCodes.length >= 4 ? 'good' : 'possible';
  return { reasonCodes, fitBand } as const;
}

function abortIfNeeded(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('The operation was canceled.', 'AbortError');
}

export type LivingDataSourceResult =
  | Readonly<{ status: 'ok'; rooms: ReadonlyArray<SafeRoomSummary> }>
  | Readonly<{ status: 'unsupported_market'; availableMarkets: typeof demoMarkets }>;

export const syntheticLivingDataSource = {
  async findCompatibleRooms(
    brief: StageLivingBriefInput,
    request: Required<FindCompatibleRoomsInput>,
    signal: AbortSignal,
  ): Promise<LivingDataSourceResult> {
    abortIfNeeded(signal);
    await Promise.resolve();
    abortIfNeeded(signal);
    const market = canonicalMarket(brief.market);
    if (!market) return { status: 'unsupported_market', availableMarkets: demoMarkets };
    const candidates = syntheticRoomFixtures
      .filter((fixture) => fixture.marketLabel === market)
      .filter((fixture) => !brief.currency || fixture.currency === brief.currency)
      .filter((fixture) => !brief.maxMonthlyBudget || fixture.monthlyPrice <= brief.maxMonthlyBudget)
      .filter((fixture) => !brief.homeType || brief.homeType === 'either' || fixture.homeType === brief.homeType)
      .filter((fixture) => !brief.pets || brief.pets === 'none' || brief.pets === 'flexible' || fixture.petPolicy === 'flexible' || fixture.petPolicy === brief.pets)
      .map((fixture) => ({ fixture, score: scoreFixture(brief, fixture) }));

    const availabilityRank = { now: 0, within_30_days: 1, within_60_days: 2, flexible: 3 } as const;
    const fitRank = { strong: 0, good: 1, possible: 2 } as const;
    candidates.sort((left, right) => {
      if (request.order === 'lowest_price') return left.fixture.monthlyPrice - right.fixture.monthlyPrice || left.fixture.roomRef.localeCompare(right.fixture.roomRef);
      if (request.order === 'soonest_move') return availabilityRank[left.fixture.availableWindow] - availabilityRank[right.fixture.availableWindow] || fitRank[left.score.fitBand] - fitRank[right.score.fitBand];
      return fitRank[left.score.fitBand] - fitRank[right.score.fitBand]
        || right.score.reasonCodes.length - left.score.reasonCodes.length
        || left.fixture.monthlyPrice - right.fixture.monthlyPrice
        || left.fixture.roomRef.localeCompare(right.fixture.roomRef);
    });

    const rooms = candidates.slice(0, request.limit).map(({ fixture, score }): SafeRoomSummary => ({
      roomRef: fixture.roomRef,
      headline: fixture.headline,
      marketLabel: fixture.marketLabel,
      monthlyPrice: fixture.monthlyPrice,
      currency: fixture.currency,
      availableWindow: fixture.availableWindow,
      homeType: fixture.homeType,
      fitBand: score.fitBand,
      reasonCodes: [...score.reasonCodes],
      reasonLabels: score.reasonCodes.map((code) => reasonLabels[code]),
    }));
    return { status: 'ok', rooms };
  },
};

export type LivingDataSource = typeof syntheticLivingDataSource;
