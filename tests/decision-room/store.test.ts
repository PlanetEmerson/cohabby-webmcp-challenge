import { describe, expect, it } from 'vitest';

import { createDecisionRoomStore, DecisionRoomError } from '@/lib/decision-room/store';
import type { LivingDataSourceResult } from '@/lib/decision-room/living-data-source';

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

describe('DecisionRoomStore', () => {
  it('stages a reversible brief and requires the human proposal reference to apply it', () => {
    const store = createDecisionRoomStore();

    expect(store.getState()).toMatchObject({ phase: 'READY', stateVersion: 1 });

    const staged = store.stageLivingBrief(sampleBrief);
    expect(staged).toEqual({ proposalRef: 'proposal_brief_01_01', stateVersion: 2 });
    expect(store.getState()).toMatchObject({
      phase: 'BRIEF_STAGED',
      appliedBrief: null,
      stagedBrief: { proposalRef: 'proposal_brief_01_01', values: sampleBrief },
      stateVersion: 2,
    });

    expect(() => store.applyBriefByHuman('proposal_brief_stale')).toThrowError(
      new DecisionRoomError('stale_reference'),
    );

    expect(store.applyBriefByHuman(staged.proposalRef)).toEqual({ stateVersion: 3 });
    expect(store.getState()).toMatchObject({
      phase: 'BRIEF_APPLIED_BY_HUMAN',
      appliedBrief: sampleBrief,
      stagedBrief: null,
      stateVersion: 3,
    });
  });

  it('lets the human edit or discard a staged brief without applying hidden changes', () => {
    const store = createDecisionRoomStore();
    const staged = store.stageLivingBrief({ market: 'NYC', maxMonthlyBudget: 2100 });

    expect(store.updateStagedBrief({
      market: 'New York',
      currency: 'USD',
      maxMonthlyBudget: 1900,
    })).toEqual({ proposalRef: staged.proposalRef, stateVersion: 3 });
    expect(store.getState().stagedBrief?.values).toEqual({
      market: 'New York',
      currency: 'USD',
      maxMonthlyBudget: 1900,
    });

    expect(store.discardStagedBrief()).toEqual({ stateVersion: 4 });
    expect(store.getState()).toMatchObject({
      phase: 'READY',
      appliedBrief: null,
      stagedBrief: null,
      stateVersion: 4,
    });
  });

  it('searches only after human approval and commits one current result generation', async () => {
    const store = createDecisionRoomStore();

    await expect(store.findCompatibleRooms({}, new AbortController().signal)).rejects.toEqual(
      new DecisionRoomError('invalid_state'),
    );

    const staged = store.stageLivingBrief(sampleBrief);
    store.applyBriefByHuman(staged.proposalRef);
    const result = await store.findCompatibleRooms(
      { limit: 6, order: 'best_fit' },
      new AbortController().signal,
    );

    expect(result).toEqual({
      status: 'results_ready',
      resultGeneration: 1,
      stateVersion: 4,
      visibleRoomRefs: ['room_nyc_cedar', 'room_nyc_hudson', 'room_nyc_linden'],
    });
    expect(store.getState()).toMatchObject({
      phase: 'RESULTS_READY',
      stateVersion: 4,
      results: { generation: 1 },
      comparison: null,
      introduction: null,
      receipt: null,
    });
  });

  it('compares current rooms, prepares a local draft, and leaves final confirmation to the human', async () => {
    const store = createDecisionRoomStore();
    const staged = store.stageLivingBrief(sampleBrief);
    store.applyBriefByHuman(staged.proposalRef);
    await store.findCompatibleRooms({ limit: 6, order: 'best_fit' }, new AbortController().signal);

    expect(store.compareShortlist({
      roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
      dimensions: ['budget', 'home_rhythm'],
    })).toEqual({
      roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'],
      dimensions: ['budget', 'home_rhythm'],
      stateVersion: 5,
    });
    expect(store.getState().phase).toBe('COMPARISON_READY');

    expect(store.prepareIntroduction({
      roomRef: 'room_nyc_cedar',
      tone: 'warm',
      highlightCodes: ['budget_fit', 'pet_fit'],
    })).toEqual({
      draftRef: 'introduction_01_01',
      roomRef: 'room_nyc_cedar',
      stateVersion: 6,
      visibleConfirmation: true,
    });
    expect(store.getState()).toMatchObject({
      phase: 'INTRODUCTION_STAGED',
      introduction: {
        draftRef: 'introduction_01_01',
        roomRef: 'room_nyc_cedar',
        isSafeToConfirm: true,
      },
    });

    expect(store.confirmIntroductionByHuman()).toEqual({
      receiptRef: 'receipt_demo_01_01',
      stateVersion: 7,
    });
    expect(store.getState()).toMatchObject({
      phase: 'INTRODUCTION_CONFIRMED_BY_HUMAN',
      receipt: { message: 'Demo confirmed. No real message was sent.' },
    });

    expect(store.resetByHuman()).toEqual({ stateVersion: 8, workspaceGeneration: 2 });
    expect(store.getState()).toMatchObject({
      phase: 'READY',
      stateVersion: 8,
      workspaceGeneration: 2,
      appliedBrief: null,
      results: null,
      comparison: null,
      introduction: null,
      receipt: null,
    });
  });

  it('keeps contact details out of a human-confirmed demo introduction', async () => {
    const store = createDecisionRoomStore();
    const staged = store.stageLivingBrief(sampleBrief);
    store.applyBriefByHuman(staged.proposalRef);
    await store.findCompatibleRooms({ limit: 6, order: 'best_fit' }, new AbortController().signal);
    store.compareShortlist({ roomRefs: ['room_nyc_cedar', 'room_nyc_hudson'] });
    store.prepareIntroduction({ roomRef: 'room_nyc_cedar', tone: 'direct' });

    expect(store.updateIntroductionDraft('Call me at +1 212 555 0114 about 17 Cedar Street.')).toEqual({
      stateVersion: 7,
      isSafeToConfirm: false,
    });
    expect(() => store.confirmIntroductionByHuman()).toThrowError(
      new DecisionRoomError('invalid_input'),
    );
    expect(store.getState().stateVersion).toBe(7);

    expect(store.updateIntroductionDraft('Hi, I would like to learn more about the room and shared-home rules.')).toEqual({
      stateVersion: 8,
      isSafeToConfirm: true,
    });
    expect(store.confirmIntroductionByHuman()).toEqual({
      receiptRef: 'receipt_demo_01_01',
      stateVersion: 9,
    });
  });

  it('does not resolve a visible mutation until React acknowledges that version', async () => {
    const store = createDecisionRoomStore();
    const staged = store.stageLivingBrief(sampleBrief);
    let settled = false;
    const waiting = store.waitForRendered(staged.stateVersion, new AbortController().signal)
      .then(() => { settled = true; });

    await Promise.resolve();
    expect(settled).toBe(false);
    store.acknowledgeRendered(staged.stateVersion);
    await waiting;
    expect(settled).toBe(true);

    const canceled = new AbortController();
    const canceledWait = store.waitForRendered(staged.stateVersion + 1, canceled.signal);
    canceled.abort();
    await expect(canceledWait).rejects.toEqual(new DecisionRoomError('canceled'));
  });

  it('cancels in-flight data work when the human resets the workspace', async () => {
    let resolveSearch!: (result: LivingDataSourceResult) => void;
    let observedSignal: AbortSignal | null = null;
    const dataSource = {
      findCompatibleRooms: async (_brief: unknown, _request: unknown, signal: AbortSignal) => {
        observedSignal = signal;
        return new Promise<LivingDataSourceResult>((resolve) => { resolveSearch = resolve; });
      },
    };
    const store = createDecisionRoomStore(dataSource);
    const staged = store.stageLivingBrief(sampleBrief);
    store.applyBriefByHuman(staged.proposalRef);
    const pending = store.findCompatibleRooms({}, new AbortController().signal);

    store.resetByHuman();
    expect((observedSignal as AbortSignal | null)?.aborted).toBe(true);
    resolveSearch({ status: 'ok', rooms: [] });
    await expect(pending).rejects.toEqual(new DecisionRoomError('canceled'));
    expect(store.getState()).toMatchObject({ phase: 'READY', stateVersion: 4 });
  });
});
