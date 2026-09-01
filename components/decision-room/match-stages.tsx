'use client';

import Image from 'next/image';
import {
  BadgeDollarSign,
  CalendarClock,
  Check,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { m } from 'motion/react';

import type { SafeRoomSummary } from '@/lib/decision-room/types';
import { personVisualFor, roomVisualFor } from '@/lib/decision-room/visual-assets';
import type { CompareShortlistInput } from '@/lib/webmcp/tool-contracts';
import { cn } from '@/lib/utils/cn';

import { ActionDock } from './action-dock';
import { PeopleHomeCard } from './people-home-card';
import { displayLabel, money, SynergyLens } from './v3-primitives';

export function MatchesStage({
  rooms,
  selectedRefs,
  onToggle,
  onExplain,
  onCompare,
}: {
  rooms: ReadonlyArray<SafeRoomSummary>;
  selectedRefs: ReadonlyArray<string>;
  onToggle: (roomRef: string) => void;
  onExplain: (roomRef: string) => void;
  onCompare: () => void;
}) {
  return (
    <m.section
      key="matches"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      role="region"
      aria-label="People and home matches"
      className="mx-auto min-h-[510px] max-w-7xl py-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-info-dark">People who may live well with you</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">Start with the roommate. See the home in context.</h2>
          <p className="mt-2 hidden text-body-lg text-text-secondary sm:block">Pick two or three people to compare how daily life together could work.</p>
        </div>
        <div className="shrink-0 rounded-full border border-info/25 bg-info-surface px-4 py-2 font-display text-sm font-semibold text-info-dark">{rooms.length} fictional people + homes</div>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-8 grid min-h-72 place-items-center rounded-[1.5rem] bg-white/75 text-center">
          <div><UsersRound className="mx-auto h-10 w-10 text-info-dark" aria-hidden="true" /><h3 className="mt-3 font-display text-2xl font-bold text-text-primary">No demo roommate fits yet</h3><p className="mt-1 text-body-md text-text-secondary">Try a different living plan.</p></div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <PeopleHomeCard
              key={room.roomRef}
              room={room}
              checked={selectedRefs.includes(room.roomRef)}
              disabled={selectedRefs.length >= 3}
              onToggle={() => onToggle(room.roomRef)}
              onExplain={() => onExplain(room.roomRef)}
            />
          ))}
        </div>
      )}

      <ActionDock
        instruction="Choose 2 or 3 possible roommates to compare."
        status={`${selectedRefs.length} ${selectedRefs.length === 1 ? 'person' : 'people'} selected`}
        primaryLabel={`Compare ${selectedRefs.length || 2} matches`}
        primaryDisabled={selectedRefs.length < 2 || selectedRefs.length > 3}
        onPrimary={onCompare}
      />
    </m.section>
  );
}

function CompactChoice({
  room,
  checked,
  disabled,
  focused,
  onToggle,
  onFocus,
}: {
  room: SafeRoomSummary;
  checked: boolean;
  disabled: boolean;
  focused: boolean;
  onToggle: () => void;
  onFocus: () => void;
}) {
  const name = room.housemate.displayName;
  return (
    <div className={cn('rounded-2xl border bg-white/90 p-2 shadow-sm', focused ? 'border-primary/45' : 'border-white/80')}>
      <label className={cn('flex cursor-pointer items-center gap-2', disabled && !checked && 'cursor-not-allowed opacity-55')}>
        <input type="checkbox" checked={checked} disabled={disabled && !checked} onChange={onToggle} aria-label={`Select ${name} and their home`} className="sr-only" />
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          <Image src={personVisualFor(room.housemate.personRef)} alt="" fill sizes="44px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-sm font-bold text-text-primary">{name}</span>
          <span className="block text-xs font-medium text-info-dark">{room.synergy.score} Synergy</span>
        </span>
        <span className={cn('grid h-7 w-7 place-items-center rounded-full border text-text-tertiary', checked && 'border-info bg-info text-white')} aria-hidden="true"><Check className="h-4 w-4" /></span>
      </label>
      {!focused ? <button type="button" onClick={onFocus} className="mt-2 min-h-11 w-full rounded-xl text-xs font-semibold text-primary-ink transition hover:bg-primary-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">View {name}&apos;s Synergy</button> : null}
    </div>
  );
}

