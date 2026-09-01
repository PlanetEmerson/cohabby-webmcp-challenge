import tailwindConfig from '../../tailwind.config';

type Palette = Record<string, string | Record<string, string>>;

function relativeLuminance(hex: string): number {
  const [red, green, blue] = hex
    .slice(1)
    .match(/../g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);

  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
}

function contrastRatio(foreground: string, background: string): number {
  const luminances = [relativeLuminance(foreground), relativeLuminance(background)]
    .sort((left, right) => right - left);

  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

describe('Craft Era text treatments', () => {
  const colors = tailwindConfig.theme?.extend?.colors as Palette;
  const primary = colors.primary as Record<string, string>;
  const info = colors.info as Record<string, string>;
  const success = colors.success as Record<string, string>;
  const warning = colors.warning as Record<string, string>;
  const accent = colors.accent as Record<string, string>;
  const gold = colors.gold as Record<string, string>;
  const neutral = colors.neutral as Record<string, string>;
  const text = colors.text as Record<string, string>;

  it.each([
    ['primary CTA', text.primary, primary.DEFAULT],
    ['primary CTA hover', text.primary, primary.dark],
    ['primary surface', primary.ink, primary.surface],
    ['info surface', info.dark, info.surface],
    ['success surface', success.dark, success.surface],
    ['warning surface', warning.dark, warning.surface],
    ['accent surface', accent.dark, accent.surface],
    ['gold surface', gold.dark, gold.surface],
    ['tertiary on canvas', text.tertiary, neutral['50']],
    ['tertiary on card', text.tertiary, neutral['0']],
    ['tertiary on neutral chip', text.tertiary, neutral['100']],
  ])('%s meets WCAG AA for normal text', (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['light coral CTA stop', text.primary, '#FF896E'],
    ['gold CTA stop', text.primary, '#F4C95D'],
    ['light teal CTA stop', text.primary, '#33B8AD'],
    ['Synergy score', text.primary, '#FFFFFF'],
  ])('%s keeps new V4 text contrast at WCAG AA', (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
