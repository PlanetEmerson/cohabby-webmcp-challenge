import { DecisionRoomError, type DecisionRoomStore } from '@/lib/decision-room/store';
import type { ToolErrorCode } from './tool-contracts';
import {
  parseToolInput,
  toolInputSchemas,
  ToolContractError,
} from './tool-contracts';
import { assertSafeToolOutput } from './safe-output';

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

function failure(store: DecisionRoomStore, error: unknown) {
  const state = store.getState();
  const code = errorCode(error);
  return assertSafeToolOutput({
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
    visibleRoomRefs: state.results?.rooms.map((room) => room.roomRef) ?? [],
    shortlistCount: state.comparison?.roomRefs.length ?? 0,
    introductionStatus: state.receipt ? 'confirmed' : state.introduction ? 'staged' : 'none',
  };
  return assertSafeToolOutput(context);
}

export function createWebMcpTools(store: DecisionRoomStore): WebMCP.ModelContextTool[] {
  return [
    {
      name: 'get_living_context',
      title: 'Get living context',
      description: 'Read the living brief, visible room references, comparison count, and introduction status on this page.',
      inputSchema: toolInputSchemas.get_living_context,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        try {
          parseToolInput('get_living_context', input);
          return livingContext(store);
        } catch (error) {
          return failure(store, error);
        }
      },
    },
    {
      name: 'stage_living_brief',
      title: 'Stage living brief',
      description: 'Stage a practical living brief for the person to review and apply on this page.',
      inputSchema: toolInputSchemas.stage_living_brief,
      annotations: { readOnlyHint: false },
      execute: async (input, { signal }) => {
        try {
          const parsed = parseToolInput('stage_living_brief', input);
          const result = store.stageLivingBrief(parsed);
          await store.waitForRendered(result.stateVersion, signal);
          return assertSafeToolOutput({
            schemaVersion: 1,
            stateVersion: result.stateVersion,
            status: 'awaiting_human_review',
            phase: store.getState().phase,
            proposalRef: result.proposalRef,
            changedFields: Object.keys(parsed),
            visibleConfirmation: true,
          });
        } catch (error) {
          return failure(store, error);
        }
      },
    },
    {
      name: 'find_compatible_rooms',
      title: 'Find compatible rooms',
      description: 'Find synthetic demo rooms using the practical living brief the person approved on this page.',
      inputSchema: toolInputSchemas.find_compatible_rooms,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async (input, { signal }) => {
        try {
          const parsed = parseToolInput('find_compatible_rooms', input);
          const result = await store.findCompatibleRooms(parsed, signal);
          await store.waitForRendered(result.stateVersion, signal);
          if (result.status === 'unsupported_market') {
            return assertSafeToolOutput({
              schemaVersion: 1,
              stateVersion: result.stateVersion,
              status: 'unsupported_market',
              phase: store.getState().phase,
              availableMarkets: result.availableMarkets,
            });
          }
          const state = store.getState();
          return assertSafeToolOutput({
            schemaVersion: 1,
            stateVersion: result.stateVersion,
            status: result.status,
            phase: state.phase,
            resultGeneration: result.resultGeneration,
            visibleRoomRefs: result.visibleRoomRefs,
            rooms: state.results?.rooms ?? [],
          });
        } catch (error) {
          return failure(store, error);
        }
      },
    },
    {
      name: 'compare_shortlist',
      title: 'Compare shortlist',
      description: 'Build a comparison board from two or three room references in the current visible results.',
      inputSchema: toolInputSchemas.compare_shortlist,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async (input, { signal }) => {
        try {
          const parsed = parseToolInput('compare_shortlist', input);
          const result = store.compareShortlist(parsed);
          await store.waitForRendered(result.stateVersion, signal);
          return assertSafeToolOutput({
            schemaVersion: 1,
            stateVersion: result.stateVersion,
            status: 'comparison_ready',
            phase: store.getState().phase,
            roomRefs: result.roomRefs,
            dimensions: result.dimensions,
          });
        } catch (error) {
          return failure(store, error);
        }
      },
    },
    {
      name: 'prepare_introduction',
      title: 'Prepare introduction',
      description: 'Prepare an editable demo introduction for one room in the current comparison.',
      inputSchema: toolInputSchemas.prepare_introduction,
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute: async (input, { signal }) => {
        try {
          const parsed = parseToolInput('prepare_introduction', input);
          const result = store.prepareIntroduction(parsed);
          await store.waitForRendered(result.stateVersion, signal);
          const introduction = store.getState().introduction;
          return assertSafeToolOutput({
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
          return failure(store, error);
        }
      },
    },
  ];
}
