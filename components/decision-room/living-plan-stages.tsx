'use client';

import {
  BadgeDollarSign,
  CalendarClock,
  Cat,
  House,
  MapPin,
  MoonStar,
  SlidersHorizontal,
  Sparkles,
  Sunrise,
} from 'lucide-react';
import { m } from 'motion/react';

import type { DecisionRoomActivityStore } from '@/lib/decision-room/activity-store';
import type { DecisionRoomStore } from '@/lib/decision-room/store';
import type { DecisionRoomState } from '@/lib/decision-room/types';
import { parseToolInput } from '@/lib/webmcp/tool-contracts';

import { ActionDock } from './action-dock';
import { displayLabel, LivingPlanTiles } from './v3-primitives';

export const sampleLivingPlan = {
  market: 'New York',
  currency: 'USD',
  maxMonthlyBudget: 1900,
  moveWindow: 'within_30_days',
  homeType: 'room_in_shared_home',
  pets: 'cat',
  smoking: 'no_smoking',
  quietTime: 'early_evenings',
} as const;

const profileSignals = [
  { label: 'Early mornings', icon: Sunrise, color: 'bg-gold-surface text-gold-dark' },
  { label: 'Tidy shared spaces', icon: Sparkles, color: 'bg-info-surface text-info-dark' },
  { label: 'Quiet weekends', icon: MoonStar, color: 'bg-accent-surface text-accent-dark' },
  { label: 'Cat-friendly home', icon: Cat, color: 'bg-success-surface text-success-dark' },
] as const;

export function ReadyStage({ onStart }: { onStart: () => void }) {
  return (
    <m.section
      key="ready"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto flex min-h-[510px] max-w-6xl flex-col justify-center py-5 sm:py-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="stage-copy-soft font-display text-sm font-bold uppercase tracking-[0.16em] text-primary-ink">A quick roommate demo</p>
        <h2 className="stage-copy-halo mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">Show CoHabby how you like to live.</h2>
        <p className="stage-copy-soft mx-auto mt-2 max-w-2xl text-body-lg text-text-secondary">Start with a few everyday choices. We&apos;ll use them to find roommates who may fit your life at home.</p>
      </div>

      <div className="mt-7">
        <LivingPlanTiles brief={sampleLivingPlan} />
      </div>

      <ul className="mx-auto mt-5 grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Synthetic demo living style">
        {profileSignals.map(({ label, icon: Icon, color }) => (
          <li key={label} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl px-3 py-3 text-center ${color}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="font-display text-sm font-semibold">{label}</span>
          </li>
        ))}
      </ul>

      <ActionDock
        instruction="Watch your daily habits turn into roommate matches."
        status="Fictional people, homes, and Synergy Scores."
        primaryLabel="Try the roommate demo"
        onPrimary={onStart}
      />
    </m.section>
  );
}

function PlanSelect({
  labelText,
  value,
  options,
  icon: Icon,
  onChange,
}: {
  labelText: string;
  value: string | undefined;
  options: ReadonlyArray<string>;
  icon: typeof MapPin;
  onChange: (value: string) => void;
}) {
  return (
    <label className="group relative block">
      <span className="mb-1.5 flex items-center gap-2 font-display text-sm font-semibold text-text-secondary">
        <Icon className="h-4 w-4 text-info-dark" aria-hidden="true" />
        {labelText}
      </span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border-neutral-300 bg-white/90 text-body-md text-text-primary shadow-sm focus:border-info focus:ring-info"
      >
        {options.map((option) => <option key={option} value={option}>{displayLabel(option)}</option>)}
      </select>
    </label>
  );
}

