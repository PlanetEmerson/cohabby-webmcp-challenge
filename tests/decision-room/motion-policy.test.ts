import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('CoHabby Living motion policy', () => {
  it('keeps causal motion and makes the Synergy shimmer reduced-motion safe', () => {
    const page = readFileSync('components/decision-room/decision-room.tsx', 'utf8');
    const stages = [
      readFileSync('components/decision-room/living-plan-stages.tsx', 'utf8'),
      readFileSync('components/decision-room/match-stages.tsx', 'utf8'),
      readFileSync('components/decision-room/connection-stages.tsx', 'utf8'),
    ].join('\n');
    const field = readFileSync('components/decision-room/living-field.tsx', 'utf8');
    const css = readFileSync('app/globals.css', 'utf8');

    expect(page).toContain('reducedMotion="user"');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(field).toContain('prefers-reduced-motion: reduce');
    expect(field).toContain("connection?.saveData");
    expect(field).toContain('data-living-field={animated ? \'shader\' : \'static\'}');
    expect(css).toContain('@keyframes synergy-button-shimmer');
    expect(css).toContain('.synergy-shimmer::after');
    expect(css).toMatch(/prefers-reduced-motion:[\s\S]*\.synergy-shimmer::after[\s\S]*animation:\s*none/u);
    expect(`${page}\n${stages}`).not.toMatch(/repeat:\s*(?:Infinity|-1)|whileInView|useScroll|useAnimationFrame/u);
  });
});
