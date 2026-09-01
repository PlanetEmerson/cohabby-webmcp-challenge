import { safeReasonCodes, stageLivingBriefInputSchema } from './tool-schemas';

const phases = [
  'READY',
  'BRIEF_STAGED',
  'BRIEF_APPLIED_BY_HUMAN',
  'RESULTS_READY',
  'SYNERGY_EXPLAINED',
  'COMPARISON_READY',
  'INTRODUCTION_STAGED',
  'INTRODUCTION_CONFIRMED_BY_HUMAN',
] as const;

const errorCodes = [
  'invalid_input',
  'invalid_state',
  'stale_reference',
  'stale_execution',
  'unsupported_market',
  'unsafe_housing_request',
  'canceled',
  'internal_error',
] as const;

const roomRefSchema = { type: 'string', pattern: '^room_[a-z0-9_]{3,48}$' } as const;
const personRefSchema = { type: 'string', pattern: '^person_demo_[a-z0-9_]{3,48}$' } as const;
const stateVersionSchema = { type: 'integer', minimum: 1 } as const;
const phaseSchema = { type: 'string', enum: phases } as const;
const synergyReasonCodes = ['daily_rhythm_fit', 'shared_space_fit', 'household_boundaries_fit'] as const;
const comparisonDimensions = ['synergy_read', 'budget', 'move_timing', 'home_rhythm', 'house_rules', 'practical_fit'] as const;

