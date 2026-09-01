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
const forbiddenInputKeys = new Set(['__proto__', 'prototype', 'constructor']);

function isBoundedPlainInput(
  value: unknown,
  depth = 0,
  seen = new Set<object>(),
): boolean {
  if (depth > 8) return false;
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.length <= 600;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object') return false;
  if (seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) {
    return value.length <= 32
      && value.every((item) => isBoundedPlainInput(item, depth + 1, seen));
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const keys = Reflect.ownKeys(value);
  if (keys.length > 32 || keys.some((key) => typeof key !== 'string')) return false;
  return keys.every((key) => {
    if (typeof key !== 'string' || forbiddenInputKeys.has(key.toLowerCase())) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return Boolean(
      descriptor
      && 'value' in descriptor
      && isBoundedPlainInput(descriptor.value, depth + 1, seen),
    );
  });
}

function hasSafeInputShape(value: unknown): boolean {
  try {
    return isBoundedPlainInput(value);
  } catch {
    return false;
  }
}

export function containsUnsafeHousingLanguage(value: string): boolean {
  return unsafeHousingLanguage.test(value.normalize('NFKC'));
}

export function parseToolInput<Name extends ToolName>(
  name: Name,
  input: unknown,
): ToolInputMap[Name] {
  if (!hasSafeInputShape(input) || !validators[name](input)) {
    throw new ToolContractError('invalid_input');
  }
  if (
    name === 'stage_living_brief'
    && typeof (input as { market?: unknown }).market === 'string'
    && containsUnsafeHousingLanguage((input as { market: string }).market)
  ) {
    throw new ToolContractError('unsafe_housing_request');
  }
  return input as ToolInputMap[Name];
}
