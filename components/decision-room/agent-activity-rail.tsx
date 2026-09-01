'use client';

import {
  Check,
  FilePenLine,
  ListFilter,
  MessageSquareText,
  ScanSearch,
  Search,
} from 'lucide-react';

import type { DecisionRoomActivitySnapshot } from '@/lib/decision-room/activity-store';
import type { DecisionRoomPhase } from '@/lib/decision-room/types';
import { cn } from '@/lib/utils/cn';

const phaseRank: Record<DecisionRoomPhase, number> = {
  READY: 0,
  BRIEF_STAGED: 1,
  BRIEF_APPLIED_BY_HUMAN: 1,
  RESULTS_READY: 2,
  COMPARISON_READY: 3,
  INTRODUCTION_STAGED: 4,
  INTRODUCTION_CONFIRMED_BY_HUMAN: 5,
};

const steps = [
  { action: 'get_living_context', label: 'Read the room', tool: 'get_living_context', icon: ScanSearch, rank: 0 },
  { action: 'stage_living_brief', label: 'Build a brief', tool: 'stage_living_brief', icon: FilePenLine, rank: 1 },
  { action: 'find_compatible_rooms', label: 'Find rooms', tool: 'find_compatible_rooms', icon: Search, rank: 2 },
  { action: 'compare_shortlist', label: 'Line them up', tool: 'compare_shortlist', icon: ListFilter, rank: 3 },
  { action: 'prepare_introduction', label: 'Prepare a note', tool: 'prepare_introduction', icon: MessageSquareText, rank: 4 },
] as const;

function activityMessage(activity: DecisionRoomActivitySnapshot): string {
  if (!activity.action || activity.status === 'idle') return 'Five small tools. One shared page.';
  const owner = activity.actor === 'agent' ? 'Agent' : 'You';
  if (activity.status === 'running') return `${owner} is updating the board`;
  if (activity.status === 'canceled') return 'Canceled. The board did not change.';
  if (activity.status === 'error') return 'That action could not change the board.';
  switch (activity.action) {
    case 'get_living_context':
      return 'Agent read the visible room.';
    case 'stage_living_brief':
      return 'Brief ready for your review.';
    case 'find_compatible_rooms':
      return `${activity.targetRefs.length} rooms landed on the table.`;
    case 'compare_shortlist':
      return `${activity.targetRefs.length} rooms lined up.`;
    case 'prepare_introduction':
      return 'Introduction ready for you.';
    case 'apply_brief':
      return 'You approved the brief.';
    case 'confirm_introduction':
      return 'You confirmed the demo note.';
    case 'discard_brief':
      return 'You cleared the proposal.';
    case 'edit_brief':
      return 'You changed the brief.';
    case 'edit_introduction':
      return 'You changed the note.';
    case 'reset':
      return 'You reset the board.';
  }
}

export function AgentActivityRail({
  phase,
  activity,
}: {
  phase: DecisionRoomPhase;
  activity: DecisionRoomActivitySnapshot;
}) {
  const rank = phaseRank[phase];
  return (
    <aside className="rounded-[1.5rem] border border-neutral-200 bg-neutral-0 p-4 shadow-card lg:sticky lg:top-4 lg:p-5">
      <div className="flex items-center justify-between gap-3 lg:block">
        <div>
          <p className="text-body-sm font-semibold uppercase tracking-[0.14em] text-info-dark">Works beside you</p>
          <h2 className="mt-1 font-display text-h4 font-semibold text-text-primary">Your browser agent</h2>
        </div>
        <details className="relative lg:mt-3">
          <summary className="cursor-pointer rounded-full border border-neutral-200 bg-white px-3 py-2 text-body-sm font-semibold text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info">
            5 site tools
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-3 shadow-elevated lg:left-0 lg:right-auto">
            <p className="text-body-sm text-text-secondary">Exact WebMCP names</p>
            <ul className="mt-2 space-y-1.5">
              {steps.map((step) => <li key={step.tool}><code className="text-xs text-text-primary">{step.tool}</code></li>)}
            </ul>
          </div>
        </details>
      </div>

      <ol className="mt-5 grid grid-cols-5 gap-2 lg:block lg:space-y-2" aria-label="Browser agent capabilities">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isRunning = activity.action === step.action && activity.status === 'running';
          const completed = rank > step.rank
            || (rank === step.rank && step.rank > 0)
            || (step.rank === 0 && activity.action === step.action && activity.status === 'complete');
          const isNext = !completed && step.rank === Math.min(rank + (rank === 0 ? 0 : 1), 4);
          return (
            <li
              key={step.action}
              className={cn(
                'relative flex min-w-0 flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition-colors duration-causal lg:flex-row lg:justify-start lg:px-2 lg:text-left',
                isRunning && 'bg-info-surface',
                completed && 'text-info-dark',
                !completed && !isRunning && 'text-text-tertiary',
              )}
              aria-current={isRunning || isNext ? 'step' : undefined}
            >
              {index < steps.length - 1 ? <span className="absolute left-[calc(50%+15px)] top-5 hidden h-px w-[calc(100%-30px)] bg-neutral-200 sm:block lg:left-5 lg:top-10 lg:h-5 lg:w-px" aria-hidden="true" /> : null}
              <span className={cn(
                'relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border bg-white',
                isRunning ? 'border-info text-info-dark ring-4 ring-info/10' : completed ? 'border-info/35 bg-info-surface' : 'border-neutral-200',
              )}>
                {completed && !isRunning ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
              </span>
              <span className="hidden min-w-0 font-display text-sm font-semibold sm:block">{step.label}</span>
              <span className="sr-only">Step {index + 1}: {step.label}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 min-h-10 rounded-xl bg-neutral-50 px-3 py-2 text-body-sm leading-relaxed text-text-secondary" aria-live="polite">
        {activityMessage(activity)}
      </p>
    </aside>
  );
}
