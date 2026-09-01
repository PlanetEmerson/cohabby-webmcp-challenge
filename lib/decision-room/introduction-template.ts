import type { SafeReasonCode, SafeRoomSummary } from './types';

const unsafeDraftPattern = /(?:\b(?:white|black|asian|latino|latina|hispanic|christian|muslim|jewish|race|religion|gender|transgender|gay|lesbian|children|childless|disabled|disability|citizen|immigrant|demographic)\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|(?:\+?\d[\d\s().-]{7,}\d)|\b\d{1,5}\s+[A-Za-z][A-Za-z .'-]{1,40}\s(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Boulevard|Blvd)\b)/i;

export function isSafeIntroductionDraft(value: string): boolean {
  return value.length > 0 && value.length <= 600 && !unsafeDraftPattern.test(value.normalize('NFKC'));
}

export function buildIntroductionDraft(input: Readonly<{
  room: SafeRoomSummary;
  tone: 'warm' | 'direct' | 'casual';
  highlightCodes: ReadonlyArray<SafeReasonCode>;
}>): string {
  const labels = input.highlightCodes
    .map((code) => {
      const practicalIndex = input.room.reasonCodes.indexOf(code);
      if (practicalIndex >= 0) return input.room.reasonLabels[practicalIndex] ?? null;
      const synergyCodes: ReadonlyArray<SafeReasonCode> = input.room.synergy.reasonCodes;
      const synergyIndex = synergyCodes.indexOf(code);
      return synergyIndex >= 0 ? input.room.synergy.reasonLabels[synergyIndex] ?? null : null;
    })
    .filter((label): label is string => Boolean(label));
  const reasons = labels.length > 0
    ? `A few things line up: ${labels.join(', ').toLowerCase()}.`
    : 'The practical details look like a good fit for my current search.';

  if (input.tone === 'direct') {
    return `Hi ${input.room.housemate.displayName}, it looks like our home habits may fit. ${reasons} Are you open to a quick chat about shared-space habits and the home?`;
  }
  if (input.tone === 'casual') {
    return `Hey ${input.room.housemate.displayName}! It looks like our home habits may fit. ${reasons} Want to compare roommate routines and talk about the home?`;
  }
  return `Hi ${input.room.housemate.displayName}! It looks like our home habits may fit. ${reasons} I'd like to compare how we each use shared space and see whether the home could work for both of us.`;
}
