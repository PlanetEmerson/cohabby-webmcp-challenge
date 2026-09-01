import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Living Matchboard motion policy', () => {
  it('uses user-controlled causal motion without looping or scroll effects', () => {
    const page = readFileSync('components/decision-room/decision-room.tsx', 'utf8');
    const parts = readFileSync('components/decision-room/matchboard-parts.tsx', 'utf8');
    const css = readFileSync('app/globals.css', 'utf8');

    expect(page).toContain('reducedMotion="user"');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(`${page}\n${parts}`).not.toMatch(/repeat:\s*(?:Infinity|-1)|whileInView|useScroll|useAnimationFrame/u);
  });
});
