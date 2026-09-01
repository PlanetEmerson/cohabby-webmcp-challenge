'use client';

import {
  Check,
  FilePenLine,
  GitCompareArrows,
  MessageSquareText,
  ScanSearch,
  Search,
  Sparkles,
} from 'lucide-react';

import type { DecisionRoomActivitySnapshot } from '@/lib/decision-room/activity-store';
import type { DecisionRoomPhase } from '@/lib/decision-room/types';
import { cn } from '@/lib/utils/cn';

export type SiteToolsStatus = 'checking' | 'ready' | 'unsupported' | 'error';

const steps = [
  { action: 'get_living_context', label: 'Read your habits', tool: 'get_living_context', icon: ScanSearch, rank: 0 },
  { action: 'stage_living_brief', label: 'Set must-haves', tool: 'stage_living_brief', icon: FilePenLine, rank: 1 },
  { action: 'find_compatible_rooms', label: 'Find roommate matches', tool: 'find_compatible_rooms', icon: Search, rank: 2 },
  { action: 'explain_synergy_match', label: 'Explain Synergy', tool: 'explain_synergy_match', icon: Sparkles, rank: 3 },
  { action: 'compare_shortlist', label: 'Compare daily life', tool: 'compare_shortlist', icon: GitCompareArrows, rank: 4 },
  { action: 'prepare_introduction', label: 'Write a first hello', tool: 'prepare_introduction', icon: MessageSquareText, rank: 5 },
] as const;

const phaseRank: Record<DecisionRoomPhase, number> = {
  READY: 0,
  BRIEF_STAGED: 1,
  BRIEF_APPLIED_BY_HUMAN: 1,
  RESULTS_READY: 2,
  SYNERGY_EXPLAINED: 3,
  COMPARISON_READY: 4,
  INTRODUCTION_STAGED: 5,
  INTRODUCTION_CONFIRMED_BY_HUMAN: 6,
};

function activityMessage(activity: DecisionRoomActivitySnapshot): string {
  if (!activity.action || activity.status === 'idle') return 'Your browser agent is ready on this page.';
  const owner = activity.actor === 'agent' ? 'Your browser agent' : 'You';
  if (activity.status === 'running') return `${owner} ${activity.actor === 'agent' ? 'is updating the page.' : 'are updating your choices.'}`;
  if (activity.status === 'canceled') return 'Canceled. Your choices stayed the same.';
  if (activity.status === 'error') return 'That step did not finish. Your choices stayed the same.';
  switch (activity.action) {
    case 'get_living_context': return 'Your agent read your living habits.';
    case 'stage_living_brief': return 'Your choices are ready to review.';
    case 'find_compatible_rooms': return `${activity.targetRefs.length} roommate matches added to the page.`;
    case 'explain_synergy_match': return 'The synthetic Synergy read is open.';
    case 'return_to_results': return 'Your roommate matches are back.';
    case 'compare_shortlist': return `${activity.targetRefs.length} roommates are side by side.`;
    case 'prepare_introduction': return 'Your first hello is ready to review.';
    case 'apply_brief': return 'You approved your living choices.';
    case 'discard_brief': return 'You cleared the draft choices.';
    case 'edit_brief': return 'You updated your living choices.';
    case 'edit_introduction': return 'You changed the hello.';
    case 'confirm_introduction': return 'Demo confirmed. No real message was sent.';
    case 'reset': return 'The demo is ready to start again.';
  }
}

export function WebMcpRibbon({
  phase,
  activity,
  siteToolsStatus,
}: {
  phase: DecisionRoomPhase;
  activity: DecisionRoomActivitySnapshot;
  siteToolsStatus: SiteToolsStatus;
}) {
  const rank = phaseRank[phase];
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/90 px-3 py-2.5 shadow-card backdrop-blur sm:px-5 sm:py-3" aria-label="CoHabby and browser agent collaboration">
      <div className="grid gap-2.5 xl:grid-cols-[160px_minmax(0,1fr)_220px] xl:items-center">
        <div className="hidden items-center gap-2 font-display text-sm font-semibold text-text-primary xl:flex">
          <Sparkles className="h-4 w-4 text-primary-ink" aria-hidden="true" />
          <span>CoHabby<br /><span className="font-normal text-text-secondary">+ your browser agent</span></span>
        </div>
        <ol className="grid grid-cols-6 gap-1" aria-label="CoHabby and browser agent steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const running = activity.action === step.action && activity.status === 'running';
            const completed = rank > step.rank || phase === 'INTRODUCTION_CONFIRMED_BY_HUMAN';
            const current = running || (!completed && rank === step.rank);
            return (
              <li key={step.tool} className="relative min-w-0 text-center" aria-current={current ? 'step' : undefined}>
                {index > 0 ? <span className={cn('absolute right-1/2 top-[18px] h-px w-full', completed || current ? 'bg-info/45' : 'bg-neutral-200')} aria-hidden="true" /> : null}
                <span className={cn(
                  'relative z-10 mx-auto grid h-9 w-9 place-items-center rounded-full border bg-white transition duration-causal',
                  completed && 'border-info/40 bg-info-surface text-info-dark',
                  current && 'border-primary bg-primary-surface text-primary-ink ring-4 ring-primary/10',
                  !completed && !current && 'border-neutral-200 text-text-tertiary',
                )}>
                  {completed ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                </span>
                <span className={cn('mt-1.5 hidden min-h-[2.1rem] px-0.5 font-display text-[11px] font-semibold leading-[1.05] sm:block', current ? 'text-text-primary' : completed ? 'text-info-dark' : 'text-text-tertiary')}>
                  {step.label}
                </span>
                <span className="sr-only">Step {index + 1}: {step.label}</span>
              </li>
            );
          })}
        </ol>
        <div className="min-h-10 rounded-xl bg-neutral-50 px-3 py-2 text-[11px] leading-relaxed text-text-secondary sm:text-body-sm" aria-live="polite">
          {siteToolsStatus === 'unsupported' || siteToolsStatus === 'error'
            ? 'Site tools aren\'t available in this browser. You can still try the full demo yourself.'
            : activityMessage(activity)}
        </div>
      </div>
    </section>
  );
}

export const exactToolNames = steps.map((step) => step.tool);
