'use client';

import {
  Check,
  CircleAlert,
  GitCompareArrows,
  House,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { createDecisionRoomStore, DecisionRoomError, type DecisionRoomStore } from '@/lib/decision-room/store';
import type { DecisionRoomState, SafeRoomSummary } from '@/lib/decision-room/types';
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

const samplePrompt = 'Help me find a quiet room in New York under $1,900 a month. I want to move within 30 days, I do not smoke, and I have a cat. Compare the strongest options and prepare a warm introduction to the best one.';

const optionLabels: Record<string, string> = {
  now: 'Now',
  within_30_days: 'Within 30 days',
  within_60_days: 'Within 60 days',
  flexible: 'Flexible',
  room_in_shared_home: 'Room in a shared home',
  entire_place: 'Entire place',
  either: 'Either',
  none: 'None',
  cat: 'Cat',
  dog: 'Dog',
  other: 'Other',
  no_smoking: 'No smoking',
  outdoor_only: 'Outdoor only',
  early_evenings: 'Early evenings',
  late_evenings: 'Late evenings',
};

function label(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'Not set';
  if (typeof value === 'number') return String(value);
  return optionLabels[String(value)] ?? String(value);
}

function money(room: SafeRoomSummary): string {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: room.currency,
    maximumFractionDigits: 0,
  }).format(room.monthlyPrice);
}

