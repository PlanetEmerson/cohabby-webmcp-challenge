import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('CoHabby Living public name', () => {
  it('uses the short product name across browser metadata and submission materials', () => {
    const layout = readFileSync('app/layout.tsx', 'utf8');
    expect(layout).toContain("title: 'CoHabby Living | Compatibility-first roommate finder'");
    expect(layout).toContain("applicationName: 'CoHabby Living'");

    const publicMaterials = [
      'README.md',
      'docs/DEMO_SCRIPT.md',
      'docs/DEMO_CAPTIONS.srt',
      'docs/DEVPOST_SUBMISSION.md',
      'docs/FINAL_SUBMISSION_CHECKLIST.md',
      'docs/YOUTUBE_PACKAGE.md',
    ].map((path) => readFileSync(path, 'utf8')).join('\n');

    expect(publicMaterials).toContain('CoHabby Living');
    expect(publicMaterials).not.toContain('Living Decision Room');
  });
});
