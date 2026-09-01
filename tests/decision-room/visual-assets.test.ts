import { statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { syntheticRoomFixtures } from '@/lib/decision-room/living-data-source';
import { personVisuals, roomVisuals } from '@/lib/decision-room/visual-assets';

function publicFile(url: string): string {
  return path.resolve('public', url.replace(/^\//, ''));
}

describe('owned synthetic visual assets', () => {
  it('maps every room and fictional person without exposing missing files', () => {
    expect(Object.keys(roomVisuals)).toHaveLength(12);
    expect(Object.keys(personVisuals)).toHaveLength(12);

    for (const fixture of syntheticRoomFixtures) {
      expect(roomVisuals[fixture.roomRef]).toMatch(/^\/assets\/rooms\/room_[a-z0-9_]+\.webp$/);
      expect(personVisuals[fixture.housemate.personRef]).toMatch(/^\/assets\/people\/person_demo_[a-z0-9_]+\.webp$/);
      expect(statSync(publicFile(roomVisuals[fixture.roomRef])).size).toBeLessThanOrEqual(180_000);
      expect(statSync(publicFile(personVisuals[fixture.housemate.personRef])).size).toBeLessThanOrEqual(60_000);
    }
  });
});
