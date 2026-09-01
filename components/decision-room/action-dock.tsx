'use client';

import { ArrowRight, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ActionDock({
  instruction,
  status,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  secondaryLabel,
  onSecondary,
  humanAction,
}: {
  instruction: string;
  status?: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  humanAction?: string;
}) {
  return (
    <div
      className="sticky bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-30 mt-4 flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-elevated backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4"
      data-human-action={humanAction}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-surface text-primary-ink sm:grid">
          <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug text-text-primary sm:text-body-md">{instruction}</p>
          {status ? <p className="mt-0.5 hidden text-body-sm text-text-secondary sm:block" aria-live="polite">{status}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {secondaryLabel && onSecondary ? (
          <Button variant="ghost" onClick={onSecondary}>{secondaryLabel}</Button>
        ) : null}
        <Button
          disabled={primaryDisabled}
          onClick={onPrimary}
          className="min-w-[210px] bg-[linear-gradient(105deg,#C2401F_0%,#B64027_42%,#00756B_100%)] text-white shadow-[0_10px_28px_rgba(0,117,107,0.2)] hover:brightness-105 focus-visible:ring-info max-sm:w-full"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
