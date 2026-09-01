export type StandaloneValidator = ((input: unknown) => boolean) & { errors?: unknown };

export const validateGetLivingContext: StandaloneValidator;
export const validateStageLivingBrief: StandaloneValidator;
export const validateFindCompatibleRooms: StandaloneValidator;
export const validateCompareShortlist: StandaloneValidator;
export const validatePrepareIntroduction: StandaloneValidator;
