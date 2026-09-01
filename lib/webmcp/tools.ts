import type {
  DecisionRoomActivityStore,
  DecisionRoomActivityToken,
} from '@/lib/decision-room/activity-store';
import { DecisionRoomError, type DecisionRoomStore } from '@/lib/decision-room/store';
import { demoProfileSignals } from '@/lib/decision-room/living-data-source';
import type { ToolErrorCode, ToolName } from './tool-contracts';
import {
  parseToolInput,
  toolInputSchemas,
  ToolContractError,
} from './tool-contracts';
import { assertToolOutput } from './output-contracts';

const errorMessages: Record<ToolErrorCode, string> = {
  invalid_input: 'Use only the supported practical living fields and values.',
  invalid_state: 'Complete the visible human review step before using this action.',
  stale_reference: 'Choose room references from the current visible results.',
  stale_execution: 'The page changed while this action was running. Read the current context and try again.',
  unsupported_market: 'Choose one of the demo markets shown on the page.',
  unsafe_housing_request: 'CoHabby compares practical living needs and does not rank by protected traits.',
  canceled: 'The action was canceled without changing the decision room.',
  internal_error: 'The demo could not complete this action safely.',
};

function errorCode(error: unknown): ToolErrorCode {
  if (error instanceof ToolContractError || error instanceof DecisionRoomError) return error.code;
  if (error instanceof DOMException && error.name === 'AbortError') return 'canceled';
  return 'internal_error';
}

function failure(
  name: ToolName,
  store: DecisionRoomStore,
  error: unknown,
  activity?: DecisionRoomActivityStore,
  token?: DecisionRoomActivityToken,
) {
  const state = store.getState();
  const code = errorCode(error);
  if (token) activity?.fail(token, code, state.stateVersion);
  return assertToolOutput(name, {
    schemaVersion: 1,
    stateVersion: state.stateVersion,
    status: 'error',
    phase: state.phase,
    error: { code, message: errorMessages[code] },
  });
}

function livingContext(store: DecisionRoomStore) {
  const state = store.getState();
  const context = {
    schemaVersion: 1,
    stateVersion: state.stateVersion,
    status: 'ready',
    phase: state.phase,
    ...(state.appliedBrief ? { brief: state.appliedBrief } : {}),
    visibleProfileSignals: [...demoProfileSignals],
    visibleRoomRefs: state.results?.rooms.map((room) => room.roomRef) ?? [],
    synergyExplanationStatus: state.synergyExplanation ? 'visible' : 'none',
    ...(state.synergyExplanation ? { focusedSynergyRoomRef: state.synergyExplanation.roomRef } : {}),
    shortlistCount: state.comparison?.roomRefs.length ?? 0,
    introductionStatus: state.receipt ? 'confirmed' : state.introduction ? 'staged' : 'none',
  };
  return assertToolOutput('get_living_context', context);
}

function invocationSignal(options?: WebMCP.ToolExecuteCallbackOptions): AbortSignal {
  return options?.signal ?? new AbortController().signal;
}

