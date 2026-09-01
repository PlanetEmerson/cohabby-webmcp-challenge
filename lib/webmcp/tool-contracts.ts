import {
  validateCompareShortlist,
  validateFindCompatibleRooms,
  validateExplainSynergyMatch,
  validateGetLivingContext,
  validatePrepareIntroduction,
  validateStageLivingBrief,
  type StandaloneValidator,
} from './generated/tool-validators.mjs';
import type { ToolInputMap, ToolName } from './tool-schemas';

export * from './tool-schemas';

export type ToolErrorCode =
  | 'invalid_input'
  | 'invalid_state'
  | 'stale_reference'
  | 'stale_execution'
  | 'unsupported_market'
  | 'unsafe_housing_request'
  | 'canceled'
  | 'internal_error';

export class ToolContractError extends Error {
  readonly code: ToolErrorCode;

  constructor(code: ToolErrorCode) {
    super(code);
    this.name = 'ToolContractError';
    this.code = code;
  }
}

const validators: Record<ToolName, StandaloneValidator> = {
  get_living_context: validateGetLivingContext,
  stage_living_brief: validateStageLivingBrief,
  find_compatible_rooms: validateFindCompatibleRooms,
  explain_synergy_match: validateExplainSynergyMatch,
  compare_shortlist: validateCompareShortlist,
  prepare_introduction: validatePrepareIntroduction,
};

const unsafeHousingLanguage = /\b(?:white|black|asian|latino|latina|hispanic|ethnicity|race|racial|christian|muslim|jewish|hindu|religion|religious|women|woman|men|gender|transgender|gay|lesbian|straight|sexuality|children|childless|families|family status|pregnant|married|single only|disabled|disability|wheelchair|medical condition|young people|seniors|age group|citizen|immigrant|immigration|nationality|section 8|income source|demographic|demographics)\b/i;

export function containsUnsafeHousingLanguage(value: string): boolean {
  return unsafeHousingLanguage.test(value.normalize('NFKC'));
}

export function parseToolInput<Name extends ToolName>(
  name: Name,
  input: unknown,
): ToolInputMap[Name] {
  if (!validators[name](input)) throw new ToolContractError('invalid_input');
  if (
    name === 'stage_living_brief'
    && typeof (input as { market?: unknown }).market === 'string'
    && containsUnsafeHousingLanguage((input as { market: string }).market)
  ) {
    throw new ToolContractError('unsafe_housing_request');
  }
  return input as ToolInputMap[Name];
}
