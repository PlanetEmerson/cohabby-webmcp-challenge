'use client';

import {
  BadgeDollarSign,
  CalendarClock,
  Cat,
  Check,
  CigaretteOff,
  Clock3,
  DoorOpen,
  Home,
  MapPin,
  MoonStar,
  PawPrint,
} from 'lucide-react';
import { m } from 'motion/react';
import { useId } from 'react';

import { Chip } from '@/components/ui/chip';
import type { ComparisonBoard, DecisionRoomState, SafeRoomSummary } from '@/lib/decision-room/types';
import type { StageLivingBriefInput } from '@/lib/webmcp/tool-contracts';
import { cn } from '@/lib/utils/cn';

const optionLabels: Record<string, string> = {
  now: 'Now',
  within_30_days: 'Within 30 days',
  within_60_days: 'Within 60 days',
  flexible: 'Flexible',
  room_in_shared_home: 'Shared home',
  entire_place: 'Entire place',
  either: 'Either',
  none: 'No pets',
  cat: 'Cat',
  dog: 'Dog',
  other: 'Other pet',
  no_smoking: 'Smoke-free',
  outdoor_only: 'Outdoor only',
  early_evenings: 'Quiet evenings',
  late_evenings: 'Later evenings',
  strong: 'Strong fit',
  good: 'Good fit',
  possible: 'Possible fit',
  strong_read: 'Strong read',
  good_read: 'Good read',
  early_read: 'Early read',
};

export function label(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'Not set';
  if (typeof value === 'number') return String(value);
  return optionLabels[String(value)] ?? String(value);
}

export function money(room: SafeRoomSummary): string {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: room.currency,
    maximumFractionDigits: 0,
  }).format(room.monthlyPrice);
}

export function BrandDoorwayMark({ className }: { className?: string }) {
  const gradientId = `cohabby-doorway-${useId().replaceAll(':', '')}`;
  return (
    <svg className={className} viewBox="0 0 48 48" role="img" aria-label="CoHabby doorway mark">
      <defs>
        <linearGradient id={gradientId} x1="7" y1="8" x2="42" y2="41" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B4A" />
          <stop offset="0.52" stopColor="#F4C95D" />
          <stop offset="1" stopColor="#00A699" />
        </linearGradient>
      </defs>
      <path d="M6 23.5 24 8l18 15.5v16a2.5 2.5 0 0 1-2.5 2.5h-31A2.5 2.5 0 0 1 6 39.5z" fill="#FFFCFA" stroke={`url(#${gradientId})`} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M13 40V28.5a6.5 6.5 0 0 1 13 0V40M22 40V28.5a6.5 6.5 0 0 1 13 0V40" fill="none" stroke={`url(#${gradientId})`} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

const sampleTokens = [
  { label: 'New York', icon: MapPin, color: 'info' },
  { label: '$1,900 max', icon: BadgeDollarSign, color: 'primary' },
  { label: '30 days', icon: CalendarClock, color: 'gold' },
  { label: 'Cat', icon: Cat, color: 'success' },
  { label: 'Quiet', icon: MoonStar, color: 'accent' },
  { label: 'Smoke-free', icon: CigaretteOff, color: 'info' },
] as const;

const tokenClasses = {
  primary: 'border-primary/25 bg-primary-surface text-primary-ink',
  info: 'border-info/25 bg-info-surface text-info-dark',
  success: 'border-success/25 bg-success-surface text-success-dark',
  accent: 'border-accent/25 bg-accent-surface text-accent-dark',
  gold: 'border-gold/35 bg-gold-surface text-gold-dark',
} as const;

export function SampleLivingTokens() {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="New York example living needs">
      {sampleTokens.map((token, index) => {
        const Icon = token.icon;
        return (
          <m.li
            key={token.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.24, ease: 'easeOut' }}
            className={cn('flex min-h-14 items-center gap-2 rounded-2xl border px-3 py-2 shadow-[0_1px_0_rgba(43,31,25,0.04)] sm:flex-col sm:justify-center sm:text-center', tokenClasses[token.color])}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="font-display text-xs font-semibold leading-tight sm:text-sm">{token.label}</span>
          </m.li>
        );
      })}
    </ul>
  );
}

function budgetLabel(brief: StageLivingBriefInput): string | null {
  if (!brief.maxMonthlyBudget) return null;
  return `${brief.currency ?? ''} ${brief.maxMonthlyBudget.toLocaleString()} max`.trim();
}