function invocationScope(
  store: DecisionRoomStore,
  options?: WebMCP.ToolExecuteCallbackOptions,
) {
  const controller = new AbortController();
  const signals = [invocationSignal(options), store.getWorkspaceSignal()];
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

function throwIfCanceled(signal: AbortSignal): void {
  if (signal.aborted) throw new DecisionRoomError('canceled');
}

async function waitForVisibleMutation(
  store: DecisionRoomStore,
  checkpoint: ReturnType<DecisionRoomStore['createCheckpoint']>,
  stateVersion: number,
  signal: AbortSignal,
): Promise<void> {
  try {
    await store.waitForRendered(stateVersion, signal);
  } catch (error) {
    if (errorCode(error) === 'canceled') {
      store.rollbackToCheckpoint(checkpoint, stateVersion);
    }
    throw error;
  }
}

export function createWebMcpTools(
  store: DecisionRoomStore,
  activity?: DecisionRoomActivityStore,
): WebMCP.ModelContextTool[] {
  return [
    {
      name: 'get_living_context',
      title: 'Get living context',
      description: 'Read the living brief, visible room references, comparison count, and introduction status on this page.',
      inputSchema: toolInputSchemas.get_living_context,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        const token = activity?.begin('agent', 'get_living_context');
        try {
          parseToolInput('get_living_context', input);
          const result = livingContext(store);
          if (token) {
            activity?.complete(token, {
              stateVersion: store.getState().stateVersion,
              targetRefs: store.getState().results?.rooms.map((room) => room.roomRef) ?? [],
            });
          }
          return result;
        } catch (error) {
          return failure('get_living_context', store, error, activity, token);
        }
      },
    },
    {
      name: 'stage_living_brief',
      title: 'Stage living brief',
      description: 'Stage a practical living brief for the person to review and apply on this page.',
      inputSchema: toolInputSchemas.stage_living_brief,
      annotations: { readOnlyHint: false },
      execute: async (input, options) => {
        const token = activity?.begin('agent', 'stage_living_brief');
        const operation = invocationScope(store, options);
        const signal = operation.signal;
        try {
          throwIfCanceled(signal);
          const parsed = parseToolInput('stage_living_brief', input);
          const checkpoint = store.createCheckpoint();
          const result = store.stageLivingBrief(parsed);
          await waitForVisibleMutation(store, checkpoint, result.stateVersion, signal);
          if (token) {
            activity?.complete(token, {
              stateVersion: result.stateVersion,
              targetRefs: [result.proposalRef],
            });
          }
          return assertToolOutput('stage_living_brief', {
            schemaVersion: 1,
            stateVersion: result.stateVersion,
            status: 'awaiting_human_review',
            phase: store.getState().phase,
            proposalRef: result.proposalRef,
            changedFields: Object.keys(parsed),
            visibleConfirmation: true,
          });
        } catch (error) {
          return failure('stage_living_brief', store, error, activity, token);
        } finally {
          operation.dispose();
        }
      },
    },
    {
      name: 'find_compatible_rooms',
      title: 'Find compatible rooms',
      description: 'Find synthetic demo rooms using the practical living brief the person approved on this page.',
      inputSchema: toolInputSchemas.find_compatible_rooms,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async (input, options) => {
        const token = activity?.begin('agent', 'find_compatible_rooms');
        const operation = invocationScope(store, options);
        const signal = operation.signal;
        try {
          throwIfCanceled(signal);
          const parsed = parseToolInput('find_compatible_rooms', input);
          const checkpoint = store.createCheckpoint();
          const result = await store.findCompatibleRooms(parsed, signal);
          await waitForVisibleMutation(store, checkpoint, result.stateVersion, signal);
          if (token) {
            activity?.complete(token, {
              stateVersion: result.stateVersion,
              targetRefs: result.status === 'unsupported_market' ? [] : result.visibleRoomRefs,
            });
          }
          if (result.status === 'unsupported_market') {
            return assertToolOutput('find_compatible_rooms', {
              schemaVersion: 1,
              stateVersion: result.stateVersion,
              status: 'unsupported_market',
              phase: store.getState().phase,
              availableMarkets: result.availableMarkets,
            });
          }
          const state = store.getState();
          return assertToolOutput('find_compatible_rooms', {
            schemaVersion: 1,
            stateVersion: result.stateVersion,
            status: result.status,
            phase: state.phase,
            resultGeneration: result.resultGeneration,
            visibleRoomRefs: result.visibleRoomRefs,
            rooms: state.results?.rooms ?? [],
          });
        } catch (error) {
          return failure('find_compatible_rooms', store, error, activity, token);
        } finally {
          operation.dispose();
        }
      },
    },
    {
      name: 'explain_synergy_match',
      title: 'Explain Synergy match',
      description: 'Open the visible synthetic Synergy explanation for one current people-and-home match.',
      inputSchema: toolInputSchemas.explain_synergy_match,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async (input, options) => {
        const token = activity?.begin('agent', 'explain_synergy_match');
        const operation = invocationScope(store, options);
        const signal = operation.signal;
        try {
          throwIfCanceled(signal);
          const parsed = parseToolInput('explain_synergy_match', input);
          const checkpoint = store.createCheckpoint();
          const result = store.explainSynergyMatch(parsed);
          await waitForVisibleMutation(store, checkpoint, result.stateVersion, signal);
          const explanation = store.getState().synergyExplanation;
          if (!explanation) throw new DecisionRoomError('stale_execution');
          if (token) {
            activity?.complete(token, {
              stateVersion: result.stateVersion,
              targetRefs: [result.roomRef],
            });
          }
          return assertToolOutput('explain_synergy_match', {
            schemaVersion: 1,
            stateVersion: result.stateVersion,
            status: 'synergy_explanation_ready',
            phase: store.getState().phase,
            roomRef: explanation.roomRef,
            personRef: explanation.personRef,
            displayName: explanation.displayName,
            scoreSource: 'synthetic_fixture',
            score: explanation.score,
            evidencePercent: explanation.evidencePercent,
            readLabel: explanation.readLabel,
            reasonCodes: explanation.reasonCodes,
            reasonLabels: explanation.reasonLabels,
            visibleExplanation: true,
          });
        } catch (error) {
          return failure('explain_synergy_match', store, error, activity, token);
        } finally {
          operation.dispose();
        }
      },
    },
    {
      name: 'compare_shortlist',
      title: 'Compare shortlist',
      description: 'Build a comparison board from two or three room references in the current visible results.',
      inputSchema: toolInputSchemas.compare_shortlist,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async (input, options) => {
        const token = activity?.begin('agent', 'compare_shortlist');
        const operation = invocationScope(store, options);
        const signal = operation.signal;
        try {
          throwIfCanceled(signal);
          const parsed = parseToolInput('compare_shortlist', input);
          const checkpoint = store.createCheckpoint();
          const result = store.compareShortlist(parsed);
          await waitForVisibleMutation(store, checkpoint, result.stateVersion, signal);
          if (token) {
            activity?.complete(token, {
              stateVersion: result.stateVersion,
              targetRefs: result.roomRefs,
            });
          }
          return assertToolOutput('compare_shortlist', {
            schemaVersion: 1,
            stateVersion: result.stateVersion,
            status: 'comparison_ready',
            phase: store.getState().phase,
            roomRefs: result.roomRefs,
            dimensions: result.dimensions,
          });
        } catch (error) {
          return failure('compare_shortlist', store, error, activity, token);
        } finally {
          operation.dispose();
        }
      },
    },
    {
      name: 'prepare_introduction',
      title: 'Prepare introduction',
      description: 'Prepare an editable demo introduction for one room in the current comparison.',
      inputSchema: toolInputSchemas.prepare_introduction,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async (input, options) => {
        const token = activity?.begin('agent', 'prepare_introduction');
        const operation = invocationScope(store, options);
        const signal = operation.signal;
        try {
          throwIfCanceled(signal);
          const parsed = parseToolInput('prepare_introduction', input);
          const checkpoint = store.createCheckpoint();
          const result = store.prepareIntroduction(parsed);
          await waitForVisibleMutation(store, checkpoint, result.stateVersion, signal);
          if (token) {
            activity?.complete(token, {
              stateVersion: result.stateVersion,
              targetRefs: [result.roomRef],
            });
          }
          const introduction = store.getState().introduction;
          return assertToolOutput('prepare_introduction', {
            schemaVersion: 1,
            stateVersion: result.stateVersion,
            status: 'awaiting_human_confirmation',
            phase: store.getState().phase,
            draftRef: result.draftRef,
            roomRef: result.roomRef,
            tone: introduction?.tone ?? parsed.tone,
            highlightCodes: introduction?.highlightCodes ?? [],
            visibleConfirmation: true,
          });
        } catch (error) {
          return failure('prepare_introduction', store, error, activity, token);
        } finally {
          operation.dispose();
        }
      },
    },
  ];
}
