'use client';

import { ChevronDown, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  LayoutGroup,
  MotionConfig,
} from 'motion/react';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { Button } from '@/components/ui/button';
import {
  createDecisionRoomActivityStore,
  type DecisionRoomActivityAction,
  type DecisionRoomActivityStore,
} from '@/lib/decision-room/activity-store';
import { createDecisionRoomStore, DecisionRoomError, type DecisionRoomStore } from '@/lib/decision-room/store';
import type { SafeRoomSummary } from '@/lib/decision-room/types';
import { visualStageForPhase } from '@/lib/decision-room/visual-stage';
import { getWebMcpRegistrationCoordinator } from '@/lib/webmcp/registration';
import { createWebMcpTools } from '@/lib/webmcp/tools';
import { cn } from '@/lib/utils/cn';

import { IntroductionStage, SuccessStage } from './connection-stages';
import { LivingField } from './living-field';
import { PlanAppliedStage, PlanReviewStage, ReadyStage, sampleLivingPlan } from './living-plan-stages';
import { ComparisonStage, MatchesStage, SynergyExplanationStage } from './match-stages';
import { CoHabbyBrand } from './v3-primitives';
import { exactToolNames, type SiteToolsStatus, WebMcpRibbon } from './webmcp-ribbon';

function activityErrorCode(error: unknown) {
  return error instanceof DecisionRoomError ? error.code : 'internal_error' as const;
}

function runHumanMutation<T extends { stateVersion: number }>(
  activity: DecisionRoomActivityStore,
  action: DecisionRoomActivityAction,
  operation: () => T,
  targets: (result: T) => ReadonlyArray<string> = () => [],
): T {
  const token = activity.begin('human', action);
  try {
    const result = operation();
    activity.complete(token, { stateVersion: result.stateVersion, targetRefs: targets(result) });
    return result;
  } catch (error) {
    activity.fail(token, activityErrorCode(error), 0);
    throw error;
  }
}

function SiteToolsBadge({ status }: { status: SiteToolsStatus }) {
  const label = status === 'ready'
    ? 'Site tools ready'
    : status === 'checking'
      ? 'Checking site tools'
      : 'Site tools unavailable';
  return (
    <div
      className={cn(
        'hidden min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-body-sm font-semibold sm:inline-flex',
        status === 'ready'
          ? 'border-success/30 bg-success-surface text-success-dark'
          : status === 'error'
            ? 'border-error/30 bg-error-surface text-error-dark'
            : 'border-neutral-200 bg-white text-text-secondary',
      )}
      role="status"
      aria-label="Site tools status"
    >
      <span className={cn('h-2 w-2 rounded-full', status === 'ready' ? 'bg-success' : status === 'error' ? 'bg-error' : 'bg-neutral-400')} aria-hidden="true" />
      {label}
    </div>
  );
}

