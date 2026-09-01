import type {
  CompareShortlistInput,
  FindCompatibleRoomsInput,
  PrepareIntroductionInput,
  StageLivingBriefInput,
} from '@/lib/webmcp/tool-contracts';

export type DecisionRoomPhase =
  | 'READY'
  | 'BRIEF_STAGED'
  | 'BRIEF_APPLIED_BY_HUMAN'
  | 'RESULTS_READY'
  | 'SYNERGY_EXPLAINED'
  | 'COMPARISON_READY'
  | 'INTRODUCTION_STAGED'
  | 'INTRODUCTION_CONFIRMED_BY_HUMAN';

export type AppliedLivingBrief = Readonly<StageLivingBriefInput>;

export type StagedLivingBriefProposal = Readonly<{
  proposalRef: string;
  values: AppliedLivingBrief;
  changedFields: ReadonlyArray<keyof StageLivingBriefInput>;
}>;

export type SafeReasonCode =
  | 'budget_fit'
  | 'move_timing_fit'
  | 'home_type_fit'
  | 'pet_fit'
  | 'smoke_free_fit'
  | 'quiet_time_fit'
  | 'house_rules_fit'
  | 'daily_rhythm_fit'
  | 'shared_space_fit'
  | 'household_boundaries_fit';

export type SafeSynergyReasonCode =
  | 'daily_rhythm_fit'
  | 'shared_space_fit'
  | 'household_boundaries_fit';

export type SafeHousemateSummary = Readonly<{
  personRef: string;
  displayName: string;
  homeLine: string;
  housingPath: 'has_room' | 'searching_together';
}>;

export type SafeSynergyRead = Readonly<{
  source: 'synthetic_fixture';
  score: number;
  evidencePercent: number;
  readLabel: 'strong_read' | 'good_read' | 'early_read';
  reasonCodes: ReadonlyArray<SafeSynergyReasonCode>;
  reasonLabels: ReadonlyArray<string>;
}>;

export type SafeRoomSummary = Readonly<{
  roomRef: string;
  headline: string;
  marketLabel: string;
  monthlyPrice: number;
  currency: string;
  availableWindow: 'now' | 'within_30_days' | 'within_60_days' | 'flexible';
  homeType: 'room_in_shared_home' | 'entire_place';
  fitBand: 'strong' | 'good' | 'possible';
  reasonCodes: ReadonlyArray<SafeReasonCode>;
  reasonLabels: ReadonlyArray<string>;
  housemate: SafeHousemateSummary;
  synergy: SafeSynergyRead;
}>;

export type SynergyExplanation = Readonly<{
  roomRef: string;
  personRef: string;
  displayName: string;
  score: number;
  evidencePercent: number;
  readLabel: SafeSynergyRead['readLabel'];
  reasonCodes: ReadonlyArray<SafeSynergyReasonCode>;
  reasonLabels: ReadonlyArray<string>;
}>;

export type RoomResults = Readonly<{
  generation: number;
  request: Required<FindCompatibleRoomsInput>;
  rooms: ReadonlyArray<SafeRoomSummary>;
}>;

export type ComparisonBoard = Readonly<{
  roomRefs: CompareShortlistInput['roomRefs'];
  dimensions: NonNullable<CompareShortlistInput['dimensions']>;
}>;

export type StagedIntroduction = Readonly<{
  draftRef: string;
  roomRef: string;
  tone: PrepareIntroductionInput['tone'];
  highlightCodes: ReadonlyArray<SafeReasonCode>;
  draft: string;
  isSafeToConfirm: boolean;
}>;

export type DemoReceipt = Readonly<{
  receiptRef: string;
  message: 'Demo confirmed. No real message was sent.';
}>;

export type DecisionRoomNotice = Readonly<{
  kind: 'info' | 'safety' | 'error';
  message: string;
}>;

export type DecisionRoomState = Readonly<{
  schemaVersion: 1;
  stateVersion: number;
  workspaceGeneration: number;
  phase: DecisionRoomPhase;
  appliedBrief: AppliedLivingBrief | null;
  stagedBrief: StagedLivingBriefProposal | null;
  results: RoomResults | null;
  synergyExplanation: SynergyExplanation | null;
  comparison: ComparisonBoard | null;
  introduction: StagedIntroduction | null;
  receipt: DemoReceipt | null;
  notice: DecisionRoomNotice | null;
}>;
