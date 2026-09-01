'use client';

import Image from 'next/image';
import {
  BadgeDollarSign,
  CalendarClock,
  Cat,
  CigaretteOff,
  House,
  MapPin,
  Sprout,
} from 'lucide-react';
import { m } from 'motion/react';
import { useId } from 'react';

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
  const gradientId = `synergy-${useId().replace(/:/g, '')}`;
  const dimensions = size === 'sm' ? 'h-24 w-24' : size === 'lg' ? 'h-40 w-40' : 'h-28 w-28';
  const scoreSize = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-5xl' : 'text-3xl';
  const labelSize = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[10px]' : 'text-[8px]';
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference * (1 - synergy.score / 100);
  const evidenceDots = 30;
  const filledDots = Math.round((synergy.evidencePercent / 100) * evidenceDots);
  return (
    <div
      role="img"
      aria-label={`Synthetic Synergy Score ${synergy.score} out of 100, ${displayLabel(synergy.readLabel)}, ${synergy.evidencePercent} percent demo evidence`}
      data-synergy-size={size}
      className={cn('relative grid shrink-0 place-items-center rounded-full bg-white shadow-[0_8px_24px_rgba(79,54,42,0.12)]', dimensions)}
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="16" y1="20" x2="104" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F26B5B" />
            <stop offset="0.48" stopColor="#F4C95D" />
            <stop offset="1" stopColor="#008F83" />
          </linearGradient>
        </defs>
        {Array.from({ length: evidenceDots }, (_, index) => {
          const angle = (index / evidenceDots) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle
              key={index}
              cx={60 + Math.cos(angle) * 54}
              cy={60 + Math.sin(angle) * 54}
              r={index < filledDots ? 1.35 : 1}
              fill={index < filledDots ? '#008F83' : '#E7D9CF'}
              opacity={index < filledDots ? 0.82 : 0.55}
            />
          );
        })}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#F0E4DB" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={scoreOffset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span className="relative flex flex-col items-center justify-center leading-none">
        <Sprout className={cn('mb-0.5 text-info-dark', size === 'sm' ? 'h-2.5 w-2.5' : size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5')} aria-hidden="true" />
        <span className={cn('font-display font-bold leading-none tabular-nums text-text-primary', scoreSize)}>{synergy.score}</span>
        <span data-synergy-label className={cn('mt-1 font-display font-bold uppercase leading-none tracking-[0.12em] text-info-dark', labelSize)}>Synergy</span>
      </span>
    </div>
  );
}
