import type { ToolErrorCode } from '@/lib/webmcp/tool-contracts';

export type DecisionRoomActivityActor = 'agent' | 'human';

export type DecisionRoomActivityAction =
  | 'get_living_context'
  | 'stage_living_brief'
  | 'find_compatible_rooms'
  | 'explain_synergy_match'
  | 'compare_shortlist'
  | 'prepare_introduction'
  | 'apply_brief'
  | 'discard_brief'
  | 'edit_brief'
  | 'edit_introduction'
  | 'confirm_introduction'
  | 'reset';

export type DecisionRoomActivityStatus =
  | 'idle'
  | 'running'
  | 'complete'
  | 'error'
  | 'canceled';

export type DecisionRoomActivitySnapshot = Readonly<{
  sequence: number;
  workspaceGeneration: number;
  actor: DecisionRoomActivityActor | null;
  action: DecisionRoomActivityAction | null;
  status: DecisionRoomActivityStatus;
  stateVersion: number | null;
  targetRefs: ReadonlyArray<string>;
  errorCode: ToolErrorCode | null;
}>;

export type DecisionRoomActivityToken = Readonly<{
  sequence: number;
  workspaceGeneration: number;
}>;

const initialSnapshot = (
  sequence = 0,
  workspaceGeneration = 1,
): DecisionRoomActivitySnapshot => Object.freeze({
  sequence,
  workspaceGeneration,
  actor: null,
  action: null,
  status: 'idle',
  stateVersion: null,
  targetRefs: Object.freeze([]),
  errorCode: null,
});

export function createDecisionRoomActivityStore() {
  let snapshot = initialSnapshot();
  const listeners = new Set<() => void>();

  const publish = (next: DecisionRoomActivitySnapshot) => {
    snapshot = Object.freeze(next);
    listeners.forEach((listener) => listener());
  };

  const isCurrent = (token: DecisionRoomActivityToken) => (
    token.sequence === snapshot.sequence
    && token.workspaceGeneration === snapshot.workspaceGeneration
  );

  return Object.freeze({
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    begin(
      actor: DecisionRoomActivityActor,
      action: DecisionRoomActivityAction,
    ): DecisionRoomActivityToken {
      const token = Object.freeze({
        sequence: snapshot.sequence + 1,
        workspaceGeneration: snapshot.workspaceGeneration,
      });
      publish({
        ...token,
        actor,
        action,
        status: 'running',
        stateVersion: null,
        targetRefs: Object.freeze([]),
        errorCode: null,
      });
      return token;
    },
    complete(
      token: DecisionRoomActivityToken,
      value: Readonly<{ stateVersion: number; targetRefs?: ReadonlyArray<string> }>,
    ) {
      if (!isCurrent(token)) return;
      publish({
        ...snapshot,
        status: 'complete',
        stateVersion: value.stateVersion,
        targetRefs: Object.freeze([...(value.targetRefs ?? [])].slice(0, 6)),
        errorCode: null,
      });
    },
    fail(
      token: DecisionRoomActivityToken,
      errorCode: ToolErrorCode,
      stateVersion: number,
    ) {
      if (!isCurrent(token)) return;
      publish({
        ...snapshot,
        status: errorCode === 'canceled' ? 'canceled' : 'error',
        stateVersion,
        targetRefs: Object.freeze([]),
        errorCode,
      });
    },
    reset() {
      publish(initialSnapshot(snapshot.sequence + 1, snapshot.workspaceGeneration + 1));
    },
  });
}

export type DecisionRoomActivityStore = ReturnType<typeof createDecisionRoomActivityStore>;
