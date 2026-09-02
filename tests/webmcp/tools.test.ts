import { describe, expect, it } from 'vitest';

import { createDecisionRoomActivityStore } from '@/lib/decision-room/activity-store';
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
} as const;

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

describe('CoHabby Living WebMCP tools', () => {
  it('makes read and mutation activity visible without changing tool output', async () => {
    const store = createDecisionRoomStore();
    const activity = createDecisionRoomActivityStore();
    const tools = new Map(createWebMcpTools(store, activity).map((tool) => [tool.name, tool]));

    await tools.get('get_living_context')!.execute({}, {
      signal: new AbortController().signal,
    });
    expect(activity.getSnapshot()).toMatchObject({
      actor: 'agent',
      action: 'get_living_context',
      status: 'complete',
      stateVersion: 1,
    });

    const staged = Promise.resolve(tools.get('stage_living_brief')!.execute(sampleBrief, {
      signal: new AbortController().signal,
    }));
    await Promise.resolve();
    expect(activity.getSnapshot()).toMatchObject({
      action: 'stage_living_brief',
      status: 'running',
    });

    store.acknowledgeRendered(2);
    await staged;
    expect(activity.getSnapshot()).toMatchObject({
      action: 'stage_living_brief',
      status: 'complete',
      stateVersion: 2,
    });
  });

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
    const activity = createDecisionRoomActivityStore();
    const tools = new Map(createWebMcpTools(store, activity).map((tool) => [tool.name, tool]));

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
    expect(activity.getSnapshot()).toMatchObject({
      action: 'stage_living_brief',
      status: 'canceled',
      errorCode: 'canceled',
      stateVersion: 1,
    });
    expect(store.getState()).toMatchObject({ phase: 'READY', stateVersion: 1, stagedBrief: null });
  });

  it('rolls back a mutation canceled while React is acknowledging the visible version', async () => {
    const store = createDecisionRoomStore();
    const stage = createWebMcpTools(store).find((tool) => tool.name === 'stage_living_brief')!;
    const controller = new AbortController();
    const pending = Promise.resolve(stage.execute(sampleBrief, { signal: controller.signal }));
    await Promise.resolve();

    expect(store.getState()).toMatchObject({ phase: 'BRIEF_STAGED', stateVersion: 2 });
    controller.abort();
    await expect(pending).resolves.toMatchObject({
      stateVersion: 3,
      phase: 'READY',
      status: 'error',
      error: { code: 'canceled' },
    });
    expect(store.getState()).toMatchObject({ phase: 'READY', stateVersion: 3, stagedBrief: null });
  });

  it('rolls back results, Synergy, comparison, and introduction mutations canceled at the render boundary', async () => {
    const makeResultsStore = async () => {
      const store = createDecisionRoomStore();
      const staged = store.stageLivingBrief(sampleBrief);
      store.applyBriefByHuman(staged.proposalRef);
      await store.findCompatibleRooms({ limit: 6, order: 'best_fit' }, new AbortController().signal);
      return store;
    };

    const findStore = createDecisionRoomStore();
    const findStage = findStore.stageLivingBrief(sampleBrief);
    findStore.applyBriefByHuman(findStage.proposalRef);
    const findTool = createWebMcpTools(findStore).find((tool) => tool.name === 'find_compatible_rooms')!;
    const findController = new AbortController();
    const finding = Promise.resolve(findTool.execute({}, { signal: findController.signal }));
    for (let index = 0; index < 5 && findStore.getState().phase !== 'RESULTS_READY'; index += 1) {
      await Promise.resolve();
    }
    expect(findStore.getState().phase).toBe('RESULTS_READY');
    findController.abort();
    await expect(finding).resolves.toMatchObject({ status: 'error', error: { code: 'canceled' } });
    expect(findStore.getState()).toMatchObject({ phase: 'BRIEF_APPLIED_BY_HUMAN', stateVersion: 5, results: null });

    const explainStore = await makeResultsStore();
    const explainTool = createWebMcpTools(explainStore).find((tool) => tool.name === 'explain_synergy_match')!;
    const explainController = new AbortController();
    const explaining = Promise.resolve(explainTool.execute(
      { roomRef: 'room_nyc_cedar' },
      { signal: explainController.signal },
    ));
    await Promise.resolve();
    expect(explainStore.getState().phase).toBe('SYNERGY_EXPLAINED');
    explainController.abort();
    await expect(explaining).resolves.toMatchObject({ status: 'error', error: { code: 'canceled' } });
    expect(explainStore.getState()).toMatchObject({ phase: 'RESULTS_READY', stateVersion: 6, synergyExplanation: null });

    const compareStore = await makeResultsStore();
    const compareTool = createWebMcpTools(compareStore).find((tool) => tool.name === 'compare_shortlist')!;
    const compareController = new AbortController();
    const comparing = Promise.resolve(compareTool.execute(
      { roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'] },
      { signal: compareController.signal },
    ));
    await Promise.resolve();
    expect(compareStore.getState().phase).toBe('COMPARISON_READY');
    compareController.abort();
    await expect(comparing).resolves.toMatchObject({ status: 'error', error: { code: 'canceled' } });
    expect(compareStore.getState()).toMatchObject({ phase: 'RESULTS_READY', stateVersion: 6, comparison: null });

    const prepareStore = await makeResultsStore();
    prepareStore.compareShortlist({ roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'] });
    const prepareTool = createWebMcpTools(prepareStore).find((tool) => tool.name === 'prepare_introduction')!;
    const prepareController = new AbortController();
    const preparing = Promise.resolve(prepareTool.execute(
      { roomRef: 'room_nyc_cedar', tone: 'warm' },
      { signal: prepareController.signal },
    ));
    await Promise.resolve();
    expect(prepareStore.getState().phase).toBe('INTRODUCTION_STAGED');
    prepareController.abort();
    await expect(preparing).resolves.toMatchObject({ status: 'error', error: { code: 'canceled' } });
    expect(prepareStore.getState()).toMatchObject({ phase: 'COMPARISON_READY', stateVersion: 7, introduction: null });
  });

  it('lets a human reset win over an invocation waiting for render acknowledgement', async () => {
    const store = createDecisionRoomStore();
    const stage = createWebMcpTools(store).find((tool) => tool.name === 'stage_living_brief')!;
    const pending = Promise.resolve(stage.execute(sampleBrief, { signal: new AbortController().signal }));
    await Promise.resolve();
    store.resetByHuman();

    await expect(pending).resolves.toMatchObject({
      stateVersion: 3,
      phase: 'READY',
      status: 'error',
      error: { code: 'stale_execution' },
    });
    expect(store.getState()).toMatchObject({ phase: 'READY', stateVersion: 3, workspaceGeneration: 2 });
  });


  it('exposes the six exact tools through the real state machine and visible render boundary', async () => {
    const store = createDecisionRoomStore();
    const tools = createWebMcpTools(store);
    const byName = new Map(tools.map((tool) => [tool.name, tool]));

    expect(tools.map((tool) => tool.name)).toEqual([
      'get_living_context',
      'stage_living_brief',
      'find_compatible_rooms',
      'explain_synergy_match',
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
      visibleProfileSignals: ['early_mornings', 'tidy_shared_spaces', 'quiet_weekends', 'cat_household'],
      synergyExplanationStatus: 'none',
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
      rooms: [
        expect.objectContaining({
          roomRef: 'room_nyc_cedar',
          housemate: expect.objectContaining({ displayName: 'Maya' }),
          synergy: expect.objectContaining({ source: 'synthetic_fixture', score: 92 }),
        }),
        expect.any(Object),
        expect.any(Object),
      ],
    });

    const explained = await executeAfterRendering(store, byName.get('explain_synergy_match')!, {
      roomRef: 'room_nyc_cedar',
    });
    expect(explained).toEqual({
      schemaVersion: 1,
      stateVersion: 5,
      status: 'synergy_explanation_ready',
      phase: 'SYNERGY_EXPLAINED',
      roomRef: 'room_nyc_cedar',
      personRef: 'person_demo_maya',
      displayName: 'Maya',
      scoreSource: 'synthetic_fixture',
      score: 92,
      evidencePercent: 88,
      readLabel: 'strong_read',
      reasonCodes: ['daily_rhythm_fit', 'shared_space_fit', 'household_boundaries_fit'],
      reasonLabels: ['Both prefer quiet mornings', 'Both value tidy shared spaces', 'Clear household boundaries align'],
      visibleExplanation: true,
    });

    const compared = await executeAfterRendering(store, byName.get('compare_shortlist')!, {
      roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
      dimensions: ['synergy_read', 'budget', 'home_rhythm'],
    });
    expect(compared).toEqual({
      schemaVersion: 1,
      stateVersion: 6,
      status: 'comparison_ready',
      phase: 'COMPARISON_READY',
      roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
      dimensions: ['synergy_read', 'budget', 'home_rhythm'],
    });

    const prepared = await executeAfterRendering(store, byName.get('prepare_introduction')!, {
      roomRef: 'room_nyc_cedar',
      tone: 'warm',
      highlightCodes: ['budget_fit', 'pet_fit'],
    });
    expect(prepared).toEqual({
      schemaVersion: 1,
      stateVersion: 7,
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

  it('does not commit a pre-canceled Synergy explanation', async () => {
    const store = createDecisionRoomStore();
    const byName = new Map(createWebMcpTools(store).map((tool) => [tool.name, tool]));
    const staged = store.stageLivingBrief(sampleBrief);
    store.applyBriefByHuman(staged.proposalRef);
    await store.findCompatibleRooms({ limit: 6, order: 'best_fit' }, new AbortController().signal);
    const canceled = new AbortController();
    canceled.abort();

    await expect(byName.get('explain_synergy_match')!.execute(
      { roomRef: 'room_nyc_cedar' },
      { signal: canceled.signal },
    )).resolves.toMatchObject({
      stateVersion: 4,
      status: 'error',
      error: { code: 'canceled' },
    });
    expect(store.getState()).toMatchObject({ phase: 'RESULTS_READY', stateVersion: 4, synergyExplanation: null });
  });
});