export function PlanReviewStage({
  state,
  store,
  onMutation,
}: {
  state: DecisionRoomState;
  store: DecisionRoomStore;
  onMutation: (
    action: 'edit_brief' | 'discard_brief' | 'apply_brief',
    operation: () => { stateVersion: number },
  ) => void;
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
      onMutation('edit_brief', () => store.updateStagedBrief(value));
    } catch {
      // The visible validity message stays beside the controls.
    }
  };

  return (
    <m.section
      key="plan-review"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      role="region"
      aria-label="Check your living plan"
      className="mx-auto min-h-[510px] max-w-6xl py-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="stage-copy-soft font-display text-sm font-bold uppercase tracking-[0.16em] text-primary-ink">Your choices, your call</p>
          <h2 className="stage-copy-halo mt-1 font-display text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">Does this feel like you?</h2>
          <p className="stage-copy-soft mt-2 text-body-lg text-text-secondary">Check the details. Change anything that does not fit before CoHabby looks for roommates.</p>
        </div>
        <div className="rounded-full border border-primary/25 bg-primary-surface px-4 py-2 font-display text-sm font-semibold text-primary-ink">Waiting for your approval</div>
      </div>

      <div className="mt-6 grid gap-x-4 gap-y-5 rounded-[1.5rem] bg-white/78 p-4 shadow-card backdrop-blur sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        <label className="group relative block">
          <span className="mb-1.5 flex items-center gap-2 font-display text-sm font-semibold text-text-secondary"><MapPin className="h-4 w-4 text-info-dark" aria-hidden="true" />Market</span>
          <input aria-label="Market" value={proposal.values.market ?? ''} maxLength={80} onChange={(event) => update({ market: event.target.value })} className="min-h-12 w-full rounded-xl border-neutral-300 bg-white/90 text-body-md text-text-primary shadow-sm focus:border-info focus:ring-info" />
        </label>
        <label className="group relative block">
          <span className="mb-1.5 flex items-center gap-2 font-display text-sm font-semibold text-text-secondary"><BadgeDollarSign className="h-4 w-4 text-primary-ink" aria-hidden="true" />Monthly budget</span>
          <input aria-label="Monthly budget" type="number" min={100} max={50000} value={proposal.values.maxMonthlyBudget ?? ''} onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isInteger(value)) update({ maxMonthlyBudget: value });
          }} className="min-h-12 w-full rounded-xl border-neutral-300 bg-white/90 text-body-md text-text-primary shadow-sm focus:border-info focus:ring-info" />
        </label>
        <label className="group relative block">
          <span className="mb-1.5 flex items-center gap-2 font-display text-sm font-semibold text-text-secondary"><BadgeDollarSign className="h-4 w-4 text-primary-ink" aria-hidden="true" />Currency</span>
          <input aria-label="Currency" value={proposal.values.currency ?? ''} maxLength={3} onChange={(event) => update({ currency: event.target.value.toUpperCase() })} className="min-h-12 w-full rounded-xl border-neutral-300 bg-white/90 text-body-md uppercase text-text-primary shadow-sm focus:border-info focus:ring-info" />
        </label>
        <PlanSelect labelText="Move timing" value={proposal.values.moveWindow} onChange={(value) => update({ moveWindow: value })} options={['now', 'within_30_days', 'within_60_days', 'flexible']} icon={CalendarClock} />
        <PlanSelect labelText="Home setup" value={proposal.values.homeType} onChange={(value) => update({ homeType: value })} options={['room_in_shared_home', 'entire_place', 'either']} icon={House} />
        <PlanSelect labelText="Pets" value={proposal.values.pets} onChange={(value) => update({ pets: value })} options={['none', 'cat', 'dog', 'other', 'flexible']} icon={Cat} />
        <PlanSelect labelText="Smoking" value={proposal.values.smoking} onChange={(value) => update({ smoking: value })} options={['no_smoking', 'outdoor_only', 'flexible']} icon={SlidersHorizontal} />
        <PlanSelect labelText="Quiet time" value={proposal.values.quietTime} onChange={(value) => update({ quietTime: value })} options={['early_evenings', 'late_evenings', 'flexible']} icon={MoonStar} />
      </div>

      {!valid ? <p role="status" className="mt-3 rounded-xl bg-warning-surface px-4 py-3 text-body-sm font-medium text-warning-dark">Choose one of the practical options shown here.</p> : null}

      <ActionDock
        instruction="Approve these choices before the search begins."
        status="Your browser agent cannot approve them for you."
        primaryLabel="Yes, use these choices"
        primaryDisabled={!valid}
        onPrimary={() => onMutation('apply_brief', () => store.applyBriefByHuman(proposal.proposalRef))}
        secondaryLabel="Start over"
        onSecondary={() => onMutation('discard_brief', () => store.discardStagedBrief())}
        humanAction="living-plan-approval"
      />
    </m.section>
  );
}

export function PlanAppliedStage({
  state,
  busy,
  onFind,
}: {
  state: DecisionRoomState;
  busy: boolean;
  onFind: () => void;
}) {
  return (
    <m.section
      key="plan-applied"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      role="region"
      aria-label="Ready to find people and homes"
      className="mx-auto flex min-h-[510px] max-w-6xl flex-col justify-center py-5"
    >
      <div className="mx-auto w-full max-w-4xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-success-surface text-success-dark shadow-sm"><Sparkles className="h-7 w-7" aria-hidden="true" /></span>
        <h2 className="stage-copy-halo mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">Your living plan is ready.</h2>
        <p className="stage-copy-soft mx-auto mt-2 max-w-2xl text-body-lg text-text-secondary">Next, CoHabby will find fictional people whose home habits may fit yours.</p>
        <div className="mt-6 text-left"><LivingPlanTiles brief={state.appliedBrief ?? sampleLivingPlan} /></div>
      </div>
      <ActionDock
        instruction="Ready to meet your roommate matches?"
        status="People first. Home details second."
        primaryLabel={busy ? 'Finding people...' : 'Show my matches'}
        primaryDisabled={busy}
        onPrimary={onFind}
      />
    </m.section>
  );
}

export type LivingPlanStageActivity = Pick<DecisionRoomActivityStore, 'begin' | 'complete' | 'fail'>;
