import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ActionDock } from '@/components/decision-room/action-dock';
import { IntroductionStage } from '@/components/decision-room/connection-stages';
import { ComparisonStage, MatchesStage } from '@/components/decision-room/match-stages';
import { LivingField } from '@/components/decision-room/living-field';
import { PeopleHomeCard } from '@/components/decision-room/people-home-card';
import { SynergyLens } from '@/components/decision-room/v3-primitives';
import type { SafeRoomSummary } from '@/lib/decision-room/types';

const rooms: SafeRoomSummary[] = [
  {
    roomRef: 'room_nyc_cedar',
    headline: 'Quiet room with sunny shared space',
    marketLabel: 'New York',
    monthlyPrice: 1750,
    currency: 'USD',
    availableWindow: 'within_30_days',
    homeType: 'room_in_shared_home',
    fitBand: 'strong',
    reasonCodes: ['budget_fit', 'house_rules_fit'],
    reasonLabels: ['Within the approved budget', 'Shared-home rules support the living plan'],
    housemate: { personRef: 'person_demo_maya', displayName: 'Maya', homeLine: 'Quiet mornings + tidy kitchen', housingPath: 'has_room' },
    synergy: {
      source: 'synthetic_fixture', score: 92, evidencePercent: 88, readLabel: 'strong_read',
      reasonCodes: ['daily_rhythm_fit', 'shared_space_fit', 'household_boundaries_fit'],
      reasonLabels: ['Both prefer quiet mornings', 'Both value tidy shared spaces', 'Clear household boundaries align'],
    },
  },
  {
    roomRef: 'room_nyc_hudson',
    headline: 'Calm room with clear shared-home rules',
    marketLabel: 'New York',
    monthlyPrice: 1890,
    currency: 'USD',
    availableWindow: 'within_30_days',
    homeType: 'room_in_shared_home',
    fitBand: 'strong',
    reasonCodes: ['budget_fit', 'house_rules_fit'],
    reasonLabels: ['Within the approved budget', 'Shared-home rules support the living plan'],
    housemate: { personRef: 'person_demo_jordan', displayName: 'Jordan', homeLine: 'Cat-friendly + clear boundaries', housingPath: 'has_room' },
    synergy: {
      source: 'synthetic_fixture', score: 87, evidencePercent: 82, readLabel: 'strong_read',
      reasonCodes: ['daily_rhythm_fit', 'shared_space_fit', 'household_boundaries_fit'],
      reasonLabels: ['Calm evening rhythms align', 'Both care for shared spaces', 'Guest and pet boundaries are clear'],
    },
  },
];

describe('people-first visual stages', () => {
  it('makes the whole people-and-home card selectable without letting the Synergy action toggle it', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onExplain = vi.fn();
    const view = render(<PeopleHomeCard room={rooms[0]!} checked={false} disabled={false} onToggle={onToggle} onExplain={onExplain} />);

    const card = view.container.querySelector('article');
    expect(card).toHaveAttribute('data-card-selectable', 'true');
    expect(card).toHaveClass('cursor-pointer', 'focus-within:ring-4', 'hover:border-info/55');

    await user.click(screen.getByText('Maya'));
    expect(onToggle).toHaveBeenCalledTimes(1);

    const synergyButton = screen.getByRole('button', { name: "Why Maya's Synergy?" });
    expect(synergyButton).toHaveClass('synergy-shimmer');
    await user.click(synergyButton);
    expect(onExplain).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(1);

    const checkbox = screen.getByRole('checkbox', { name: 'Select Maya and their home' });
    checkbox.focus();
    await user.keyboard('[Space]');
    expect(onToggle).toHaveBeenCalledTimes(2);

    expect(document.querySelector('[data-person-portrait="card"]')).toHaveClass('h-28', 'w-28');
  });

  it('keeps every Synergy score and label legible in a production-style evidence ring', () => {
    const view = render(<><SynergyLens synergy={rooms[0]!.synergy} size="sm" /><SynergyLens synergy={rooms[1]!.synergy} size="sm" /></>);
    const lenses = screen.getAllByRole('img', { name: /Synthetic Synergy Score/u });

    expect(lenses).toHaveLength(2);
    expect(lenses[0]).toHaveAttribute('data-synergy-size', 'sm');
    expect(lenses[0]).toHaveClass('h-24', 'w-24');
    expect(within(lenses[0]!).getByText('92')).toBeVisible();
    expect(within(lenses[0]!).getByText('Synergy')).toBeVisible();
    expect(within(lenses[0]!).getByText('Synergy')).toHaveAttribute('data-synergy-label');
    const gradientIds = Array.from(view.container.querySelectorAll('linearGradient')).map((node) => node.id);
    expect(new Set(gradientIds).size).toBe(2);
  });

  it('renders only the comparison dimensions requested by the current board', () => {
    render(
      <ComparisonStage
        rooms={rooms}
        dimensions={['budget', 'house_rules']}
        introRoomRef="room_nyc_cedar"
        introTone="warm"
        onRoomChange={() => undefined}
        onToneChange={() => undefined}
        onPrepare={() => undefined}
      />,
    );

    expect(screen.getByRole('rowheader', { name: 'Monthly rent' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Household boundaries' })).toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Move timing' })).not.toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Monthly rent' })).toHaveClass('font-bold', 'text-text-primary', 'bg-neutral-50');
    expect(screen.getByRole('table', { name: 'People and home comparison details' })).toHaveAttribute('data-comparison-surface', 'solid');
  });

  it('gives stage headlines a light-backed halo over the living field', () => {
    render(
      <MatchesStage
        rooms={rooms}
        selectedRefs={[]}
        onToggle={() => undefined}
        onExplain={() => undefined}
        onCompare={() => undefined}
      />,
    );

    expect(screen.getByRole('heading', { name: '2 people who may fit your life at home.' })).toHaveClass('stage-copy-halo');
  });

  it('keeps the person visually primary in the introduction stage', () => {
    render(
      <IntroductionStage
        room={rooms[0]!}
        introduction={{
          draftRef: 'introduction_01_01',
          roomRef: rooms[0]!.roomRef,
          tone: 'warm',
          highlightCodes: [],
          draft: 'Hi Maya!',
          isSafeToConfirm: true,
        }}
        notice={null}
        onEdit={() => undefined}
        onConfirm={() => undefined}
      />,
    );

    expect(document.querySelector('[data-person-portrait="introduction"]')).toHaveClass('h-28', 'w-28');
  });

  it('uses the lighter CoHabby logo gradient and stronger dock copy', () => {
    render(<ActionDock instruction="Watch your daily habits turn into roommate matches." status="A guided roommate-matching example." primaryLabel="Try the roommate demo" onPrimary={() => undefined} />);

    expect(screen.getByText('Watch your daily habits turn into roommate matches.')).toHaveClass('font-bold', 'sm:text-lg');
    expect(screen.getByRole('button', { name: 'Try the roommate demo' })).toHaveClass(
      'bg-[linear-gradient(105deg,#FF896E_0%,#F4C95D_48%,#33B8AD_100%)]',
      'text-text-primary',
    );
  });

  it('uses the deterministic static living field when WebGL motion is unavailable', () => {
    const view = render(<LivingField stage="synergy" />);

    expect(view.container.querySelector('[data-living-field="static"]')).toBeInTheDocument();
  });
});
