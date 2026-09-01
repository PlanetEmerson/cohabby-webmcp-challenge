'use client';

import Image from 'next/image';
import { Check, House, MessageSquareText, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { m } from 'motion/react';

import { Button } from '@/components/ui/button';
import type { DecisionRoomNotice, SafeRoomSummary, StagedIntroduction } from '@/lib/decision-room/types';
import { personVisualFor, roomVisualFor } from '@/lib/decision-room/visual-assets';

import { ActionDock } from './action-dock';
import { displayLabel, money, SynergyLens } from './v3-primitives';

export function IntroductionStage({
  room,
  introduction,
  notice,
  onEdit,
  onConfirm,
}: {
  room: SafeRoomSummary;
  introduction: StagedIntroduction;
  notice: DecisionRoomNotice | null;
  onEdit: (draft: string) => void;
  onConfirm: () => void;
}) {
  const name = room.housemate.displayName;
  return (
    <m.section
      key="introduction"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-auto min-h-[510px] max-w-6xl py-3"
    >
      <div className="mb-5 text-center">
        <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-success-dark">A first roommate hello</p>
        <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">Make the introduction human.</h2>
        <p className="mt-2 text-body-lg text-text-secondary">CoHabby prepared the practical starting point. You control every word and the final confirmation.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <m.section
          layoutId={`match-${room.roomRef}`}
          role="region"
          aria-label={`Chosen match with ${name}`}
          className="overflow-hidden rounded-[1.6rem] bg-white/88 shadow-elevated backdrop-blur"
        >
          <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100">
            <Image src={roomVisualFor(room.roomRef)} alt={`Synthetic demo home context for ${name}`} fill sizes="(max-width: 1023px) 100vw, 40vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-950/75 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3 text-white">
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border-[3px] border-white bg-neutral-100 shadow-md"><Image src={personVisualFor(room.housemate.personRef)} alt={`Synthetic demo portrait of ${name}`} fill sizes="80px" className="object-cover" /></span>
              <span><span className="block font-display text-3xl font-bold leading-none">{name}</span><span className="mt-1 block text-sm text-white/90">Possible roommate</span></span>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-bold text-text-primary">{room.housemate.homeLine}</p>
                <p className="mt-1 text-body-sm text-text-secondary">{room.headline}</p>
                <p className="mt-2 text-body-sm font-medium text-info-dark">{money(room)} monthly · {displayLabel(room.availableWindow)}</p>
              </div>
              <SynergyLens synergy={room.synergy} size="sm" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {room.synergy.reasonLabels.map((reason) => <span key={reason} className="rounded-full border border-info/20 bg-info-surface px-3 py-1.5 text-xs font-medium text-info-dark">{reason}</span>)}
            </div>
          </div>
        </m.section>

        <section className="flex flex-col rounded-[1.6rem] bg-white/90 p-4 shadow-elevated backdrop-blur sm:p-6" aria-label="Review roommate introduction">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success-surface text-success-dark"><MessageSquareText className="h-5 w-5" aria-hidden="true" /></span>
            <div><p className="font-display text-sm font-bold uppercase tracking-[0.14em] text-success-dark">Your words, your decision</p><h3 className="mt-0.5 font-display text-2xl font-bold text-text-primary">Check the roommate note.</h3></div>
          </div>
          <label className="mt-5 flex flex-1 flex-col gap-2 font-display text-sm font-semibold text-text-secondary">
            Introduction draft
            <textarea
              aria-label="Introduction draft"
              value={introduction.draft}
              maxLength={600}
              rows={8}
              onChange={(event) => onEdit(event.target.value)}
              className="min-h-56 w-full flex-1 resize-y rounded-2xl border-neutral-300 bg-neutral-0 text-base leading-relaxed text-text-primary shadow-inner focus:border-info focus:ring-info"
            />
          </label>
          <p className="mt-2 text-right text-xs text-text-tertiary">{introduction.draft.length}/600</p>
          {notice?.kind === 'safety' ? <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-warning-surface px-3 py-2 text-body-sm font-medium text-warning-dark"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{notice.message}</p> : null}
        </section>
      </div>

      <ActionDock
        instruction={`Confirm this demo introduction to ${name}.`}
        status="Nothing is sent, saved, or shared."
        primaryLabel="Confirm demo introduction"
        primaryDisabled={!introduction.isSafeToConfirm}
        onPrimary={onConfirm}
        humanAction="introduction-confirmation"
      />
    </m.section>
  );
}

export function SuccessStage({ receipt, onReset }: { receipt: string; onReset: () => void }) {
  return (
    <m.section
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      role="region"
      aria-label="Demo introduction confirmed"
      className="mx-auto flex min-h-[510px] max-w-4xl flex-col items-center justify-center py-8 text-center"
    >
      <div className="relative grid h-48 w-72 place-items-center" aria-hidden="true">
        <m.div initial={{ x: -70, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="absolute left-3 flex items-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-4 border-white bg-primary-surface text-primary-ink shadow-md"><UserRound className="h-5 w-5" /></span>
          <span className="h-2 w-20 rounded-full bg-primary" />
        </m.div>
        <m.div initial={{ x: 70, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="absolute right-3 flex items-center">
          <span className="h-2 w-20 rounded-full bg-info" />
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-4 border-white bg-info-surface text-info-dark shadow-md"><UserRound className="h-5 w-5" /></span>
        </m.div>
        <m.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25, duration: 0.35 }} className="relative z-10 grid h-20 w-20 place-items-center rounded-[1.35rem] border-4 border-white bg-success-surface text-success-dark shadow-elevated"><House className="h-9 w-9" /></m.span>
        <m.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.45, type: 'spring', stiffness: 280, damping: 18 }} className="absolute right-16 top-4 grid h-10 w-10 place-items-center rounded-full bg-success text-white shadow-md"><Check className="h-5 w-5" /></m.span>
      </div>
      <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-success-dark">Roommate introduction ready</p>
      <h2 className="mt-2 max-w-3xl font-display text-4xl font-bold tracking-[-0.04em] text-text-primary sm:text-5xl">A thoughtful start to living well together.</h2>
      <p className="mt-4 rounded-full border border-success/25 bg-success-surface px-5 py-3 font-display text-base font-semibold text-success-dark">{receipt}</p>
      <p className="mt-4 max-w-xl text-body-md leading-relaxed text-text-secondary">The browser agent organized the decision. You approved the living plan and confirmed the practical roommate hello.</p>
      <Button variant="ghost" size="lg" className="mt-5" onClick={onReset}><Sparkles className="h-4 w-4" aria-hidden="true" />Start another demo</Button>
    </m.section>
  );
}