export function DecisionRoom({ sourceRevision }: { sourceRevision: string }) {
  const storeRef = useRef<DecisionRoomStore | null>(null);
  const activityRef = useRef<DecisionRoomActivityStore | null>(null);
  if (!storeRef.current) storeRef.current = createDecisionRoomStore();
  if (!activityRef.current) activityRef.current = createDecisionRoomActivityStore();
  const store = storeRef.current;
  const activity = activityRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  const activitySnapshot = useSyncExternalStore(activity.subscribe, activity.getSnapshot, activity.getSnapshot);
  const [siteToolsStatus, setSiteToolsStatus] = useState<SiteToolsStatus>('checking');
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
  const [introRoomRef, setIntroRoomRef] = useState('');
  const [introTone, setIntroTone] = useState<'warm' | 'direct' | 'casual'>('warm');
  const [busy, setBusy] = useState(false);
  const changedRegionRef = useRef<HTMLDivElement>(null);
  const visualStage = visualStageForPhase(state.phase);
  const isOpeningStage = state.phase === 'READY';

  useLayoutEffect(() => {
    store.acknowledgeRendered(state.stateVersion);
  }, [state.stateVersion, store]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context || typeof context.registerTool !== 'function') {
      setSiteToolsStatus('unsupported');
      return undefined;
    }
    setSiteToolsStatus('checking');
    const lease = getWebMcpRegistrationCoordinator(context).register(createWebMcpTools(store, activity));
    let active = true;
    lease.ready
      .then(() => { if (active) setSiteToolsStatus('ready'); })
      .catch(() => { if (active) setSiteToolsStatus('error'); });
    return () => {
      active = false;
      lease.dispose();
    };
  }, [state.workspaceGeneration, activity, store]);

  useEffect(() => {
    setSelectedRefs([]);
  }, [state.results?.generation]);

  useEffect(() => {
    const first = state.comparison?.roomRefs[0] ?? '';
    if (!state.comparison?.roomRefs.includes(introRoomRef)) setIntroRoomRef(first);
  }, [introRoomRef, state.comparison]);

  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) return;
    changedRegionRef.current?.focus({ preventScroll: true });
  }, [state.phase]);

  const toggleRoom = (roomRef: string) => {
    setSelectedRefs((current) => current.includes(roomRef)
      ? current.filter((candidate) => candidate !== roomRef)
      : current.length < 3 ? [...current, roomRef] : current);
  };

  const findPeopleAndHomes = async () => {
    const token = activity.begin('human', 'find_compatible_rooms');
    setBusy(true);
    try {
      const result = await store.findCompatibleRooms({ limit: 6, order: 'best_fit' }, new AbortController().signal);
      activity.complete(token, {
        stateVersion: result.stateVersion,
        targetRefs: result.status === 'unsupported_market' ? [] : result.visibleRoomRefs,
      });
    } catch (error) {
      activity.fail(token, activityErrorCode(error), store.getState().stateVersion);
      if (!(error instanceof DecisionRoomError)) throw error;
    } finally {
      setBusy(false);
    }
  };

  const explainSynergy = (roomRef: string) => {
    runHumanMutation(
      activity,
      'explain_synergy_match',
      () => store.explainSynergyMatch({ roomRef }),
      (result) => [result.roomRef, result.personRef],
    );
  };

  const compare = () => {
    runHumanMutation(
      activity,
      'compare_shortlist',
      () => store.compareShortlist({ roomRefs: selectedRefs }),
      (result) => result.roomRefs,
    );
  };

  const comparisonRooms = useMemo(() => {
    if (!state.results || !state.comparison) return [];
    return state.comparison.roomRefs
      .map((roomRef) => state.results?.rooms.find((room) => room.roomRef === roomRef))
      .filter((room): room is SafeRoomSummary => Boolean(room));
  }, [state.comparison, state.results]);

  const focusedSynergyRoom = state.synergyExplanation && state.results
    ? state.results.rooms.find((room) => room.roomRef === state.synergyExplanation?.roomRef) ?? null
    : null;
  const introductionRoom = state.introduction && state.results
    ? state.results.rooms.find((room) => room.roomRef === state.introduction?.roomRef) ?? null
    : null;

  const reset = () => {
    const result = store.resetByHuman();
    activity.reset();
    const token = activity.begin('human', 'reset');
    activity.complete(token, { stateVersion: result.stateVersion });
    setSelectedRefs([]);
    setIntroRoomRef('');
    setIntroTone('warm');
  };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <main className="min-h-screen overflow-x-clip bg-neutral-50 text-text-primary">
          <div className="mx-auto max-w-[1540px] px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <CoHabbyBrand />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <SiteToolsBadge status={siteToolsStatus} />
                <details className="group relative">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 font-display text-sm font-semibold text-text-primary transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info">
                    6 <span className="hidden sm:inline">WebMCP</span> tools
                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white p-3 shadow-elevated" data-exact-tool-disclosure>
                    <p className="px-2 pb-2 text-body-sm text-text-secondary">Six bounded tools work on this visible page.</p>
                    <ul className="space-y-1">
                      {exactToolNames.map((name) => <li key={name} className="rounded-lg bg-neutral-50 px-2 py-1.5 font-mono text-[11px] text-text-secondary">{name}</li>)}
                    </ul>
                  </div>
                </details>
                <Button variant="ghost" onClick={reset} aria-label="Reset demo"><RefreshCw className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Reset</span></Button>
              </div>
            </header>

            <section className={cn('text-center transition-[padding] duration-causal', isOpeningStage ? 'pb-5 pt-8 sm:pt-10' : 'pb-4 pt-5 max-sm:py-3')}>
              <p className={cn('font-display font-bold uppercase tracking-[0.17em] text-primary-ink transition-all duration-causal', isOpeningStage ? 'text-sm' : 'text-xs max-sm:hidden')}>Better roommates begin with how people live</p>
              <h1 className={cn('mx-auto max-w-5xl font-display font-bold leading-[0.98] tracking-[-0.045em] text-text-primary transition-[font-size] duration-causal', isOpeningStage ? 'mt-2 text-4xl sm:text-5xl lg:text-6xl' : 'mt-1.5 text-3xl sm:text-4xl lg:text-5xl max-sm:mt-0 max-sm:text-2xl max-sm:leading-tight')}>Meet someone you could actually live well with.</h1>
              <p className={cn('mx-auto max-w-3xl text-text-secondary transition-all duration-causal', isOpeningStage ? 'mt-3 text-body-lg sm:text-lg' : 'mt-2 text-body-md max-sm:hidden')}>Your browser agent brings people and homes together. You make the introduction.</p>
            </section>

            <WebMcpRibbon phase={state.phase} activity={activitySnapshot} siteToolsStatus={siteToolsStatus} />

            <LayoutGroup id="people-first-decision-room">
              <div
                ref={changedRegionRef}
                tabIndex={-1}
                role="region"
                aria-label="People-first decision stage"
                aria-live="polite"
                data-visual-stage={visualStage}
                className="relative mt-4 min-w-0 overflow-visible rounded-[2rem] border border-white/80 bg-[#F8EFE8] px-3 py-3 shadow-elevated focus:outline-none sm:px-5 sm:py-4 lg:px-7"
              >
                <LivingField stage={visualStage} />
                <div className="relative z-10">
                  <AnimatePresence mode="wait" initial={false}>
                    {state.phase === 'READY' ? (
                      <ReadyStage
                        onStart={() => runHumanMutation(
                          activity,
                          'stage_living_brief',
                          () => store.stageLivingBrief(sampleLivingPlan),
                          (result) => [result.proposalRef],
                        )}
                      />
                    ) : null}

                    {state.phase === 'BRIEF_STAGED' ? (
                      <PlanReviewStage
                        state={state}
                        store={store}
                        onMutation={(action, operation) => { runHumanMutation(activity, action, operation); }}
                      />
                    ) : null}

                    {state.phase === 'BRIEF_APPLIED_BY_HUMAN' ? (
                      <PlanAppliedStage state={state} busy={busy} onFind={() => void findPeopleAndHomes()} />
                    ) : null}

                    {state.phase === 'RESULTS_READY' && state.results ? (
                      <MatchesStage
                        rooms={state.results.rooms}
                        selectedRefs={selectedRefs}
                        onToggle={toggleRoom}
                        onExplain={explainSynergy}
                        onCompare={compare}
                      />
                    ) : null}

                    {state.phase === 'SYNERGY_EXPLAINED' && state.results && focusedSynergyRoom ? (
                      <SynergyExplanationStage
                        room={focusedSynergyRoom}
                        rooms={state.results.rooms}
                        selectedRefs={selectedRefs}
                        onToggle={toggleRoom}
                        onExplain={explainSynergy}
                        onCompare={compare}
                        onBack={() => runHumanMutation(activity, 'return_to_results', () => store.returnToResultsByHuman())}
                      />
                    ) : null}

                    {state.phase === 'COMPARISON_READY' && state.comparison ? (
                      <ComparisonStage
                        rooms={comparisonRooms}
                        dimensions={state.comparison.dimensions}
                        introRoomRef={introRoomRef}
                        introTone={introTone}
                        onRoomChange={setIntroRoomRef}
                        onToneChange={setIntroTone}
                        onPrepare={() => runHumanMutation(
                          activity,
                          'prepare_introduction',
                          () => store.prepareIntroduction({ roomRef: introRoomRef, tone: introTone }),
                          (result) => [result.roomRef],
                        )}
                      />
                    ) : null}

                    {state.phase === 'INTRODUCTION_STAGED' && state.introduction && introductionRoom ? (
                      <IntroductionStage
                        room={introductionRoom}
                        introduction={state.introduction}
                        notice={state.notice}
                        onEdit={(draft) => runHumanMutation(activity, 'edit_introduction', () => store.updateIntroductionDraft(draft))}
                        onConfirm={() => runHumanMutation(activity, 'confirm_introduction', () => store.confirmIntroductionByHuman())}
                      />
                    ) : null}

                    {state.phase === 'INTRODUCTION_CONFIRMED_BY_HUMAN' && state.receipt ? (
                      <SuccessStage receipt={state.receipt.message} onReset={reset} />
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </LayoutGroup>

            <aside className="mt-4 flex flex-col gap-2 rounded-2xl border border-warning/25 bg-warning-surface px-4 py-3 text-body-sm text-warning-dark sm:flex-row sm:items-center" aria-label="Synthetic Synergy disclosure">
              <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p><strong>People-first and practical.</strong> Synergy Scores in this demo are fixed synthetic reads and do not use CoHabby&apos;s production scoring model. Protected traits never enter the roommate search.</p>
            </aside>

            <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 py-4 text-body-sm text-text-tertiary">
              <p>Synthetic people and homes. No login, model API, microphone, or real message.</p>
              <p>Source {sourceRevision.slice(0, 12)}</p>
            </footer>
          </div>
        </main>
      </LazyMotion>
    </MotionConfig>
  );
}
