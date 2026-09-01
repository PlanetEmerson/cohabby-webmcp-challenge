import type { FindCompatibleRoomsInput, StageLivingBriefInput } from '@/lib/webmcp/tool-contracts';
import type {
  SafeHousemateSummary,
  SafeReasonCode,
  SafeRoomSummary,
  SafeSynergyRead,
  SafeSynergyReasonCode,
} from './types';

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
  housemate: SafeHousemateSummary;
  synergy: SafeSynergyRead;
}>;

const synergyReasonCodes: ReadonlyArray<SafeSynergyReasonCode> = [
  'daily_rhythm_fit',
  'shared_space_fit',
  'household_boundaries_fit',
];

function syntheticSynergy(
  score: number,
  evidencePercent: number,
  readLabel: SafeSynergyRead['readLabel'],
  reasonLabels: readonly [string, string, string],
): SafeSynergyRead {
  return {
    source: 'synthetic_fixture',
    score,
    evidencePercent,
    readLabel,
    reasonCodes: synergyReasonCodes,
    reasonLabels,
  };
}

export const syntheticRoomFixtures: ReadonlyArray<RoomFixture> = [
  {
    roomRef: 'room_nyc_cedar', headline: 'Quiet room with sunny shared space', marketLabel: 'New York',
    monthlyPrice: 1750, currency: 'USD', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'cat', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'shared_cleaning', 'pet_cleanup', 'no_indoor_smoking'],
    housemate: { personRef: 'person_demo_maya', displayName: 'Maya', homeLine: 'Quiet mornings + tidy kitchen', housingPath: 'has_room' },
    synergy: syntheticSynergy(92, 88, 'strong_read', ['Both prefer quiet mornings', 'Both value tidy shared spaces', 'Clear household boundaries align']),
  },
  {
    roomRef: 'room_nyc_hudson', headline: 'Calm room with clear shared-home rules', marketLabel: 'New York',
    monthlyPrice: 1890, currency: 'USD', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'flexible', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'guest_notice', 'pet_cleanup', 'no_indoor_smoking'],
    housemate: { personRef: 'person_demo_jordan', displayName: 'Jordan', homeLine: 'Cat-friendly + clear boundaries', housingPath: 'has_room' },
    synergy: syntheticSynergy(87, 82, 'strong_read', ['Calm evening rhythms align', 'Both care for shared spaces', 'Guest and pet boundaries are clear']),
  },
  {
    roomRef: 'room_nyc_linden', headline: 'Flexible room ready for an earlier move', marketLabel: 'New York',
    monthlyPrice: 1680, currency: 'USD', availableWindow: 'now', homeType: 'room_in_shared_home',
    petPolicy: 'cat', smokingPolicy: 'no_smoking', quietTimePolicy: 'late_evenings',
    houseRules: ['shared_cleaning', 'guest_notice'],
    housemate: { personRef: 'person_demo_sam', displayName: 'Sam', homeLine: 'Flexible schedule + relaxed home', housingPath: 'has_room' },
    synergy: syntheticSynergy(81, 76, 'good_read', ['Flexible daily rhythms overlap', 'Shared spaces can stay relaxed', 'Guest expectations are visible']),
  },
  {
    roomRef: 'room_nyc_orchard', headline: 'Private place with a later move window', marketLabel: 'New York',
    monthlyPrice: 2050, currency: 'USD', availableWindow: 'within_60_days', homeType: 'entire_place',
    petPolicy: 'none', smokingPolicy: 'outdoor_only', quietTimePolicy: 'late_evenings',
    houseRules: ['guest_notice'],
    housemate: { personRef: 'person_demo_riley', displayName: 'Riley', homeLine: 'Later hours + a fresh place search', housingPath: 'searching_together' },
    synergy: syntheticSynergy(76, 68, 'early_read', ['Later daily rhythms overlap', 'Both want a place of their own', 'Guest expectations can be discussed']),
  },
  {
    roomRef: 'room_ams_canal', headline: 'Shared room with quiet evening hours', marketLabel: 'Amsterdam',
    monthlyPrice: 1450, currency: 'EUR', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'cat', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'shared_cleaning', 'no_indoor_smoking'],
    housemate: { personRef: 'person_demo_noor', displayName: 'Noor', homeLine: 'Early evenings + calm shared spaces', housingPath: 'has_room' },
    synergy: syntheticSynergy(91, 86, 'strong_read', ['Quiet daily rhythms align', 'Both value cared-for common space', 'Smoke-free boundaries are clear']),
  },
  {
    roomRef: 'room_ams_harbor', headline: 'Simple room available now', marketLabel: 'Amsterdam',
    monthlyPrice: 1325, currency: 'EUR', availableWindow: 'now', homeType: 'room_in_shared_home',
    petPolicy: 'none', smokingPolicy: 'no_smoking', quietTimePolicy: 'flexible',
    houseRules: ['shared_cleaning', 'guest_notice'],
    housemate: { personRef: 'person_demo_luca', displayName: 'Luca', homeLine: 'Flexible hours + shared upkeep', housingPath: 'has_room' },
    synergy: syntheticSynergy(86, 80, 'strong_read', ['Flexible schedules leave room', 'Shared upkeep expectations align', 'Guest notice keeps boundaries clear']),
  },
  {
    roomRef: 'room_ams_tulip', headline: 'Private place with flexible house rules', marketLabel: 'Amsterdam',
    monthlyPrice: 1690, currency: 'EUR', availableWindow: 'within_60_days', homeType: 'entire_place',
    petPolicy: 'cat', smokingPolicy: 'outdoor_only', quietTimePolicy: 'late_evenings',
    houseRules: ['guest_notice', 'pet_cleanup'],
    housemate: { personRef: 'person_demo_sofie', displayName: 'Sofie', homeLine: 'Later evenings + a new place together', housingPath: 'searching_together' },
    synergy: syntheticSynergy(83, 77, 'good_read', ['Later evening rhythms align', 'Both can shape a new shared space', 'Pet and guest boundaries are visible']),
  },
  {
    roomRef: 'room_ams_courtyard', headline: 'Shared room with a steady home rhythm', marketLabel: 'Amsterdam',
    monthlyPrice: 1550, currency: 'EUR', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'dog', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'shared_cleaning', 'pet_cleanup'],
    housemate: { personRef: 'person_demo_daan', displayName: 'Daan', homeLine: 'Steady routine + pet-aware home', housingPath: 'has_room' },
    synergy: syntheticSynergy(79, 72, 'good_read', ['Steady daily rhythms overlap', 'Both respect shared-space routines', 'Pet care expectations are explicit']),
  },
  {
    roomRef: 'room_chi_maple', headline: 'Bright room ready now', marketLabel: 'Chicago',
    monthlyPrice: 1250, currency: 'USD', availableWindow: 'now', homeType: 'room_in_shared_home',
    petPolicy: 'cat', smokingPolicy: 'no_smoking', quietTimePolicy: 'early_evenings',
    houseRules: ['quiet_after_10', 'shared_cleaning', 'pet_cleanup'],
    housemate: { personRef: 'person_demo_amina', displayName: 'Amina', homeLine: 'Bright mornings + shared routines', housingPath: 'has_room' },
    synergy: syntheticSynergy(90, 85, 'strong_read', ['Morning rhythms align', 'Both value shared-space routines', 'Pet care expectations are clear']),
  },
  {
    roomRef: 'room_chi_lake', headline: 'Flexible room with practical shared rules', marketLabel: 'Chicago',
    monthlyPrice: 1490, currency: 'USD', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'flexible', smokingPolicy: 'no_smoking', quietTimePolicy: 'flexible',
    houseRules: ['guest_notice', 'shared_cleaning', 'no_indoor_smoking'],
    housemate: { personRef: 'person_demo_theo', displayName: 'Theo', homeLine: 'Flexible rhythm + practical rules', housingPath: 'has_room' },
    synergy: syntheticSynergy(85, 79, 'good_read', ['Flexible schedules can overlap', 'Shared upkeep expectations align', 'Smoke and guest boundaries are clear']),
  },
  {
    roomRef: 'room_chi_river', headline: 'Private place with a relaxed move window', marketLabel: 'Chicago',
    monthlyPrice: 1700, currency: 'USD', availableWindow: 'within_60_days', homeType: 'entire_place',
    petPolicy: 'dog', smokingPolicy: 'no_smoking', quietTimePolicy: 'flexible',
    houseRules: ['guest_notice', 'pet_cleanup'],
    housemate: { personRef: 'person_demo_morgan', displayName: 'Morgan', homeLine: 'Flexible plans + a place search together', housingPath: 'searching_together' },
    synergy: syntheticSynergy(80, 74, 'good_read', ['Flexible routines leave room', 'Both can choose a new space', 'Pet and guest boundaries are visible']),
  },
  {
    roomRef: 'room_chi_garden', headline: 'Budget room with flexible evening hours', marketLabel: 'Chicago',
    monthlyPrice: 1190, currency: 'USD', availableWindow: 'within_30_days', homeType: 'room_in_shared_home',
    petPolicy: 'none', smokingPolicy: 'outdoor_only', quietTimePolicy: 'late_evenings',
    houseRules: ['shared_cleaning', 'guest_notice'],
    housemate: { personRef: 'person_demo_casey', displayName: 'Casey', homeLine: 'Later hours + a budget-minded home', housingPath: 'has_room' },
    synergy: syntheticSynergy(75, 67, 'early_read', ['Later daily rhythms overlap', 'Shared upkeep can stay simple', 'Guest expectations are visible']),
  },
];

