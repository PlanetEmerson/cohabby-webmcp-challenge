'use client';

import {
  Check,
  CircleAlert,
  GitCompareArrows,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  LayoutGroup,
  m,
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

import { AgentActivityRail } from '@/components/decision-room/agent-activity-rail';
import {
  BrandDoorwayMark,
  ComparisonStage,
  EmptyRoomSlots,
  LivingBriefTray,
  RoomCard,
  SampleLivingTokens,
  label,
} from '@/components/decision-room/matchboard-parts';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import {
  createDecisionRoomActivityStore,
  type DecisionRoomActivityAction,
  type DecisionRoomActivityStore,
} from '@/lib/decision-room/activity-store';
import { createDecisionRoomStore, DecisionRoomError, type DecisionRoomStore } from '@/lib/decision-room/store';
import type { DecisionRoomState, SafeRoomSummary } from '@/lib/decision-room/types';
import { visualStageForPhase } from '@/lib/decision-room/visual-stage';
import { getWebMcpRegistrationCoordinator } from '@/lib/webmcp/registration';
import { parseToolInput } from '@/lib/webmcp/tool-contracts';
import { createWebMcpTools } from '@/lib/webmcp/tools';
import { cn } from '@/lib/utils/cn';

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

const stageProgress = {
  ready: 0.08,
  brief: 0.28,
  rooms: 0.52,
  comparison: 0.75,
  introduction: 0.92,
  confirmed: 1,
} as const;

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

function BriefSelect({
  labelText,
  value,
  options,
  onChange,
}: {
  labelText: string;
  value: string | undefined;
  options: ReadonlyArray<string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
      {labelText}
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-lg border-neutral-300 bg-white text-body-md text-text-primary focus:border-info focus:ring-info"
      >
        <option value="">Not set</option>
        {options.map((option) => <option key={option} value={option}>{label(option)}</option>)}
      </select>
    </label>
  );
}

function BriefProposal({
  store,
  state,
  activity,
}: {
  store: DecisionRoomStore;
  state: DecisionRoomState;
  activity: DecisionRoomActivityStore;
}) {
  const proposal = state.stagedBrief;
  if (!proposal) return null;
  let valid = true;
  try {
    parseToolInput('stage_living_brief', proposal.values);
  } catch {
    valid = false;
  }
  const update = (value: Record<string, unknown>) => {
    try {
      runHumanMutation(activity, 'edit_brief', () => store.updateStagedBrief(value));
    } catch {
      // The visible validity state explains what must be corrected.
    }
  };
  return (
    <m.section
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      role="region"
      aria-label="Review living brief"
      data-human-action="brief-review"
      className="mt-4 overflow-hidden rounded-[1.35rem] border border-primary/30 bg-neutral-0 shadow-elevated"
    >
      <div className="flex items-start justify-between gap-4 border-b border-primary/15 bg-primary-surface px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-primary-ink" aria-hidden="true" />
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.12em] text-primary-ink">Your move</p>
            <h2 className="font-display text-h4 font-semibold text-text-primary">Does this look right?</h2>
          </div>
        </div>
        <Chip color="primary">Not applied</Chip>
      </div>
      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
        <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
          Market
          <input value={proposal.values.market ?? ''} maxLength={80} onChange={(event) => update({ market: event.target.value })} className="min-h-11 w-full rounded-lg border-neutral-300 bg-white text-body-md text-text-primary focus:border-info focus:ring-info" />
        </label>
        <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
          Monthly budget
          <input type="number" min={100} max={50000} value={proposal.values.maxMonthlyBudget ?? ''} onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isInteger(value)) update({ maxMonthlyBudget: value });
          }} className="min-h-11 w-full rounded-lg border-neutral-300 bg-white text-body-md text-text-primary focus:border-info focus:ring-info" />
        </label>
        <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
          Currency
          <input value={proposal.values.currency ?? ''} maxLength={3} onChange={(event) => update({ currency: event.target.value.toUpperCase() })} className="min-h-11 w-full rounded-lg border-neutral-300 bg-white text-body-md uppercase text-text-primary focus:border-info focus:ring-info" />
        </label>
        <BriefSelect labelText="Move" value={proposal.values.moveWindow} onChange={(value) => update({ moveWindow: value })} options={['now', 'within_30_days', 'within_60_days', 'flexible']} />
        <BriefSelect labelText="Home" value={proposal.values.homeType} onChange={(value) => update({ homeType: value })} options={['room_in_shared_home', 'entire_place', 'either']} />
        <BriefSelect labelText="Pets" value={proposal.values.pets} onChange={(value) => update({ pets: value })} options={['none', 'cat', 'dog', 'other', 'flexible']} />
        <BriefSelect labelText="Smoking" value={proposal.values.smoking} onChange={(value) => update({ smoking: value })} options={['no_smoking', 'outdoor_only', 'flexible']} />
        <BriefSelect labelText="Quiet time" value={proposal.values.quietTime} onChange={(value) => update({ quietTime: value })} options={['early_evenings', 'late_evenings', 'flexible']} />
      </div>
      {!valid ? <p role="status" className="mx-4 mb-3 rounded-lg bg-warning-surface px-3 py-2 text-body-sm text-warning-dark sm:mx-5">Use the practical living options shown here.</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 px-4 py-3 sm:px-5">
        <p className="text-body-sm text-text-secondary">Nothing changes until you approve it.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => runHumanMutation(activity, 'discard_brief', () => store.discardStagedBrief())}>Discard</Button>
          <Button disabled={!valid} onClick={() => runHumanMutation(activity, 'apply_brief', () => store.applyBriefByHuman(proposal.proposalRef))}>Use this brief</Button>
        </div>
      </div>
    </m.section>
  );
}

