export type StandaloneValidator = ((input: unknown) => boolean) & { errors?: unknown };

export const validateGetLivingContext: StandaloneValidator;
export const validateStageLivingBrief: StandaloneValidator;
export const validateFindCompatibleRooms: StandaloneValidator;
export const validateExplainSynergyMatch: StandaloneValidator;
export const validateCompareShortlist: StandaloneValidator;
export const validatePrepareIntroduction: StandaloneValidator;
export const validateOutputGetLivingContext: StandaloneValidator;
export const validateOutputStageLivingBrief: StandaloneValidator;
export const validateOutputFindCompatibleRooms: StandaloneValidator;
export const validateOutputExplainSynergyMatch: StandaloneValidator;
export const validateOutputCompareShortlist: StandaloneValidator;
export const validateOutputPrepareIntroduction: StandaloneValidator;