const failureSchema = {
  type: 'object',
  required: ['schemaVersion', 'stateVersion', 'status', 'phase', 'error'],
  properties: {
    schemaVersion: { const: 1 },
    stateVersion: stateVersionSchema,
    status: { const: 'error' },
    phase: phaseSchema,
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'string', enum: errorCodes },
        message: { type: 'string', minLength: 1, maxLength: 200 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const;

const housemateSchema = {
  type: 'object',
  required: ['personRef', 'displayName', 'homeLine', 'housingPath'],
  properties: {
    personRef: personRefSchema,
    displayName: { type: 'string', minLength: 1, maxLength: 40 },
    homeLine: { type: 'string', minLength: 1, maxLength: 100 },
    housingPath: { type: 'string', enum: ['has_room', 'searching_together'] },
  },
  additionalProperties: false,
} as const;

const synergySchema = {
  type: 'object',
  required: ['source', 'score', 'evidencePercent', 'readLabel', 'reasonCodes', 'reasonLabels'],
  properties: {
    source: { const: 'synthetic_fixture' },
    score: { type: 'integer', minimum: 0, maximum: 100 },
    evidencePercent: { type: 'integer', minimum: 0, maximum: 100 },
    readLabel: { type: 'string', enum: ['strong_read', 'good_read', 'early_read'] },
    reasonCodes: {
      type: 'array', minItems: 3, maxItems: 3, uniqueItems: true,
      items: { type: 'string', enum: synergyReasonCodes },
    },
    reasonLabels: {
      type: 'array', minItems: 3, maxItems: 3,
      items: { type: 'string', minLength: 1, maxLength: 100 },
    },
  },
  additionalProperties: false,
} as const;

const roomSchema = {
  type: 'object',
  required: [
    'roomRef', 'headline', 'marketLabel', 'monthlyPrice', 'currency', 'availableWindow',
    'homeType', 'fitBand', 'reasonCodes', 'reasonLabels', 'housemate', 'synergy',
  ],
  properties: {
    roomRef: roomRefSchema,
    headline: { type: 'string', minLength: 1, maxLength: 120 },
    marketLabel: { type: 'string', minLength: 2, maxLength: 80 },
    monthlyPrice: { type: 'integer', minimum: 100, maximum: 50000 },
    currency: { type: 'string', pattern: '^[A-Z]{3}$' },
    availableWindow: { type: 'string', enum: ['now', 'within_30_days', 'within_60_days', 'flexible'] },
    homeType: { type: 'string', enum: ['room_in_shared_home', 'entire_place'] },
    fitBand: { type: 'string', enum: ['strong', 'good', 'possible'] },
    reasonCodes: {
      type: 'array', maxItems: 10, uniqueItems: true,
      items: { type: 'string', enum: safeReasonCodes },
    },
    reasonLabels: {
      type: 'array', maxItems: 10,
      items: { type: 'string', minLength: 1, maxLength: 120 },
    },
    housemate: housemateSchema,
    synergy: synergySchema,
  },
  additionalProperties: false,
} as const;

function outputUnion(success: object) {
  return { anyOf: [success, failureSchema] } as const;
}

export const toolOutputSchemas = {
  get_living_context: outputUnion({
    type: 'object',
    required: [
      'schemaVersion', 'stateVersion', 'status', 'phase', 'visibleProfileSignals',
      'visibleRoomRefs', 'synergyExplanationStatus', 'shortlistCount', 'introductionStatus',
    ],
    properties: {
      schemaVersion: { const: 1 },
      stateVersion: stateVersionSchema,
      status: { const: 'ready' },
      phase: phaseSchema,
      brief: stageLivingBriefInputSchema,
      visibleProfileSignals: {
        type: 'array', minItems: 4, maxItems: 4, uniqueItems: true,
        items: { type: 'string', enum: ['early_mornings', 'tidy_shared_spaces', 'quiet_weekends', 'cat_household'] },
      },
      visibleRoomRefs: { type: 'array', maxItems: 6, uniqueItems: true, items: roomRefSchema },
      synergyExplanationStatus: { type: 'string', enum: ['none', 'visible'] },
      focusedSynergyRoomRef: roomRefSchema,
      shortlistCount: { type: 'integer', minimum: 0, maximum: 3 },
      introductionStatus: { type: 'string', enum: ['none', 'staged', 'confirmed'] },
    },
    additionalProperties: false,
  }),
  stage_living_brief: outputUnion({
    type: 'object',
    required: ['schemaVersion', 'stateVersion', 'status', 'phase', 'proposalRef', 'changedFields', 'visibleConfirmation'],
    properties: {
      schemaVersion: { const: 1 }, stateVersion: stateVersionSchema,
      status: { const: 'awaiting_human_review' }, phase: { const: 'BRIEF_STAGED' },
      proposalRef: { type: 'string', pattern: '^proposal_brief_[0-9]{2}_[0-9]{2}$' },
      changedFields: {
        type: 'array', minItems: 1, maxItems: 8, uniqueItems: true,
        items: { type: 'string', enum: ['market', 'currency', 'maxMonthlyBudget', 'moveWindow', 'homeType', 'pets', 'smoking', 'quietTime'] },
      },
      visibleConfirmation: { const: true },
    },
    additionalProperties: false,
  }),
  find_compatible_rooms: {
    anyOf: [
      {
        type: 'object',
        required: ['schemaVersion', 'stateVersion', 'status', 'phase', 'resultGeneration', 'visibleRoomRefs', 'rooms'],
        properties: {
          schemaVersion: { const: 1 }, stateVersion: stateVersionSchema,
          status: { type: 'string', enum: ['results_ready', 'no_matches'] }, phase: { const: 'RESULTS_READY' },
          resultGeneration: { type: 'integer', minimum: 1 },
          visibleRoomRefs: { type: 'array', maxItems: 6, uniqueItems: true, items: roomRefSchema },
          rooms: { type: 'array', maxItems: 6, items: roomSchema },
        },
        additionalProperties: false,
      },
      {
        type: 'object',
        required: ['schemaVersion', 'stateVersion', 'status', 'phase', 'availableMarkets'],
        properties: {
          schemaVersion: { const: 1 }, stateVersion: stateVersionSchema,
          status: { const: 'unsupported_market' }, phase: phaseSchema,
          availableMarkets: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string', minLength: 2, maxLength: 80 } },
        },
        additionalProperties: false,
      },
      failureSchema,
    ],
  },
  explain_synergy_match: outputUnion({
    type: 'object',
    required: [
      'schemaVersion', 'stateVersion', 'status', 'phase', 'roomRef', 'personRef', 'displayName',
      'scoreSource', 'score', 'evidencePercent', 'readLabel', 'reasonCodes', 'reasonLabels', 'visibleExplanation',
    ],
    properties: {
      schemaVersion: { const: 1 }, stateVersion: stateVersionSchema,
      status: { const: 'synergy_explanation_ready' }, phase: { const: 'SYNERGY_EXPLAINED' },
      roomRef: roomRefSchema, personRef: personRefSchema,
      displayName: { type: 'string', minLength: 1, maxLength: 40 },
      scoreSource: { const: 'synthetic_fixture' },
      score: { type: 'integer', minimum: 0, maximum: 100 },
      evidencePercent: { type: 'integer', minimum: 0, maximum: 100 },
      readLabel: { type: 'string', enum: ['strong_read', 'good_read', 'early_read'] },
      reasonCodes: { type: 'array', minItems: 3, maxItems: 3, uniqueItems: true, items: { type: 'string', enum: synergyReasonCodes } },
      reasonLabels: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string', minLength: 1, maxLength: 100 } },
      visibleExplanation: { const: true },
    },
    additionalProperties: false,
  }),
  compare_shortlist: outputUnion({
    type: 'object',
    required: ['schemaVersion', 'stateVersion', 'status', 'phase', 'roomRefs', 'dimensions'],
    properties: {
      schemaVersion: { const: 1 }, stateVersion: stateVersionSchema,
      status: { const: 'comparison_ready' }, phase: { const: 'COMPARISON_READY' },
      roomRefs: { type: 'array', minItems: 2, maxItems: 3, uniqueItems: true, items: roomRefSchema },
      dimensions: { type: 'array', minItems: 1, maxItems: 6, uniqueItems: true, items: { type: 'string', enum: comparisonDimensions } },
    },
    additionalProperties: false,
  }),
  prepare_introduction: outputUnion({
    type: 'object',
    required: [
      'schemaVersion', 'stateVersion', 'status', 'phase', 'draftRef', 'roomRef',
      'tone', 'highlightCodes', 'visibleConfirmation',
    ],
    properties: {
      schemaVersion: { const: 1 }, stateVersion: stateVersionSchema,
      status: { const: 'awaiting_human_confirmation' }, phase: { const: 'INTRODUCTION_STAGED' },
      draftRef: { type: 'string', pattern: '^introduction_[0-9]{2}_[0-9]{2}$' },
      roomRef: roomRefSchema,
      tone: { type: 'string', enum: ['warm', 'direct', 'casual'] },
      highlightCodes: { type: 'array', maxItems: 3, uniqueItems: true, items: { type: 'string', enum: safeReasonCodes } },
      visibleConfirmation: { const: true },
    },
    additionalProperties: false,
  }),
} as const;