function SiteToolsBadge({ status }: { status: 'checking' | 'ready' | 'unsupported' | 'error' }) {
  return (
    <div className={cn(
      'inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-body-sm font-semibold',
      status === 'ready' ? 'border-success/30 bg-success-surface text-success-dark' :
        status === 'error' ? 'border-error/30 bg-error-surface text-error-dark' : 'border-neutral-200 bg-white text-text-secondary',
    )} role="status" aria-label="Site tools status">
      <span className={cn('h-2 w-2 rounded-full', status === 'ready' ? 'bg-success' : status === 'error' ? 'bg-error' : 'bg-neutral-400')} aria-hidden="true" />
      {status === 'ready' ? 'Site tools ready' : status === 'checking' ? 'Checking site tools' : status === 'error' ? 'Site tools could not register' : 'Site tools unavailable'}
    </div>
  );
}

function IntroductionPanel({
  store,
  state,
  activity,
}: {
  store: DecisionRoomStore;
  state: DecisionRoomState;
  activity: DecisionRoomActivityStore;
}) {
  if (!state.introduction) return null;
  return (
    <m.section
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      role="region"
      aria-label="Introduction note"
      data-human-action="introduction-confirmation"
      className="overflow-hidden rounded-[1.35rem] border border-success/30 bg-neutral-0 shadow-elevated"
    >
      <div className="flex items-start gap-3 border-b border-success/20 bg-success-surface px-4 py-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success-dark" aria-hidden="true" />
        <div>
          <p className="text-body-sm font-semibold uppercase tracking-[0.12em] text-success-dark">Your move</p>
          <h2 className="font-display text-h4 font-semibold text-text-primary">Check the note before anything happens.</h2>
        </div>
      </div>
      <div className="p-4">
        <label className="block space-y-2 text-body-sm font-medium text-text-secondary">
          Introduction draft
          <textarea
            aria-label="Introduction draft"
            value={state.introduction.draft}
            maxLength={600}
            rows={7}
            onChange={(event) => runHumanMutation(activity, 'edit_introduction', () => store.updateIntroductionDraft(event.target.value))}
            className="w-full resize-y rounded-xl border-neutral-300 bg-white text-body-md leading-relaxed text-text-primary focus:border-info focus:ring-info"
          />
        </label>
        {state.notice?.kind === 'safety' ? <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning-surface px-3 py-2 text-body-sm text-warning-dark"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{state.notice.message}</p> : null}
      </div>
      {state.phase === 'INTRODUCTION_STAGED' ? (
        <div className="flex justify-end border-t border-neutral-100 px-4 py-3">
          <Button disabled={!state.introduction.isSafeToConfirm} onClick={() => runHumanMutation(activity, 'confirm_introduction', () => store.confirmIntroductionByHuman())}>
            <Check className="h-4 w-4" aria-hidden="true" /> Confirm demo introduction
          </Button>
        </div>
      ) : null}
      {state.receipt ? <div className="border-t border-success/20 bg-success-surface px-4 py-3 text-body-md font-semibold text-success-dark">{state.receipt.message}</div> : null}
    </m.section>
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
  const [siteToolsStatus, setSiteToolsStatus] = useState<'checking' | 'ready' | 'unsupported' | 'error'>('checking');
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
  const [introRoomRef, setIntroRoomRef] = useState('');
  const [introTone, setIntroTone] = useState<'warm' | 'direct' | 'casual'>('warm');
  const [busy, setBusy] = useState(false);
  const changedRegionRef = useRef<HTMLDivElement>(null);
  const visualStage = visualStageForPhase(state.phase);

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
    lease.ready.then(() => { if (active) setSiteToolsStatus('ready'); }).catch(() => { if (active) setSiteToolsStatus('error'); });
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

  const findRooms = async () => {
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

  const comparisonRooms = useMemo(() => {
    if (!state.results || !state.comparison) return [];
    return state.comparison.roomRefs
      .map((roomRef) => state.results?.rooms.find((room) => room.roomRef === roomRef))
      .filter((room): room is SafeRoomSummary => Boolean(room));
  }, [state.comparison, state.results]);
  const introductionRoom = state.introduction && state.results
    ? state.results.rooms.find((room) => room.roomRef === state.introduction?.roomRef) ?? null
    : null;

  const reset = () => {
    const result = store.resetByHuman();
    activity.reset();
    const token = activity.begin('human', 'reset');
    activity.complete(token, { stateVersion: result.stateVersion });
  };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <main className="min-h-screen bg-neutral-50 text-text-primary">
          <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BrandDoorwayMark className="h-11 w-11 shrink-0" />
                <div>
                  <p className="font-display text-lg font-bold tracking-tight text-text-primary">CoHabby</p>
                  <p className="text-body-sm text-text-tertiary">Living Decision Room</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SiteToolsBadge status={siteToolsStatus} />
                <Button variant="ghost" onClick={reset} aria-label="Reset demo"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Reset</Button>
              </div>
            </header>

            {siteToolsStatus === 'unsupported' ? <p className="mt-3 rounded-xl border border-neutral-200 bg-neutral-0 px-4 py-2.5 text-body-sm text-text-secondary">Site tools are not available here. You can still use the full demo on this page.</p> : null}

            <section className="grid gap-5 pb-4 pt-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:pt-8">
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-primary-ink">One room decision. Made together.</p>
                <h1 className="mt-2 max-w-4xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">Tell CoHabby how you want to live.</h1>
                <p className="mt-3 max-w-2xl text-body-lg text-text-secondary">Your browser agent can sort the options. You make the calls.</p>
              </div>
              {state.phase === 'READY' ? <Button className="w-full sm:w-auto" onClick={() => runHumanMutation(activity, 'stage_living_brief', () => store.stageLivingBrief(sampleBrief), (result) => [result.proposalRef])}>Try a New York example</Button> : null}
            </section>

            <SampleLivingTokens />

            <LayoutGroup id="living-matchboard">
              <section className="mt-4 grid items-start gap-4 lg:grid-cols-[210px_minmax(0,1fr)]" aria-label="Decision workspace">
                <div
                  ref={changedRegionRef}
                  tabIndex={-1}
                  role="region"
                  aria-label="Living Matchboard"
                  aria-live="polite"
                  data-visual-stage={visualStage}
                  className="order-1 relative min-w-0 overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-[#F8EFE8] p-3 shadow-elevated focus:outline-none sm:p-4 lg:order-2 lg:p-5"
                >
                  <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-55" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="matchboard-ribbon" x1="80" y1="120" x2="930" y2="510" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF6B4A" />
                        <stop offset="0.52" stopColor="#F4C95D" />
                        <stop offset="1" stopColor="#00A699" />
                      </linearGradient>
                    </defs>
                    <path d="M70 125 C230 125 190 260 345 260 S500 405 650 405 S805 520 940 520" fill="none" stroke="#EADCD2" strokeWidth="18" strokeLinecap="round" />
                    <m.path d="M70 125 C230 125 190 260 345 260 S500 405 650 405 S805 520 940 520" fill="none" stroke="url(#matchboard-ribbon)" strokeWidth="18" strokeLinecap="round" initial={false} animate={{ pathLength: stageProgress[visualStage] }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} />
                  </svg>

                  <div className="relative z-10">
                    <LivingBriefTray state={state} />

                    <m.section layout className="mt-4 rounded-[1.35rem] border border-neutral-200 bg-neutral-0/95 p-3 shadow-card sm:p-4" aria-label="Room cards">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-body-sm font-semibold uppercase tracking-[0.12em] text-info-dark">On the table</p>
                          <h2 className="font-display text-h4 font-semibold text-text-primary">{state.results ? `${state.results.rooms.length} practical options` : 'Room cards land here'}</h2>
                        </div>
                        {state.results ? <Chip color="info">Synthetic demo rooms</Chip> : null}
                      </div>

                      {!state.results ? <EmptyRoomSlots /> : state.results.rooms.length === 0 ? (
                        <div className="grid min-h-56 place-items-center text-center"><div><p className="font-display text-h3 text-text-primary">No demo rooms match yet</p><p className="mt-2 text-body-sm text-text-tertiary">Try another practical brief.</p></div></div>
                      ) : comparisonRooms.length > 0 ? (
                        <ComparisonStage rooms={comparisonRooms} dimensions={state.comparison?.dimensions ?? []} />
                      ) : (
                        <AnimatePresence mode="popLayout">
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {state.results.rooms.map((room) => <RoomCard key={room.roomRef} room={room} checked={selectedRefs.includes(room.roomRef)} disabled={selectedRefs.length >= 3} onToggle={() => toggleRoom(room.roomRef)} />)}
                          </div>
                        </AnimatePresence>
                      )}

                      {state.phase === 'BRIEF_APPLIED_BY_HUMAN' ? <div className="mt-4 flex justify-end"><Button disabled={busy} onClick={() => void findRooms()}><Search className="h-4 w-4" aria-hidden="true" />{busy ? 'Finding rooms…' : 'Find compatible rooms'}</Button></div> : null}
                      {state.phase === 'RESULTS_READY' ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-body-sm text-text-secondary">Pick 2 or 3 rooms to line up.</p><Button variant="secondary" disabled={selectedRefs.length < 2 || selectedRefs.length > 3} onClick={() => runHumanMutation(activity, 'compare_shortlist', () => store.compareShortlist({ roomRefs: selectedRefs }), (result) => result.roomRefs)}><GitCompareArrows className="h-4 w-4" aria-hidden="true" />Compare {selectedRefs.length} rooms</Button></div> : null}
                      {state.phase === 'COMPARISON_READY' ? (
                        <div className="mt-4 grid gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                          <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">Room<select value={introRoomRef} onChange={(event) => setIntroRoomRef(event.target.value)} className="min-h-11 w-full rounded-lg border-neutral-300 bg-white text-body-md focus:border-info focus:ring-info">{comparisonRooms.map((room) => <option key={room.roomRef} value={room.roomRef}>{room.headline}</option>)}</select></label>
                          <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">Tone<select value={introTone} onChange={(event) => setIntroTone(event.target.value as typeof introTone)} className="min-h-11 w-full rounded-lg border-neutral-300 bg-white text-body-md focus:border-info focus:ring-info"><option value="warm">Warm</option><option value="direct">Direct</option><option value="casual">Casual</option></select></label>
                          <Button disabled={!introRoomRef} onClick={() => runHumanMutation(activity, 'prepare_introduction', () => store.prepareIntroduction({ roomRef: introRoomRef, tone: introTone }), (result) => [result.roomRef])}>Prepare introduction</Button>
                        </div>
                      ) : null}
                    </m.section>

                    <AnimatePresence>
                      <BriefProposal store={store} state={state} activity={activity} />
                    </AnimatePresence>

                    {state.introduction ? <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">{introductionRoom ? <m.section layout role="region" aria-label="Chosen room" className="rounded-[1.35rem] border border-dashed border-neutral-300 bg-neutral-0/70 p-3 sm:p-5"><div className="mb-3 flex items-center gap-3"><BrandDoorwayMark className="h-11 w-11" /><div><p className="text-body-sm font-semibold uppercase tracking-[0.12em] text-primary-ink">Chosen for the note</p><p className="font-display text-h4 font-semibold text-text-primary">One room. One note. Your call.</p></div></div><RoomCard room={introductionRoom} checked disabled onToggle={() => undefined} compact selectable={false} /></m.section> : null}<IntroductionPanel store={store} state={state} activity={activity} /></div> : null}
                  </div>
                </div>
                <div className="order-2 lg:order-1">
                  <AgentActivityRail phase={state.phase} activity={activitySnapshot} />
                </div>
              </section>
            </LayoutGroup>

            <details className="mt-4 rounded-xl border border-warning/25 bg-warning-surface px-4 py-3 text-body-sm text-warning-dark">
              <summary className="cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning">Matches use practical living needs only.</summary>
              <p className="mt-2 max-w-4xl">CoHabby compares budget, move timing, pets, smoking, quiet time, and shared-home rules. It does not rank homes or people by protected traits.</p>
            </details>

            <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 py-4 text-body-sm text-text-tertiary">
              <p>Synthetic data. No login, model API, microphone, or real message.</p>
              <p>Source {sourceRevision.slice(0, 12)}</p>
            </footer>
          </div>
        </main>
      </LazyMotion>
    </MotionConfig>
  );
}
