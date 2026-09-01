import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Living Matchboard motion policy', () => {
  it('uses user-controlled causal motion without looping or scroll effects', () => {
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
    expect(`${page}\n${stages}`).not.toMatch(/repeat:\s*(?:Infinity|-1)|whileInView|useScroll|useAnimationFrame/u);
  });
});