export function BriefTokenSummary({ brief }: { brief: StageLivingBriefInput }) {
  const tokens = [
    { key: 'market', value: brief.market, icon: MapPin },
    { key: 'budget', value: budgetLabel(brief), icon: BadgeDollarSign },
    { key: 'move', value: brief.moveWindow ? label(brief.moveWindow) : null, icon: CalendarClock },
    { key: 'pets', value: brief.pets ? label(brief.pets) : null, icon: PawPrint },
    { key: 'quiet', value: brief.quietTime ? label(brief.quietTime) : null, icon: MoonStar },
    { key: 'smoking', value: brief.smoking ? label(brief.smoking) : null, icon: CigaretteOff },
  ].filter((token): token is { key: string; value: string; icon: typeof MapPin } => Boolean(token.value));

  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((token, index) => {
        const Icon = token.icon;
        return (
          <m.span
            layout
            key={token.key}
            initial={{ opacity: 0, y: -10, rotate: index % 2 ? 1 : -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: index * 0.035, duration: 0.28 }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-info/25 bg-info-surface px-3 py-1.5 text-body-sm font-semibold text-info-dark"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {token.value}
          </m.span>
        );
      })}
    </div>
  );
}

export function LivingBriefTray({ state }: { state: DecisionRoomState }) {
  const brief = state.stagedBrief?.values ?? state.appliedBrief;
  const approved = Boolean(state.appliedBrief);
  return (
    <m.section layout className={cn(
      'relative overflow-hidden rounded-[1.35rem] border bg-neutral-0 p-4 shadow-card sm:p-5',
      approved ? 'border-success/30' : state.stagedBrief ? 'border-primary/30' : 'border-neutral-200',
    )} aria-label="Living brief">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn('grid h-9 w-9 place-items-center rounded-xl', approved ? 'bg-success-surface text-success-dark' : 'bg-primary-surface text-primary-ink')}>
            {approved ? <Check className="h-4 w-4" aria-hidden="true" /> : <Home className="h-4 w-4" aria-hidden="true" />}
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-text-primary">Living brief</p>
            <p className="text-body-sm text-text-tertiary">{approved ? 'Brief approved by you' : state.stagedBrief ? 'Waiting for your review' : 'Nothing applied yet'}</p>
          </div>
        </div>
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', approved ? 'bg-success-surface text-success-dark' : 'bg-neutral-100 text-text-tertiary')}>
          {approved ? 'Locked in' : 'Open'}
        </span>
      </div>
      <div className="mt-4 min-h-20">
        {brief ? <BriefTokenSummary brief={brief} /> : (
          <div className="flex min-h-20 items-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-body-md text-text-secondary">
            <DoorOpen className="h-6 w-6 shrink-0 text-primary-ink" aria-hidden="true" />
            <span>Start with the six cards above.</span>
          </div>
        )}
      </div>
    </m.section>
  );
}

function RoomGlyph({ roomRef }: { roomRef: string }) {
  const variant = roomRef.split('_').at(-1) ?? 'room';
  const sun = variant.length % 2 === 1;
  return (
    <svg viewBox="0 0 180 92" className="h-24 w-full" aria-hidden="true">
      <rect x="12" y="10" width="156" height="72" rx="18" fill="#F5EBE4" />
      {sun ? <circle cx="139" cy="30" r="12" fill="#F4C95D" opacity="0.85" /> : <path d="M133 20a15 15 0 1 0 17 22 18 18 0 1 1-17-22Z" fill="#00A699" opacity="0.25" />}
      <path d="M45 48 90 18l45 30v28H45Z" fill="#FFFCFA" stroke="#00A699" strokeWidth="3" strokeLinejoin="round" />
      <path d="M79 76V53h22v23M57 49v27M123 49v27" fill="none" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round" />
      <rect x="54" y="54" width="14" height="12" rx="3" fill="#E3F4F1" stroke="#00756B" strokeWidth="2" />
      <rect x="112" y="54" width="14" height="12" rx="3" fill="#FFEFE9" stroke="#C2401F" strokeWidth="2" />
    </svg>
  );
}