export const demoMarkets = ['New York', 'Amsterdam', 'Chicago'] as const;
export const demoProfileSignals = [
  'early_mornings',
  'tidy_shared_spaces',
  'quiet_weekends',
  'cat_household',
] as const;

const reasonLabels: Record<SafeReasonCode, string> = {
  budget_fit: 'Within the approved budget',
  move_timing_fit: 'Available in the approved move window',
  home_type_fit: 'Matches the requested home type',
  pet_fit: 'Works with the approved pet need',
  smoke_free_fit: 'Matches the smoking preference',
  quiet_time_fit: 'Supports the preferred evening rhythm',
  house_rules_fit: 'Shared-home rules support the living plan',
  daily_rhythm_fit: 'Daily rhythms align',
  shared_space_fit: 'Shared-space expectations align',
  household_boundaries_fit: 'Household boundaries align',
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
        || right.fixture.synergy.score - left.fixture.synergy.score
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
      housemate: {
        personRef: fixture.housemate.personRef,
        displayName: fixture.housemate.displayName,
        homeLine: fixture.housemate.homeLine,
        housingPath: fixture.housemate.housingPath,
      },
      synergy: {
        source: 'synthetic_fixture',
        score: fixture.synergy.score,
        evidencePercent: fixture.synergy.evidencePercent,
        readLabel: fixture.synergy.readLabel,
        reasonCodes: [...fixture.synergy.reasonCodes],
        reasonLabels: [...fixture.synergy.reasonLabels],
      },
    }));
    return { status: 'ok', rooms };
  },
};

export type LivingDataSource = typeof syntheticLivingDataSource;