function BriefSummary({ state }: { state: DecisionRoomState }) {
  const brief = state.appliedBrief;
  if (!brief) {
    return (
      <div className="grid min-h-52 place-items-center px-6 py-8 text-center">
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-surface text-2xl" aria-hidden="true">🏠</div>
          <p className="mt-4 font-display text-h4 text-text-primary">Your brief will appear here</p>
          <p className="mt-2 max-w-xs text-body-md text-text-secondary">Load the sample or ask your browser agent to stage one.</p>
        </div>
      </div>
    );
  }
  const entries = [
    ['Market', brief.market],
    ['Budget', brief.maxMonthlyBudget ? `${brief.currency ?? ''} ${brief.maxMonthlyBudget.toLocaleString()}`.trim() : undefined],
    ['Move', brief.moveWindow],
    ['Home', brief.homeType],
    ['Pets', brief.pets],
    ['Smoking', brief.smoking],
    ['Quiet time', brief.quietTime],
  ] as const;
  return (
    <div className="space-y-4 px-6 py-5">
      <div className="flex items-center gap-2 text-success-dark">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        <p className="font-display text-sm font-semibold">Brief approved by you</p>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {entries.map(([name, value]) => (
          <div key={name} className="flex flex-col gap-0.5">
            <span className="text-body-sm text-text-tertiary">{name}</span>
            <span className="text-body-md font-medium text-text-primary">{label(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefProposal({ store, state }: { store: DecisionRoomStore; state: DecisionRoomState }) {
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
      store.updateStagedBrief(value);
    } catch {
      // The inline validity state explains what must be corrected.
    }
  };
  return (
    <Card
      role="region"
      aria-label="Review living brief"
      className="overflow-hidden border-t-[3px] border-t-primary shadow-elevated"
    >
      <div className="flex items-start gap-3 border-b border-neutral-100 bg-primary-surface px-5 py-4 sm:px-6">
        <SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-primary-ink" aria-hidden="true" />
        <div>
          <h2 className="font-display text-h4 text-text-primary">Review living brief</h2>
          <p className="mt-1 text-body-md text-text-secondary">The agent staged this. Nothing changes until you use it.</p>
        </div>
      </div>
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
        <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
          Market
          <input
            value={proposal.values.market ?? ''}
            maxLength={80}
            onChange={(event) => update({ market: event.target.value })}
            className="min-h-11 w-full rounded-lg border-neutral-300 text-body-md text-text-primary focus:border-info focus:ring-info"
          />
        </label>
        <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
          Monthly budget
          <input
            type="number"
            min={100}
            max={50000}
            value={proposal.values.maxMonthlyBudget ?? ''}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value)) update({ maxMonthlyBudget: value });
            }}
            className="min-h-11 w-full rounded-lg border-neutral-300 text-body-md text-text-primary focus:border-info focus:ring-info"
          />
        </label>
        <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
          Currency
          <input
            value={proposal.values.currency ?? ''}
            maxLength={3}
            onChange={(event) => update({ currency: event.target.value.toUpperCase() })}
            className="min-h-11 w-full rounded-lg border-neutral-300 text-body-md uppercase text-text-primary focus:border-info focus:ring-info"
          />
        </label>
        <BriefSelect labelText="Move window" value={proposal.values.moveWindow} onChange={(value) => update({ moveWindow: value })} options={['now', 'within_30_days', 'within_60_days', 'flexible']} />
        <BriefSelect labelText="Home type" value={proposal.values.homeType} onChange={(value) => update({ homeType: value })} options={['room_in_shared_home', 'entire_place', 'either']} />
        <BriefSelect labelText="Pets" value={proposal.values.pets} onChange={(value) => update({ pets: value })} options={['none', 'cat', 'dog', 'other', 'flexible']} />
        <BriefSelect labelText="Smoking" value={proposal.values.smoking} onChange={(value) => update({ smoking: value })} options={['no_smoking', 'outdoor_only', 'flexible']} />
        <BriefSelect labelText="Quiet time" value={proposal.values.quietTime} onChange={(value) => update({ quietTime: value })} options={['early_evenings', 'late_evenings', 'flexible']} />
      </div>
      {!valid ? (
        <p role="status" className="mx-5 mb-3 rounded-lg bg-warning-surface px-3 py-2 text-body-sm text-warning-dark sm:mx-6">
          Use practical living fields with the supported values shown here.
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-100 px-5 py-4 sm:px-6">
        <Button variant="ghost" onClick={() => store.discardStagedBrief()}>Discard proposal</Button>
        <Button disabled={!valid} onClick={() => store.applyBriefByHuman(proposal.proposalRef)}>Use this brief</Button>
      </div>
    </Card>
  );
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
        className="min-h-11 w-full rounded-lg border-neutral-300 text-body-md text-text-primary focus:border-info focus:ring-info"
      >
        <option value="">Not set</option>
        {options.map((option) => <option key={option} value={option}>{label(option)}</option>)}
      </select>
    </label>
  );
}

function RoomCard({
  room,
  checked,
  disabled,
  onToggle,
}: {
  room: SafeRoomSummary;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const bandColor = room.fitBand === 'strong' ? 'success' : room.fitBand === 'good' ? 'info' : 'accent';
  return (
    <article className={cn(
      'rounded-2xl border border-neutral-200 bg-white p-5 shadow-card transition duration-causal',
      checked && 'border-info ring-2 ring-info/20',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Chip color={bandColor}>{room.fitBand === 'strong' ? 'Strong fit' : room.fitBand === 'good' ? 'Good fit' : 'Possible fit'}</Chip>
          <h3 className="mt-3 font-display text-h3 text-text-primary">{room.headline}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-body-md text-text-secondary">
            <MapPin className="h-4 w-4 text-info-dark" aria-hidden="true" /> {room.marketLabel}
          </p>
        </div>
        <label className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full border border-neutral-200 bg-neutral-0 hover:bg-info-surface">
          <span className="sr-only">Compare {room.headline}</span>
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled && !checked}
            onChange={onToggle}
            className="h-5 w-5 rounded border-neutral-300 text-info focus:ring-info"
          />
        </label>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-y border-neutral-100 py-3">
        <span className="font-display text-h3 text-text-primary">{money(room)}</span>
        <span className="text-body-sm text-text-tertiary">per month</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {room.reasonLabels.slice(0, 4).map((reason) => <Chip key={reason} color="info">{reason}</Chip>)}
      </div>
    </article>
  );
}

export function DecisionRoom({ sourceRevision }: { sourceRevision: string }) {
  const storeRef = useRef<DecisionRoomStore | null>(null);
  if (!storeRef.current) storeRef.current = createDecisionRoomStore();
  const store = storeRef.current;
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  const [siteToolsStatus, setSiteToolsStatus] = useState<'checking' | 'ready' | 'unsupported' | 'error'>('checking');
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
  const [introRoomRef, setIntroRoomRef] = useState('');
  const [introTone, setIntroTone] = useState<'warm' | 'direct' | 'casual'>('warm');
  const [busy, setBusy] = useState(false);
  const changedRegionRef = useRef<HTMLDivElement>(null);

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
    const lease = getWebMcpRegistrationCoordinator(context).register(createWebMcpTools(store));
    let active = true;
    lease.ready
      .then(() => { if (active) setSiteToolsStatus('ready'); })
      .catch(() => { if (active) setSiteToolsStatus('error'); });
    return () => {
      active = false;
      lease.dispose();
    };
  }, [state.workspaceGeneration, store]);

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
    setBusy(true);
    try {
      await store.findCompatibleRooms({ limit: 6, order: 'best_fit' }, new AbortController().signal);
    } catch (error) {
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

  return (
    <main className="min-h-screen bg-neutral-50 text-text-primary">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:py-9">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-text-primary">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white" aria-hidden="true">C</span>
            CoHabby
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-body-sm font-medium',
              siteToolsStatus === 'ready' ? 'border-success/30 bg-success-surface text-success-dark' :
                siteToolsStatus === 'error' ? 'border-error/30 bg-error-surface text-error-dark' :
                  'border-neutral-200 bg-white text-text-secondary',
            )}>
              <span className={cn('h-2 w-2 rounded-full', siteToolsStatus === 'ready' ? 'bg-success' : siteToolsStatus === 'error' ? 'bg-error' : 'bg-neutral-400')} aria-hidden="true" />
              {siteToolsStatus === 'ready' ? 'Site tools ready' : siteToolsStatus === 'checking' ? 'Checking site tools' : siteToolsStatus === 'error' ? 'Site tools could not register' : 'Site tools unavailable'}
            </div>
            <Button variant="ghost" onClick={() => store.resetByHuman()} aria-label="Reset demo">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Reset demo
            </Button>
          </div>
        </header>

        {siteToolsStatus === 'unsupported' ? (
          <p className="mt-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-body-sm text-text-secondary">
            Site tools are not available here. You can still use the full demo on this page.
          </p>
        ) : null}

        <section className="pb-8 pt-9 sm:pt-12">
          <div className="max-w-3xl">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-primary-ink">A shared housing decision space</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-text-primary sm:text-5xl">Living Decision Room</h1>
            <p className="mt-4 max-w-2xl text-body-lg leading-relaxed text-text-secondary">Tell your agent how you want to live. Review every change.</p>
          </div>
          <Card className="mt-7 max-w-3xl overflow-hidden border-t-[3px] border-t-gold">
            <div className="flex items-start gap-3 bg-gold-surface px-5 py-4 sm:px-6">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-text-primary">Sample prompt</p>
                <p className="mt-1 text-body-md leading-relaxed text-text-secondary">{samplePrompt}</p>
              </div>
            </div>
            {state.phase === 'READY' ? (
              <div className="flex justify-end border-t border-neutral-100 px-5 py-3 sm:px-6">
                <Button variant="outline" onClick={() => store.stageLivingBrief(sampleBrief)}>Load sample brief</Button>
              </div>
            ) : null}
          </Card>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6">
          <Card className="overflow-hidden border-t-[3px] border-t-primary">
            <div className="flex items-center gap-3 border-b border-neutral-100 bg-primary-surface px-6 py-4">
              <SlidersHorizontal className="h-5 w-5 text-primary-ink" aria-hidden="true" />
              <h2 className="font-display text-h4 text-text-primary">Living brief</h2>
            </div>
            <BriefSummary state={state} />
            {state.phase === 'BRIEF_APPLIED_BY_HUMAN' ? (
              <div className="border-t border-neutral-100 px-6 py-4">
                <Button className="w-full" disabled={busy} onClick={() => void findRooms()}>
                  <Search className="h-4 w-4" aria-hidden="true" /> {busy ? 'Finding rooms…' : 'Find compatible rooms'}
                </Button>
              </div>
            ) : null}
          </Card>

          <div ref={changedRegionRef} tabIndex={-1} className="min-w-0 focus:outline-none" aria-live="polite">
            <Card className="overflow-hidden border-t-[3px] border-t-info">
              <div className="flex items-center justify-between gap-3 border-b border-neutral-100 bg-info-surface px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <House className="h-5 w-5 text-info-dark" aria-hidden="true" />
                  <h2 className="font-display text-h4 text-text-primary">Rooms and comparison</h2>
                </div>
                {state.results ? <Chip color="info">{state.results.rooms.length} rooms</Chip> : null}
              </div>
              {!state.results ? (
                <div className="grid min-h-72 place-items-center px-6 py-10 text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-info-surface text-2xl" aria-hidden="true">🔎</div>
                    <p className="mt-4 font-display text-h3 text-text-primary">Your room canvas is ready</p>
                    <p className="mt-2 max-w-sm text-body-md text-text-secondary">Approve a living brief, then let CoHabby find the practical matches.</p>
                  </div>
                </div>
              ) : state.results.rooms.length === 0 ? (
                <div className="grid min-h-72 place-items-center px-6 py-10 text-center">
                  <div>
                    <p className="text-3xl" aria-hidden="true">🧭</p>
                    <p className="mt-3 font-display text-h3 text-text-primary">No demo rooms match yet</p>
                    <p className="mt-2 text-body-sm italic text-text-tertiary">Try another practical brief.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 p-4 sm:p-6">
                  <div className="grid gap-4 xl:grid-cols-2">
                    {state.results.rooms.map((room) => (
                      <RoomCard
                        key={room.roomRef}
                        room={room}
                        checked={selectedRefs.includes(room.roomRef)}
                        disabled={selectedRefs.length >= 3}
                        onToggle={() => toggleRoom(room.roomRef)}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      disabled={selectedRefs.length < 2 || selectedRefs.length > 3}
                      onClick={() => store.compareShortlist({ roomRefs: selectedRefs })}
                    >
                      <GitCompareArrows className="h-4 w-4" aria-hidden="true" /> Compare {selectedRefs.length} rooms
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {comparisonRooms.length > 0 ? (
              <Card role="region" aria-label="Room comparison" className="mt-5 overflow-hidden border-t-[3px] border-t-accent">
                <div className="flex items-center gap-3 border-b border-neutral-100 bg-accent-surface px-5 py-4 sm:px-6">
                  <GitCompareArrows className="h-5 w-5 text-accent-dark" aria-hidden="true" />
                  <h2 className="font-display text-h4 text-text-primary">Decision board</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left text-body-md">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-0">
                        <th className="px-5 py-3 font-display font-semibold text-text-secondary">Practical detail</th>
                        {comparisonRooms.map((room) => <th key={room.roomRef} className="px-5 py-3 font-display font-semibold text-text-primary">{room.headline}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Monthly price', (room: SafeRoomSummary) => money(room)],
                        ['Move window', (room: SafeRoomSummary) => label(room.availableWindow)],
                        ['Home type', (room: SafeRoomSummary) => label(room.homeType)],
                        ['Practical fit', (room: SafeRoomSummary) => label(room.fitBand)],
                      ].map(([name, read]) => (
                        <tr key={String(name)} className="border-b border-neutral-100 last:border-0">
                          <th className="px-5 py-3 font-medium text-text-secondary">{String(name)}</th>
                          {comparisonRooms.map((room) => <td key={room.roomRef} className="px-5 py-3 font-medium text-text-primary">{(read as (room: SafeRoomSummary) => string)(room)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {state.phase === 'COMPARISON_READY' ? (
                  <div className="grid gap-3 border-t border-neutral-100 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-end sm:px-6">
                    <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
                      Room
                      <select value={introRoomRef} onChange={(event) => setIntroRoomRef(event.target.value)} className="min-h-11 w-full rounded-lg border-neutral-300 text-body-md focus:border-info focus:ring-info">
                        {comparisonRooms.map((room) => <option key={room.roomRef} value={room.roomRef}>{room.headline}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5 text-body-sm font-medium text-text-secondary">
                      Tone
                      <select value={introTone} onChange={(event) => setIntroTone(event.target.value as typeof introTone)} className="min-h-11 w-full rounded-lg border-neutral-300 text-body-md focus:border-info focus:ring-info">
                        <option value="warm">Warm</option>
                        <option value="direct">Direct</option>
                        <option value="casual">Casual</option>
                      </select>
                    </label>
                    <Button disabled={!introRoomRef} onClick={() => store.prepareIntroduction({ roomRef: introRoomRef, tone: introTone })}>Prepare introduction</Button>
                  </div>
                ) : null}
              </Card>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <BriefProposal store={store} state={state} />
          {state.introduction ? (
            <Card className="overflow-hidden border-t-[3px] border-t-success shadow-elevated">
              <div className="flex items-start gap-3 border-b border-neutral-100 bg-success-surface px-5 py-4 sm:px-6">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-success-dark" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-h4 text-text-primary">Your introduction stays here</h2>
                  <p className="mt-1 text-body-md text-text-secondary">Edit the full draft. This demo never sends it.</p>
                </div>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <label className="block space-y-2 text-body-sm font-medium text-text-secondary">
                  Introduction draft
                  <textarea
                    aria-label="Introduction draft"
                    value={state.introduction.draft}
                    maxLength={600}
                    rows={5}
                    onChange={(event) => store.updateIntroductionDraft(event.target.value)}
                    className="w-full resize-y rounded-xl border-neutral-300 text-body-md leading-relaxed text-text-primary focus:border-info focus:ring-info"
                  />
                </label>
                {state.notice?.kind === 'safety' ? (
                  <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning-surface px-3 py-2 text-body-sm text-warning-dark">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {state.notice.message}
                  </p>
                ) : null}
              </div>
              {state.phase === 'INTRODUCTION_STAGED' ? (
                <div className="flex justify-end border-t border-neutral-100 px-5 py-4 sm:px-6">
                  <Button disabled={!state.introduction.isSafeToConfirm} onClick={() => store.confirmIntroductionByHuman()}>
                    <Check className="h-4 w-4" aria-hidden="true" /> Confirm demo introduction
                  </Button>
                </div>
              ) : null}
              {state.receipt ? (
                <div className="border-t border-success/20 bg-success-surface px-5 py-4 text-body-md font-medium text-success-dark sm:px-6">
                  {state.receipt.message}
                </div>
              ) : null}
            </Card>
          ) : null}
        </div>

        <aside className="mt-8 flex items-start gap-3 rounded-xl border border-warning/25 bg-warning-surface px-4 py-3 text-body-sm text-warning-dark">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>CoHabby compares budget, move timing, pets, smoking, quiet time, and shared-home rules. It does not rank homes or people by protected traits.</p>
        </aside>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-5 text-body-sm text-text-tertiary">
          <p>Synthetic challenge data. No login, model API, or real message.</p>
          <p>Source {sourceRevision.slice(0, 12)}</p>
        </footer>
      </div>
    </main>
  );
}
