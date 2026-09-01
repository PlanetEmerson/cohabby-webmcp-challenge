import { describe, expect, it } from 'vitest';

import { createDecisionRoomActivityStore } from '@/lib/decision-room/activity-store';

describe('Decision Room activity store', () => {
  it('publishes one visible agent activity from running through completion', () => {
    const store = createDecisionRoomActivityStore();
    const token = store.begin('agent', 'find_compatible_rooms');

    expect(store.getSnapshot()).toMatchObject({
      actor: 'agent',
      action: 'find_compatible_rooms',
      status: 'running',
    });

    store.complete(token, {
      stateVersion: 4,
      targetRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
    });

    expect(store.getSnapshot()).toMatchObject({
      actor: 'agent',
      action: 'find_compatible_rooms',
      status: 'complete',
      stateVersion: 4,
      targetRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
    });
  });

  it('ignores stale completion after a human reset and records cancellation safely', () => {
    const store = createDecisionRoomActivityStore();
    const stale = store.begin('agent', 'compare_shortlist');

    store.reset();
    store.complete(stale, { stateVersion: 8, targetRefs: ['room_nyc_cedar'] });
    expect(store.getSnapshot()).toMatchObject({ status: 'idle', workspaceGeneration: 2 });

    const canceled = store.begin('agent', 'prepare_introduction');
    store.fail(canceled, 'canceled', 8);
    expect(store.getSnapshot()).toMatchObject({
      action: 'prepare_introduction',
      status: 'canceled',
      errorCode: 'canceled',
      stateVersion: 8,
    });
  });
});
