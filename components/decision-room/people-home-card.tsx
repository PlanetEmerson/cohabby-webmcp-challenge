'use client';

import Image from 'next/image';
import { Check, House, Sparkles } from 'lucide-react';
import { m } from 'motion/react';
import { useId } from 'react';

import { Button } from '@/components/ui/button';
import type { SafeRoomSummary } from '@/lib/decision-room/types';
import { personVisualFor, roomVisualFor } from '@/lib/decision-room/visual-assets';
import { cn } from '@/lib/utils/cn';

import { displayLabel, money, SynergyLens } from './v3-primitives';

export function PeopleHomeCard({
  room,
  checked,
  disabled,
  onToggle,
  onExplain,
}: {
  room: SafeRoomSummary;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  onExplain: () => void;
}) {
  const name = room.housemate.displayName;
  const selectionId = useId();
  return (
    <m.article
      layoutId={`match-${room.roomRef}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'group overflow-hidden rounded-[1.4rem] border bg-white shadow-card transition duration-causal hover:-translate-y-0.5 hover:shadow-elevated',
        checked ? 'border-info ring-2 ring-info/15' : 'border-white/80',
        disabled && !checked && 'opacity-60',
      )}
    >
      <input
        id={selectionId}
        type="checkbox"
        checked={checked}
        disabled={disabled && !checked}
        onChange={onToggle}
        className="sr-only"
        aria-label={`Select ${name} and their home`}
      />
      <div className="relative">
        <label htmlFor={selectionId} className={cn('block cursor-pointer', disabled && !checked && 'cursor-not-allowed')}>
          <span className="relative block aspect-video overflow-hidden bg-neutral-100">
          <Image
            src={roomVisualFor(room.roomRef)}
            alt={`Synthetic demo room matched with ${name}`}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
          <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950/55 to-transparent" aria-hidden="true" />
          <span className="absolute left-4 top-4 h-16 w-16 overflow-hidden rounded-2xl border-[3px] border-white bg-neutral-100 shadow-lg">
            <Image
              src={personVisualFor(room.housemate.personRef)}
              alt={`Synthetic demo portrait of ${name}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </span>
          <span className={cn(
            'absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-white/90 text-text-tertiary shadow-md backdrop-blur',
            checked && 'bg-info text-white',
          )} aria-hidden="true">
            {checked ? <Check className="h-6 w-6" /> : <span className="h-4 w-4 rounded-full border-2 border-current" />}
          </span>
          <span className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 font-display text-xs font-semibold text-text-primary shadow-sm backdrop-blur">
            <House className="h-3.5 w-3.5 text-info-dark" aria-hidden="true" />
            {room.housemate.housingPath === 'has_room' ? 'Has a room' : 'Find a place together'} · {money(room)}
          </span>
          </span>
        </label>
        <Button
          variant="ghost"
          className="absolute bottom-3 right-3 z-10 bg-white/90 px-3 text-info-dark shadow-sm backdrop-blur hover:bg-white"
          onClick={onExplain}
          aria-label={`Why ${name}'s Synergy?`}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Why Synergy?
        </Button>
      </div>
      <label htmlFor={selectionId} className={cn('block cursor-pointer', disabled && !checked && 'cursor-not-allowed')}>
        <span className="block p-3.5">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block font-display text-2xl font-bold leading-none text-text-primary">{name}</span>
              <span className="mt-1 block text-body-sm font-medium text-info-dark">{room.housemate.homeLine}</span>
            </span>
            <SynergyLens synergy={room.synergy} size="sm" />
          </span>
          <span className="mt-3 block border-t border-neutral-100 pt-2.5">
            <span className="block font-display text-base font-semibold leading-snug text-text-primary">{room.headline}</span>
            <span className="mt-2 flex items-center justify-between gap-2 text-body-sm text-text-secondary">
              <strong className="font-display text-xl text-text-primary">{money(room)}</strong>
              <span>{displayLabel(room.availableWindow)}</span>
            </span>
          </span>
          <span className="mt-2.5 flex flex-wrap gap-1.5">
            {room.synergy.reasonLabels.slice(0, 2).map((reason) => (
              <span key={reason} className="rounded-full border border-info/20 bg-info-surface px-2.5 py-1 text-[11px] font-medium leading-tight text-info-dark">{reason}</span>
            ))}
          </span>
        </span>
      </label>
    </m.article>
  );
}
