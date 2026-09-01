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
      const index = input.room.reasonCodes.indexOf(code);
      return index >= 0 ? input.room.reasonLabels[index] : null;
    })
    .filter((label): label is string => Boolean(label));
  const reasons = labels.length > 0
    ? `The details that stand out are ${labels.join(', ').toLowerCase()}.`
    : 'The practical details look like a good fit for my current search.';

  if (input.tone === 'direct') {
    return `Hi, I'm interested in ${input.room.headline}. ${reasons} Could we talk through availability and the shared-home rules?`;
  }
  if (input.tone === 'casual') {
    return `Hi! ${input.room.headline} caught my eye. ${reasons} I'd be happy to chat about the room and how the home works day to day.`;
  }
  return `Hi! I'm interested in ${input.room.headline}. ${reasons} I'd love to learn more about the room and see whether it could be a good practical fit.`;
}
