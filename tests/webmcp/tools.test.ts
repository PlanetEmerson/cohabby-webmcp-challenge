import { describe, expect, it } from 'vitest';

import { createDecisionRoomStore } from '@/lib/decision-room/store';
import { createWebMcpTools } from '@/lib/webmcp/tools';

const sampleBrief = {
  market: 'New York',
  currency: 'USD',
  maxMonthlyBudget: 1900,
  moveWindow: 'within_30_days',
  homeType: 'room_in_shared_home',
  pets: 'cat',
  smoking: 'no_smoking',
  quietTime: 'early_evenings',
};

async function executeAfterRendering(
  store: ReturnType<typeof createDecisionRoomStore>,
  tool: WebMCP.ModelContextTool,
  input: Record<string, unknown>,
) {
  const result = Promise.resolve(tool.execute(input, { signal: new AbortController().signal }));
  await Promise.resolve();
  store.acknowledgeRendered(store.getState().stateVersion);
  return result;
}

describe('Living Decision Room WebMCP tools', () => {
  it('supports Chrome preview runtimes that omit callback options while retaining visible completion', async () => {
    const store = createDecisionRoomStore();
    const stage = createWebMcpTools(store).find((tool) => tool.name === 'stage_living_brief')!;
    const pending = Promise.resolve(stage.execute(sampleBrief, undefined as unknown as WebMCP.ToolExecuteCallbackOptions));
    await Promise.resolve();
    store.acknowledgeRendered(2);
    await expect(pending).resolves.toMatchObject({
      status: 'awaiting_human_review',
      stateVersion: 2,
    });
  });

  it('returns typed failures and does not mutate state for a pre-canceled invocation', async () => {
    const store = createDecisionRoomStore();
    const tools = new Map(createWebMcpTools(store).map((tool) => [tool.name, tool]));

    await expect(tools.get('find_compatible_rooms')!.execute({}, {
      signal: new AbortController().signal,
    })).resolves.toEqual({
      schemaVersion: 1,
      stateVersion: 1,
      status: 'error',
      phase: 'READY',
      error: {
        code: 'invalid_state',
        message: 'Complete the visible human review step before using this action.',
      },
    });

    const canceled = new AbortController();
    canceled.abort();
    await expect(tools.get('stage_living_brief')!.execute(sampleBrief, {
      signal: canceled.signal,
    })).resolves.toMatchObject({
      stateVersion: 1,
      status: 'error',
      error: { code: 'canceled' },
    });
    expect(store.getState()).toMatchObject({ phase: 'READY', stateVersion: 1, stagedBrief: null });
  });


  it('exposes the five exact tools through the real state machine and visible render boundary', async () => {
    const store = createDecisionRoomStore();
    const tools = createWebMcpTools(store);
    const byName = new Map(tools.map((tool) => [tool.name, tool]));

    expect(tools.map((tool) => tool.name)).toEqual([
      'get_living_context',
      'stage_living_brief',
      'find_compatible_rooms',
      'compare_shortlist',
      'prepare_introduction',
    ]);
    expect(tools[0].annotations).toEqual({ readOnlyHint: true });
    expect(tools.slice(1).every((tool) => tool.annotations?.readOnlyHint !== true)).toBe(true);

    expect(await byName.get('get_living_context')!.execute({}, {
      signal: new AbortController().signal,
    })).toEqual({
      schemaVersion: 1,
      stateVersion: 1,
      status: 'ready',
      phase: 'READY',
      visibleRoomRefs: [],
      shortlistCount: 0,
      introductionStatus: 'none',
    });

    const staged = await executeAfterRendering(
      store,
      byName.get('stage_living_brief')!,
      sampleBrief,
    );
    expect(staged).toEqual({
      schemaVersion: 1,
      stateVersion: 2,
      status: 'awaiting_human_review',
      phase: 'BRIEF_STAGED',
      proposalRef: 'proposal_brief_01_01',
      changedFields: Object.keys(sampleBrief),
      visibleConfirmation: true,
    });

    store.applyBriefByHuman('proposal_brief_01_01');
    const foundPromise = Promise.resolve(byName.get('find_compatible_rooms')!.execute(
      { limit: 6, order: 'best_fit' },
      { signal: new AbortController().signal },
    ));
    await Promise.resolve();
    await Promise.resolve();
    store.acknowledgeRendered(4);
    const found = await foundPromise;
    expect(found).toMatchObject({
      schemaVersion: 1,
      stateVersion: 4,
      status: 'results_ready',
      phase: 'RESULTS_READY',
      resultGeneration: 1,
      visibleRoomRefs: ['room_nyc_cedar', 'room_nyc_hudson', 'room_nyc_linden'],
    });

    const compared = await executeAfterRendering(store, byName.get('compare_shortlist')!, {
      roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
      dimensions: ['budget', 'home_rhythm'],
    });
    expect(compared).toEqual({
      schemaVersion: 1,
      stateVersion: 5,
      status: 'comparison_ready',
      phase: 'COMPARISON_READY',
      roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
      dimensions: ['budget', 'home_rhythm'],
    });

    const prepared = await executeAfterRendering(store, byName.get('prepare_introduction')!, {
      roomRef: 'room_nyc_cedar',
      tone: 'warm',
      highlightCodes: ['budget_fit', 'pet_fit'],
    });
    expect(prepared).toEqual({
      schemaVersion: 1,
      stateVersion: 6,
      status: 'awaiting_human_confirmation',
      phase: 'INTRODUCTION_STAGED',
      draftRef: 'introduction_01_01',
      roomRef: 'room_nyc_cedar',
      tone: 'warm',
      highlightCodes: ['budget_fit', 'pet_fit'],
      visibleConfirmation: true,
    });

    expect(byName.has('apply_living_brief')).toBe(false);
    expect(byName.has('confirm_introduction')).toBe(false);
  });
});