export function SynergyExplanationStage({
  room,
  rooms,
  selectedRefs,
  onToggle,
  onExplain,
  onCompare,
  onBack,
}: {
  room: SafeRoomSummary;
  rooms: ReadonlyArray<SafeRoomSummary>;
  selectedRefs: ReadonlyArray<string>;
  onToggle: (roomRef: string) => void;
  onExplain: (roomRef: string) => void;
  onCompare: () => void;
  onBack: () => void;
}) {
  const name = room.housemate.displayName;
  return (
    <m.section
      key={`synergy-${room.roomRef}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.985 }}
      role="region"
      aria-label={`Synthetic Synergy explanation for ${name}`}
      className="mx-auto min-h-[510px] max-w-6xl py-3"
    >
      <div className="grid items-center gap-6 rounded-[1.75rem] bg-white/72 p-4 shadow-elevated backdrop-blur sm:p-6 lg:grid-cols-[0.85fr_auto_1.15fr]">
        <m.div layoutId={`match-${room.roomRef}`} className="relative overflow-hidden rounded-[1.35rem] bg-neutral-100 shadow-card">
          <div className="relative aspect-[3/2]">
            <Image src={roomVisualFor(room.roomRef)} alt={`Synthetic demo room matched with ${name}`} fill sizes="(max-width: 1023px) 100vw, 35vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-950/70 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3 text-white">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-[3px] border-white bg-neutral-100"><Image src={personVisualFor(room.housemate.personRef)} alt={`Synthetic demo portrait of ${name}`} fill sizes="64px" className="object-cover" /></span>
              <span><span className="block font-display text-2xl font-bold">{name}</span><span className="block text-sm text-white/90">{room.housemate.homeLine}</span></span>
            </div>
          </div>
          <div className="p-4"><p className="font-display text-base font-semibold text-text-primary">{room.headline}</p><p className="mt-1 text-body-sm text-text-secondary">{money(room)} monthly · {displayLabel(room.availableWindow)}</p></div>
        </m.div>

        <div className="flex flex-col items-center text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">Synthetic Synergy Lens</p>
          <div className="my-3"><SynergyLens synergy={room.synergy} size="lg" /></div>
          <p className="font-display text-lg font-bold text-text-primary">{displayLabel(room.synergy.readLabel)}</p>
          <p className="mt-1 text-body-sm text-text-secondary">{room.synergy.evidencePercent}% synthetic demo evidence</p>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-info-dark">Why living together may work</p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.03em] text-text-primary">Shared rhythms, made clear.</h2>
          <ul className="mt-5 space-y-3">
            {room.synergy.reasonLabels.map((reason, index) => (
              <li key={reason} className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-sm">
                <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', index === 0 ? 'bg-primary-surface text-primary-ink' : index === 1 ? 'bg-info-surface text-info-dark' : 'bg-gold-surface text-gold-dark')}><Check className="h-5 w-5" aria-hidden="true" /></span>
                <span className="font-display text-base font-semibold text-text-primary">{reason}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 text-body-sm leading-relaxed text-text-secondary"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-dark" aria-hidden="true" />This fixed demo read uses no protected traits and does not use CoHabby&apos;s production scoring model.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3" aria-label="Choose people while viewing Synergy">
        {rooms.map((candidate) => (
          <CompactChoice
            key={candidate.roomRef}
            room={candidate}
            checked={selectedRefs.includes(candidate.roomRef)}
            disabled={selectedRefs.length >= 3}
            focused={candidate.roomRef === room.roomRef}
            onToggle={() => onToggle(candidate.roomRef)}
            onFocus={() => onExplain(candidate.roomRef)}
          />
        ))}
      </div>

      <ActionDock
        instruction="Keep 2 or 3 people for a side-by-side roommate comparison."
        status={`${selectedRefs.length} ${selectedRefs.length === 1 ? 'person' : 'people'} selected`}
        primaryLabel={`Compare ${selectedRefs.length || 2} matches`}
        primaryDisabled={selectedRefs.length < 2 || selectedRefs.length > 3}
        onPrimary={onCompare}
        secondaryLabel="See all people + homes"
        onSecondary={onBack}
      />
    </m.section>
  );
}

function comparisonValue(room: SafeRoomSummary, dimension: NonNullable<CompareShortlistInput['dimensions']>[number]): string {
  switch (dimension) {
    case 'synergy_read': return `${room.synergy.score} · ${displayLabel(room.synergy.readLabel)}`;
    case 'budget': return money(room);
    case 'move_timing': return displayLabel(room.availableWindow);
    case 'home_rhythm': return room.housemate.homeLine;
    case 'house_rules': return room.synergy.reasonLabels[2] ?? 'Review household boundaries';
    case 'practical_fit': return displayLabel(room.fitBand);
  }
}

const dimensionLabels: Record<NonNullable<CompareShortlistInput['dimensions']>[number], { label: string; icon: typeof Sparkles }> = {
  synergy_read: { label: 'Synthetic Synergy', icon: Sparkles },
  budget: { label: 'Monthly rent', icon: BadgeDollarSign },
  move_timing: { label: 'Move timing', icon: CalendarClock },
  home_rhythm: { label: 'Daily rhythm', icon: UsersRound },
  house_rules: { label: 'Household boundaries', icon: ShieldCheck },
  practical_fit: { label: 'Practical fit', icon: Check },
};

export function ComparisonStage({
  rooms,
  dimensions,
  introRoomRef,
  introTone,
  onRoomChange,
  onToneChange,
  onPrepare,
}: {
  rooms: ReadonlyArray<SafeRoomSummary>;
  dimensions: NonNullable<CompareShortlistInput['dimensions']>;
  introRoomRef: string;
  introTone: 'warm' | 'direct' | 'casual';
  onRoomChange: (roomRef: string) => void;
  onToneChange: (tone: 'warm' | 'direct' | 'casual') => void;
  onPrepare: () => void;
}) {
  const person = rooms.find((room) => room.roomRef === introRoomRef)?.housemate.displayName ?? rooms[0]?.housemate.displayName ?? 'this roommate';
  return (
    <m.section
      key="comparison"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      role="region"
      aria-label="People and home comparison"
      className="mx-auto min-h-[510px] max-w-7xl py-3"
    >
      <div>
        <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-info-dark">Compare life together</p>
        <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.03em] text-text-primary sm:text-4xl">The people and household rhythms, side by side.</h2>
      </div>

      <div className="mt-4 grid gap-3 rounded-[1.35rem] bg-white/62 p-3 backdrop-blur lg:grid-cols-[1.25fr_0.75fr]">
        <fieldset>
          <legend className="font-display text-sm font-bold text-text-primary">Choose the roommate you want to greet</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => {
              const checked = introRoomRef === room.roomRef;
              return (
                <label key={room.roomRef} className={cn('flex min-h-16 cursor-pointer items-center gap-2 rounded-xl border bg-white/90 p-2 shadow-sm transition duration-causal', checked ? 'border-info ring-2 ring-info/15' : 'border-white/80 hover:border-info/30')}>
                  <input type="radio" name="intro-person" value={room.roomRef} checked={checked} onChange={() => onRoomChange(room.roomRef)} aria-label={`Say hello to ${room.housemate.displayName}`} className="sr-only" />
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100"><Image src={personVisualFor(room.housemate.personRef)} alt="" fill sizes="40px" className="object-cover" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-display text-sm font-bold text-text-primary">{room.housemate.displayName}</span><span className="block text-[11px] text-info-dark">{room.synergy.score} Synergy</span></span>
                  <span className={cn('grid h-6 w-6 place-items-center rounded-full border', checked ? 'border-info bg-info text-white' : 'border-neutral-300 text-transparent')}><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-sm font-bold text-text-primary">Choose a practical tone</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(['warm', 'direct', 'casual'] as const).map((tone) => (
              <label key={tone} className={cn('grid min-h-16 cursor-pointer place-items-center rounded-xl border bg-white/90 p-2 text-center font-display text-sm font-bold capitalize shadow-sm transition duration-causal', introTone === tone ? 'border-primary bg-primary-surface text-primary-ink ring-2 ring-primary/10' : 'border-white/80 text-text-secondary hover:border-primary/30')}>
                <input type="radio" name="intro-tone" value={tone} checked={introTone === tone} onChange={() => onToneChange(tone)} aria-label={`${tone[0]?.toUpperCase()}${tone.slice(1)} tone`} className="sr-only" />
                {tone}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-3 overflow-x-auto rounded-[1.5rem] bg-white/84 shadow-elevated backdrop-blur">
        <table className="min-w-[760px] w-full border-collapse text-left" aria-label="People and home comparison details">
          <thead>
            <tr>
              <th className="w-44 border-b border-r border-neutral-200 bg-neutral-50/80 p-3 font-display text-sm font-semibold text-text-secondary">How life may fit</th>
              {rooms.map((room) => (
                <th key={room.roomRef} className="border-b border-neutral-200 p-3 align-top">
                  <div className="flex items-center gap-2.5">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100"><Image src={personVisualFor(room.housemate.personRef)} alt={`Synthetic demo portrait of ${room.housemate.displayName}`} fill sizes="48px" className="object-cover" /></span>
                    <span><span className="block font-display text-xl font-bold text-text-primary">{room.housemate.displayName}</span><span className="block text-xs font-medium text-info-dark">{room.synergy.score} synthetic Synergy</span></span>
                    <span className="relative ml-auto hidden h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:block"><Image src={roomVisualFor(room.roomRef)} alt={`Synthetic demo home context for ${room.housemate.displayName}`} fill sizes="80px" className="object-cover" /></span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dimension) => {
              const meta = dimensionLabels[dimension];
              const Icon = meta.icon;
              return (
                <tr key={dimension}>
                  <th scope="row" className="border-r border-t border-neutral-200 bg-neutral-50/65 p-3 font-display text-sm font-semibold text-text-secondary"><span className="flex items-center gap-2"><Icon className="h-4 w-4 text-info-dark" aria-hidden="true" />{meta.label}</span></th>
                  {rooms.map((room) => <td key={room.roomRef} className="border-t border-neutral-200 p-3 text-body-md font-medium text-text-primary">{comparisonValue(room, dimension)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ActionDock
        instruction={`Prepare a practical roommate introduction to ${person}.`}
        status="You will review and confirm it before the demo is complete."
        primaryLabel={`Write a ${introTone} hello to ${person}`}
        primaryDisabled={!introRoomRef}
        onPrimary={onPrepare}
      />
    </m.section>
  );
}
