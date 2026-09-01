import type {
  CompareShortlistInput,
  ExplainSynergyMatchInput,
  FindCompatibleRoomsInput,
  PrepareIntroductionInput,
  StageLivingBriefInput,
  ToolErrorCode,
} from '@/lib/webmcp/tool-contracts';
import {
  syntheticLivingDataSource,
  type LivingDataSource,
} from './living-data-source';
import { buildIntroductionDraft, isSafeIntroductionDraft } from './introduction-template';
import type { DecisionRoomState, SafeReasonCode, StagedLivingBriefProposal } from './types';

export class DecisionRoomError extends Error {
  readonly code: ToolErrorCode;

  constructor(code: ToolErrorCode) {
    super(code);
    this.name = 'DecisionRoomError';
    this.code = code;
  }
}

const initialState = (): DecisionRoomState => ({
  schemaVersion: 1,
  stateVersion: 1,
  workspaceGeneration: 1,
  phase: 'READY',
  appliedBrief: null,
  stagedBrief: null,
  results: null,
  synergyExplanation: null,
  comparison: null,
  introduction: null,
  receipt: null,
  notice: null,
});

function padSequence(value: number): string {
  return String(value).padStart(2, '0');
}

function combineAbortSignals(signals: ReadonlyArray<AbortSignal>) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signals.forEach((signal) => {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
  return {
    signal: controller.signal,
    dispose: () => signals.forEach((signal) => signal.removeEventListener('abort', abort)),
  };
}

export function createDecisionRoomStore(dataSource: LivingDataSource = syntheticLivingDataSource) {
  let state = initialState();
  let proposalSequence = 0;
  let resultGeneration = 0;
  let introductionSequence = 0;
  let receiptSequence = 0;
  let renderedVersion = 0;
  let workspaceController = new AbortController();
  const listeners = new Set<() => void>();
  const renderWaiters = new Set<{
    version: number;
    resolve: () => void;
    reject: (error: DecisionRoomError) => void;
    signal: AbortSignal;
    onAbort: () => void;
  }>();

  const publish = (next: DecisionRoomState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    acknowledgeRendered(version: number) {
      renderedVersion = Math.max(renderedVersion, version);
      for (const waiter of renderWaiters) {
        if (waiter.version <= renderedVersion) {
          waiter.signal.removeEventListener('abort', waiter.onAbort);
          renderWaiters.delete(waiter);
          waiter.resolve();
        }
      }
    },
    waitForRendered(version: number, signal: AbortSignal): Promise<void> {
      if (signal.aborted) return Promise.reject(new DecisionRoomError('canceled'));
      if (version <= renderedVersion) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const waiter = {
          version,
          resolve,
          reject,
          signal,
          onAbort: () => {
            renderWaiters.delete(waiter);
            reject(new DecisionRoomError('canceled'));
          },
        };
        renderWaiters.add(waiter);
        signal.addEventListener('abort', waiter.onAbort, { once: true });
      });
    },
    stageLivingBrief(input: StageLivingBriefInput) {
      if (state.phase !== 'READY' && state.phase !== 'BRIEF_STAGED') {
        throw new DecisionRoomError('invalid_state');
      }
      proposalSequence += 1;
      const currentValues = state.stagedBrief?.values ?? {};
      const values = { ...currentValues, ...input };
      const changedFields = Object.keys(input) as Array<keyof StageLivingBriefInput>;
      const stagedBrief: StagedLivingBriefProposal = {
        proposalRef: `proposal_brief_${padSequence(state.workspaceGeneration)}_${padSequence(proposalSequence)}`,
        values,
        changedFields,
      };
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'BRIEF_STAGED',
        stagedBrief,
        notice: null,
      });
      return { proposalRef: stagedBrief.proposalRef, stateVersion: nextVersion };
    },
    updateStagedBrief(input: StageLivingBriefInput) {
      if (state.phase !== 'BRIEF_STAGED' || !state.stagedBrief) {
        throw new DecisionRoomError('invalid_state');
      }
      const nextVersion = state.stateVersion + 1;
      const stagedBrief: StagedLivingBriefProposal = {
        ...state.stagedBrief,
        values: { ...state.stagedBrief.values, ...input },
        changedFields: Object.keys(input) as Array<keyof StageLivingBriefInput>,
      };
      publish({
        ...state,
        stateVersion: nextVersion,
        stagedBrief,
        notice: null,
      });
      return { proposalRef: stagedBrief.proposalRef, stateVersion: nextVersion };
    },
    discardStagedBrief() {
      if (state.phase !== 'BRIEF_STAGED' || !state.stagedBrief) {
        throw new DecisionRoomError('invalid_state');
      }
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'READY',
        stagedBrief: null,
        notice: null,
      });
      return { stateVersion: nextVersion };
    },
    applyBriefByHuman(proposalRef: string) {
      if (state.phase !== 'BRIEF_STAGED' || !state.stagedBrief) {
        throw new DecisionRoomError('invalid_state');
      }
      if (state.stagedBrief.proposalRef !== proposalRef) {
        throw new DecisionRoomError('stale_reference');
      }
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'BRIEF_APPLIED_BY_HUMAN',
        appliedBrief: state.stagedBrief.values,
        stagedBrief: null,
        notice: null,
      });
      return { stateVersion: nextVersion };
    },
    async findCompatibleRooms(input: FindCompatibleRoomsInput, signal: AbortSignal) {
      if (
        state.phase !== 'BRIEF_APPLIED_BY_HUMAN'
        && state.phase !== 'RESULTS_READY'
        && state.phase !== 'SYNERGY_EXPLAINED'
        && state.phase !== 'COMPARISON_READY'
        && state.phase !== 'INTRODUCTION_STAGED'
        && state.phase !== 'INTRODUCTION_CONFIRMED_BY_HUMAN'
      ) {
        throw new DecisionRoomError('invalid_state');
      }
      if (!state.appliedBrief) throw new DecisionRoomError('invalid_state');
      if (signal.aborted) throw new DecisionRoomError('canceled');
      const startedVersion = state.stateVersion;
      const startedWorkspace = state.workspaceGeneration;
      const request = {
        limit: input.limit ?? 5,
        order: input.order ?? 'best_fit',
      } as const;
      const operation = combineAbortSignals([signal, workspaceController.signal]);
      let result;
      try {
        result = await dataSource.findCompatibleRooms(state.appliedBrief, request, operation.signal);
      } catch (error) {
        if (operation.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
          throw new DecisionRoomError('canceled');
        }
        throw error;
      } finally {
        operation.dispose();
      }
      if (operation.signal.aborted) throw new DecisionRoomError('canceled');
      if (state.stateVersion !== startedVersion || state.workspaceGeneration !== startedWorkspace) {
        throw new DecisionRoomError('stale_execution');
      }
      const nextVersion = state.stateVersion + 1;
      if (result.status === 'unsupported_market') {
        publish({
          ...state,
          stateVersion: nextVersion,
          notice: {
            kind: 'info',
            message: `This demo currently includes ${result.availableMarkets.join(', ')}.`,
          },
        });
        return {
          status: 'unsupported_market' as const,
          availableMarkets: [...result.availableMarkets],
          stateVersion: nextVersion,
        };
      }
      resultGeneration += 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'RESULTS_READY',
        results: {
          generation: resultGeneration,
          request,
          rooms: result.rooms,
        },
        synergyExplanation: null,
        comparison: null,
        introduction: null,
        receipt: null,
        notice: result.rooms.length === 0
          ? { kind: 'info', message: 'No demo roommates match this living plan yet.' }
          : null,
      });
      return {
        status: result.rooms.length === 0 ? 'no_matches' as const : 'results_ready' as const,
        resultGeneration,
        stateVersion: nextVersion,
        visibleRoomRefs: result.rooms.map((room) => room.roomRef),
      };
    },
    explainSynergyMatch(input: ExplainSynergyMatchInput) {
      if (state.phase !== 'RESULTS_READY' && state.phase !== 'SYNERGY_EXPLAINED') {
        throw new DecisionRoomError('invalid_state');
      }
      if (!state.results) throw new DecisionRoomError('invalid_state');
      const room = state.results.rooms.find((candidate) => candidate.roomRef === input.roomRef);
      if (!room) throw new DecisionRoomError('stale_reference');
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'SYNERGY_EXPLAINED',
        synergyExplanation: {
          roomRef: room.roomRef,
          personRef: room.housemate.personRef,
          displayName: room.housemate.displayName,
          score: room.synergy.score,
          evidencePercent: room.synergy.evidencePercent,
          readLabel: room.synergy.readLabel,
          reasonCodes: [...room.synergy.reasonCodes],
          reasonLabels: [...room.synergy.reasonLabels],
        },
        comparison: null,
        introduction: null,
        receipt: null,
        notice: null,
      });
      return {
        roomRef: room.roomRef,
        personRef: room.housemate.personRef,
        stateVersion: nextVersion,
      };
    },
    returnToResultsByHuman() {
      if (state.phase !== 'SYNERGY_EXPLAINED' || !state.results) {
        throw new DecisionRoomError('invalid_state');
      }
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'RESULTS_READY',
        synergyExplanation: null,
        notice: null,
      });
      return { stateVersion: nextVersion };
    },
    compareShortlist(input: CompareShortlistInput) {
      if (
        state.phase !== 'RESULTS_READY'
        && state.phase !== 'SYNERGY_EXPLAINED'
        && state.phase !== 'COMPARISON_READY'
        && state.phase !== 'INTRODUCTION_STAGED'
        && state.phase !== 'INTRODUCTION_CONFIRMED_BY_HUMAN'
      ) throw new DecisionRoomError('invalid_state');
      if (!state.results) throw new DecisionRoomError('invalid_state');
      const roomRefs = [...input.roomRefs];
      if (roomRefs.length < 2 || roomRefs.length > 3 || new Set(roomRefs).size !== roomRefs.length) {
        throw new DecisionRoomError('invalid_input');
      }
      const visibleRefs = new Set(state.results.rooms.map((room) => room.roomRef));
      if (roomRefs.some((roomRef) => !visibleRefs.has(roomRef))) {
        throw new DecisionRoomError('stale_reference');
      }
      const dimensions: NonNullable<CompareShortlistInput['dimensions']> = input.dimensions
        ? [...input.dimensions]
        : ['synergy_read', 'budget', 'move_timing', 'home_rhythm', 'house_rules', 'practical_fit'];
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'COMPARISON_READY',
        synergyExplanation: null,
        comparison: { roomRefs, dimensions },
        introduction: null,
        receipt: null,
        notice: null,
      });
      return { roomRefs, dimensions, stateVersion: nextVersion };
    },
    prepareIntroduction(input: PrepareIntroductionInput) {
      if (
        state.phase !== 'COMPARISON_READY'
        && state.phase !== 'INTRODUCTION_STAGED'
        && state.phase !== 'INTRODUCTION_CONFIRMED_BY_HUMAN'
      ) throw new DecisionRoomError('invalid_state');
      if (!state.results || !state.comparison || !state.comparison.roomRefs.includes(input.roomRef)) {
        throw new DecisionRoomError('stale_reference');
      }
      const room = state.results.rooms.find((candidate) => candidate.roomRef === input.roomRef);
      if (!room) throw new DecisionRoomError('stale_reference');
      const availableReasonCodes: SafeReasonCode[] = [...room.reasonCodes, ...room.synergy.reasonCodes];
      const highlightCodes: SafeReasonCode[] = input.highlightCodes?.length
        ? [...input.highlightCodes]
        : [...room.synergy.reasonCodes.slice(0, 2), ...room.reasonCodes.slice(0, 1)];
      if (highlightCodes.some((code) => !availableReasonCodes.includes(code))) {
        throw new DecisionRoomError('invalid_input');
      }
      introductionSequence += 1;
      const draft = buildIntroductionDraft({ room, tone: input.tone, highlightCodes });
      const draftRef = `introduction_${padSequence(state.workspaceGeneration)}_${padSequence(introductionSequence)}`;
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'INTRODUCTION_STAGED',
        introduction: {
          draftRef,
          roomRef: input.roomRef,
          tone: input.tone,
          highlightCodes,
          draft,
          isSafeToConfirm: isSafeIntroductionDraft(draft),
        },
        receipt: null,
        notice: null,
      });
      return {
        draftRef,
        roomRef: input.roomRef,
        stateVersion: nextVersion,
        visibleConfirmation: true as const,
      };
    },
    updateIntroductionDraft(draft: string) {
      if (state.phase !== 'INTRODUCTION_STAGED' || !state.introduction) {
        throw new DecisionRoomError('invalid_state');
      }
      if (draft.length > 600) throw new DecisionRoomError('invalid_input');
      const isSafeToConfirm = isSafeIntroductionDraft(draft);
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        introduction: {
          ...state.introduction,
          draft,
          isSafeToConfirm,
        },
        notice: isSafeToConfirm
          ? null
          : {
              kind: 'safety',
              message: 'Keep contact details, exact addresses, and protected traits out of this demo draft.',
            },
      });
      return { stateVersion: nextVersion, isSafeToConfirm };
    },
    confirmIntroductionByHuman() {
      if (state.phase !== 'INTRODUCTION_STAGED' || !state.introduction) {
        throw new DecisionRoomError('invalid_state');
      }
      if (!state.introduction.isSafeToConfirm) throw new DecisionRoomError('invalid_input');
      receiptSequence += 1;
      const receiptRef = `receipt_demo_${padSequence(state.workspaceGeneration)}_${padSequence(receiptSequence)}`;
      const nextVersion = state.stateVersion + 1;
      publish({
        ...state,
        stateVersion: nextVersion,
        phase: 'INTRODUCTION_CONFIRMED_BY_HUMAN',
        receipt: {
          receiptRef,
          message: 'Demo confirmed. No real message was sent.',
        },
        notice: null,
      });
      return { receiptRef, stateVersion: nextVersion };
    },
    resetByHuman() {
      const nextVersion = state.stateVersion + 1;
      const nextWorkspace = state.workspaceGeneration + 1;
      workspaceController.abort();
      workspaceController = new AbortController();
      proposalSequence = 0;
      resultGeneration = 0;
      introductionSequence = 0;
      receiptSequence = 0;
      publish({
        ...initialState(),
        stateVersion: nextVersion,
        workspaceGeneration: nextWorkspace,
      });
      return { stateVersion: nextVersion, workspaceGeneration: nextWorkspace };
    },
  };
}

export type DecisionRoomStore = ReturnType<typeof createDecisionRoomStore>;