export function RoomCard({
  room,
  checked,
  disabled,
  onToggle,
  compact = false,
  selectable = true,
}: {
  room: SafeRoomSummary;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  compact?: boolean;
  selectable?: boolean;
}) {
  const bandColor = room.fitBand === 'strong' ? 'success' : room.fitBand === 'good' ? 'info' : 'accent';
  return (
    <m.article
      layout
      layoutId={`room-card-${room.roomRef}`}
      initial={{ opacity: 0, y: 24, rotate: 1.5 }}
      animate={{ opacity: 1, y: checked ? -4 : 0, rotate: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      className={cn(
        'group relative min-w-0 overflow-hidden rounded-[1.35rem] border bg-white shadow-card',
        checked ? 'border-info ring-4 ring-info/10' : 'border-neutral-200',
      )}
    >
      <div className="border-b border-neutral-100 bg-neutral-50 px-4 pt-3">
        <RoomGlyph roomRef={room.roomRef} />
      </div>
      <div className={cn('p-4', compact && 'sm:p-3')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Chip color={bandColor}>{label(room.fitBand)}</Chip>
            <h3 className="mt-2 font-display text-lg font-semibold leading-tight text-text-primary">{room.headline}</h3>
          </div>
          {selectable ? (
            <label className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-full border border-neutral-200 bg-neutral-0 transition-colors hover:bg-info-surface">
              <span className="sr-only">Compare {room.headline}</span>
              <input type="checkbox" checked={checked} disabled={disabled && !checked} onChange={onToggle} className="h-5 w-5 rounded border-neutral-300 text-info focus:ring-info" />
            </label>
          ) : <Chip color="primary">Chosen</Chip>}
        </div>
        <div className="mt-3 flex items-end justify-between gap-3 border-y border-neutral-100 py-3">
          <span className="font-display text-2xl font-bold text-text-primary">{money(room)}</span>
          <span className="pb-0.5 text-body-sm text-text-tertiary">monthly</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.reasonLabels.slice(0, compact ? 2 : 3).map((reason) => <Chip key={reason} color="info">{reason}</Chip>)}
        </div>
      </div>
    </m.article>
  );
}

export function EmptyRoomSlots() {
  return (
    <div className="grid gap-3 sm:grid-cols-3" aria-label="Empty room card slots">
      {[1, 2, 3].map((number) => (
        <div key={number} className="grid min-h-56 place-items-center rounded-[1.35rem] border border-dashed border-neutral-300 bg-neutral-0/75 p-4 text-center">
          <div>
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-info-surface font-display font-bold text-info-dark">{number}</span>
            <p className="mt-3 font-display text-sm font-semibold text-text-secondary">Room card lands here</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function reasonFor(room: SafeRoomSummary, code: 'quiet_time_fit' | 'house_rules_fit', fallback: string): string {
  const index = room.reasonCodes.indexOf(code);
  return index >= 0 ? room.reasonLabels[index] ?? fallback : fallback;
}

export function ComparisonStage({
  rooms,
  dimensions,
}: {
  rooms: ReadonlyArray<SafeRoomSummary>;
  dimensions: ComparisonBoard['dimensions'];
}) {
  const rowByDimension = {
    synergy_read: { label: 'Synthetic Synergy', icon: Check, read: (room: SafeRoomSummary) => `${room.synergy.score} · ${label(room.synergy.readLabel)}` },
    budget: { label: 'Monthly price', icon: BadgeDollarSign, read: (room: SafeRoomSummary) => money(room) },
    move_timing: { label: 'Move timing', icon: Clock3, read: (room: SafeRoomSummary) => label(room.availableWindow) },
    home_rhythm: { label: 'Home rhythm', icon: MoonStar, read: (room: SafeRoomSummary) => reasonFor(room, 'quiet_time_fit', 'No matching rhythm listed') },
    house_rules: { label: 'House rules', icon: DoorOpen, read: (room: SafeRoomSummary) => reasonFor(room, 'house_rules_fit', 'Review the visible rules') },
    practical_fit: { label: 'Practical fit', icon: Check, read: (room: SafeRoomSummary) => label(room.fitBand) },
  } as const;
  const rows = dimensions.map((dimension) => rowByDimension[dimension]);
  return (
    <m.section layout role="region" aria-label="Room comparison" className="overflow-hidden rounded-[1.35rem] border border-accent/30 bg-neutral-0 shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-accent/15 bg-accent-surface px-4 py-3 sm:px-5">
        <div>
          <p className="font-display text-sm font-semibold text-accent-dark">Decision line</p>
          <h3 className="font-display text-h4 font-semibold text-text-primary">The same facts, side by side</h3>
        </div>
        <Chip color="accent">{rooms.length} rooms</Chip>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left" aria-label="Room comparison details">
          <colgroup>
            <col className="w-[150px]" />
            {rooms.map((room) => <col key={room.roomRef} />)}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="border-b border-r border-neutral-100 bg-neutral-50 p-4 text-body-sm font-semibold text-text-tertiary">Practical detail</th>
              {rooms.map((room) => <th key={room.roomRef} scope="col" className="border-b border-neutral-100 p-4 font-display text-sm font-semibold text-text-primary">{room.headline}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <tr key={row.label}>
                  <th scope="row" className="border-r border-t border-neutral-100 bg-neutral-50 p-4 text-body-sm font-medium text-text-secondary">
                    <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-info-dark" aria-hidden="true" />{row.label}</span>
                  </th>
                  {rooms.map((room) => <td key={room.roomRef} className="border-t border-neutral-100 p-4 text-body-md font-semibold text-text-primary">{row.read(room)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </m.section>
  );
}
