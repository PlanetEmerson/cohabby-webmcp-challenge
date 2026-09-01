import {
  validateOutputCompareShortlist,
  validateOutputExplainSynergyMatch,
  validateOutputFindCompatibleRooms,
  validateOutputGetLivingContext,
  validateOutputPrepareIntroduction,
  validateOutputStageLivingBrief,
  type StandaloneValidator,
} from './generated/tool-validators.mjs';
import { assertSafeToolOutput } from './safe-output';
import type { ToolName } from './tool-schemas';

export class ToolOutputContractError extends Error {
  constructor() {
    super('invalid_output');
    this.name = 'ToolOutputContractError';
  }
}

const validators: Record<ToolName, StandaloneValidator> = {
  get_living_context: validateOutputGetLivingContext,
  stage_living_brief: validateOutputStageLivingBrief,
  find_compatible_rooms: validateOutputFindCompatibleRooms,
  explain_synergy_match: validateOutputExplainSynergyMatch,
  compare_shortlist: validateOutputCompareShortlist,
  prepare_introduction: validateOutputPrepareIntroduction,
};

export function assertToolOutput<Value>(name: ToolName, value: Value): Value {
  if (!validators[name](value)) throw new ToolOutputContractError();
  return assertSafeToolOutput(value);
}
