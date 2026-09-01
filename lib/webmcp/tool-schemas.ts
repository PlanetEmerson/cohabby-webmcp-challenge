import type { FromSchema } from 'json-schema-to-ts';

export const stageLivingBriefInputSchema = {
  type: 'object',
  minProperties: 1,
  properties: {
    market: { type: 'string', minLength: 2, maxLength: 80 },
    currency: { type: 'string', pattern: '^[A-Z]{3}$' },
    maxMonthlyBudget: { type: 'integer', minimum: 100, maximum: 50000 },
    moveWindow: { type: 'string', enum: ['now', 'within_30_days', 'within_60_days', 'flexible'] },
    homeType: { type: 'string', enum: ['room_in_shared_home', 'entire_place', 'either'] },
    pets: { type: 'string', enum: ['none', 'cat', 'dog', 'other', 'flexible'] },
    smoking: { type: 'string', enum: ['no_smoking', 'outdoor_only', 'flexible'] },
    quietTime: { type: 'string', enum: ['early_evenings', 'late_evenings', 'flexible'] },
  },
  additionalProperties: false,
} as const;

export const safeReasonCodes = [
  'budget_fit',
  'move_timing_fit',
  'home_type_fit',
  'pet_fit',
  'smoke_free_fit',
  'quiet_time_fit',
  'house_rules_fit',
] as const;

export const getLivingContextInputSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
} as const;

export const findCompatibleRoomsInputSchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 6 },
    order: { type: 'string', enum: ['best_fit', 'lowest_price', 'soonest_move'] },
  },
  additionalProperties: false,
} as const;

export const compareShortlistInputSchema = {
  type: 'object',
  required: ['roomRefs'],
  properties: {
    roomRefs: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      uniqueItems: true,
      items: { type: 'string', pattern: '^room_[a-z0-9_]{3,48}$' },
    },
    dimensions: {
      type: 'array',
      minItems: 1,
      maxItems: 5,
      uniqueItems: true,
      items: {
        type: 'string',
        enum: ['budget', 'move_timing', 'home_rhythm', 'house_rules', 'practical_fit'],
      },
    },
  },
  additionalProperties: false,
} as const;

export const prepareIntroductionInputSchema = {
  type: 'object',
  required: ['roomRef', 'tone'],
  properties: {
    roomRef: { type: 'string', pattern: '^room_[a-z0-9_]{3,48}$' },
    tone: { type: 'string', enum: ['warm', 'direct', 'casual'] },
    highlightCodes: {
      type: 'array',
      maxItems: 3,
      uniqueItems: true,
      items: { type: 'string', enum: safeReasonCodes },
    },
  },
  additionalProperties: false,
} as const;

export type StageLivingBriefInput = FromSchema<typeof stageLivingBriefInputSchema>;
export type GetLivingContextInput = FromSchema<typeof getLivingContextInputSchema>;
export type FindCompatibleRoomsInput = FromSchema<typeof findCompatibleRoomsInputSchema>;
export type CompareShortlistInput = FromSchema<typeof compareShortlistInputSchema>;
export type PrepareIntroductionInput = FromSchema<typeof prepareIntroductionInputSchema>;
export type ToolName =
  | 'get_living_context'
  | 'stage_living_brief'
  | 'find_compatible_rooms'
  | 'compare_shortlist'
  | 'prepare_introduction';

export type ToolInputMap = {
  get_living_context: GetLivingContextInput;
  stage_living_brief: StageLivingBriefInput;
  find_compatible_rooms: FindCompatibleRoomsInput;
  compare_shortlist: CompareShortlistInput;
  prepare_introduction: PrepareIntroductionInput;
};

export const toolInputSchemas = {
  get_living_context: getLivingContextInputSchema,
  stage_living_brief: stageLivingBriefInputSchema,
  find_compatible_rooms: findCompatibleRoomsInputSchema,
  compare_shortlist: compareShortlistInputSchema,
  prepare_introduction: prepareIntroductionInputSchema,
} as const;
