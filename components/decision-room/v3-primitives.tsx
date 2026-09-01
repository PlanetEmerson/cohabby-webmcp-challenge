'use client';

import Image from 'next/image';
import {
  BadgeDollarSign,
  CalendarClock,
  Cat,
  CigaretteOff,
  House,
  MapPin,
} from 'lucide-react';
import { m } from 'motion/react';

import type { SafeSynergyRead } from '@/lib/decision-room/types';
import type { StageLivingBriefInput } from '@/lib/webmcp/tool-contracts';
import { cn } from '@/lib/utils/cn';

const optionLabels: Record<string, string> = {
  now: 'Now',
  within_30_days: 'Within 30 days',
  within_60_days: 'Within 60 days',
  flexible: 'Flexible',
  room_in_shared_home: 'Shared home',
  entire_place: 'Full place together',
  either: 'Either',
  none: 'No pets',
  cat: 'Cat',
  dog: 'Dog',
  other: 'Other pet',
  no_smoking: 'Smoke-free',
  outdoor_only: 'Outdoor only',
  early_evenings: 'Quiet evenings',
  late_evenings: 'Later evenings',
  strong: 'Strong practical fit',
  good: 'Good practical fit',
  possible: 'Possible practical fit',
  strong_read: 'Strong read',
  good_read: 'Good read',
  early_read: 'Early read',
};

export function displayLabel(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'Not set';
  return optionLabels[String(value)] ?? String(value);
}

export function money(value: { currency: string; monthlyPrice: number }): string {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: value.currency,
    maximumFractionDigits: 0,
  }).format(value.monthlyPrice);
}

export function CoHabbyBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[22%] border border-neutral-200 bg-white shadow-sm">
        <Image
          src="/assets/brand/cohabby-app-icon.png"
          alt="CoHabby"
          width={122}
          height={120}
          className="h-full w-full object-cover"
          priority
        />
      </span>
      <div>
        <p className="font-display text-lg font-bold tracking-tight text-text-primary">CoHabby</p>
        <p className="text-body-sm text-text-tertiary">Living Decision Room</p>
      </div>
    </div>
  );
}

const tileClasses = [
  'border-info/25 bg-info-surface text-info-dark',
  'border-primary/25 bg-primary-surface text-primary-ink',
  'border-gold/35 bg-gold-surface text-gold-dark',
  'border-success/25 bg-success-surface text-success-dark',
  'border-accent/25 bg-accent-surface text-accent-dark',
  'border-info/25 bg-info-surface text-info-dark',
] as const;

export function LivingPlanTiles({ brief }: { brief: StageLivingBriefInput }) {
  const tiles = [
    { label: brief.market ?? 'New York', icon: MapPin },
    {
      label: brief.maxMonthlyBudget
        ? `${brief.currency ?? 'USD'} ${brief.maxMonthlyBudget.toLocaleString()} max`
        : '$1,900 max',
      icon: BadgeDollarSign,
    },
    { label: displayLabel(brief.moveWindow ?? 'within_30_days'), icon: CalendarClock },
    { label: displayLabel(brief.homeType ?? 'room_in_shared_home'), icon: House },
    { label: displayLabel(brief.pets ?? 'cat'), icon: Cat },
    { label: displayLabel(brief.smoking ?? 'no_smoking'), icon: CigaretteOff },
  ];

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" aria-label="Visible demo living plan">
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <m.li
            layout
            key={`${index}-${tile.label}`}
            className={cn(
              'flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center font-display text-sm font-semibold',
              tileClasses[index],
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{tile.label}</span>
          </m.li>
        );
      })}
    </ul>
  );
}

export function SynergyLens({
  synergy,
  size = 'md',
}: {
  synergy: Pick<SafeSynergyRead, 'score' | 'evidencePercent' | 'readLabel'>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dimensions = size === 'sm' ? 'h-16 w-16' : size === 'lg' ? 'h-36 w-36' : 'h-24 w-24';
  const scoreSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-5xl' : 'text-3xl';
  return (
    <div
      role="img"
      aria-label={`Synthetic Synergy Score ${synergy.score} out of 100, ${displayLabel(synergy.readLabel)}, ${synergy.evidencePercent} percent demo evidence`}
      className={cn('relative grid shrink-0 place-items-center rounded-full bg-white shadow-sm', dimensions)}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#C2401F 0 ${Math.min(synergy.score, 48)}%, #00756B ${Math.min(synergy.score, 48)}% ${synergy.score}%, #EADCD2 ${synergy.score}% 100%)`,
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7px))',
        }}
        aria-hidden="true"
      />
      <span
        className="absolute -inset-1 rounded-full opacity-50"
        style={{
          background: `repeating-conic-gradient(#00756B 0 1.2deg, transparent 1.2deg 8deg)`,
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
        }}
        aria-hidden="true"
      />
      <span className="relative flex flex-col items-center">
        <span className={cn('font-display font-bold leading-none tabular-nums text-text-primary', scoreSize)}>{synergy.score}</span>
        <span className="mt-1 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-info-dark">Synergy</span>
      </span>
    </div>
  );
}
