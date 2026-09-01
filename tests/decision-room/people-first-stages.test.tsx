import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ComparisonStage } from '@/components/decision-room/match-stages';
import { LivingField } from '@/components/decision-room/living-field';
import { PeopleHomeCard } from '@/components/decision-room/people-home-card';
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
    render(<PeopleHomeCard room={rooms[0]!} checked={false} disabled={false} onToggle={onToggle} onExplain={onExplain} />);

    await user.click(screen.getByText('Maya'));
    expect(onToggle).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: "Why Maya's Synergy?" }));
    expect(onExplain).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledTimes(1);

    const checkbox = screen.getByRole('checkbox', { name: 'Select Maya and their home' });
    checkbox.focus();
    await user.keyboard('[Space]');
    expect(onToggle).toHaveBeenCalledTimes(2);
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
  });

  it('uses the deterministic static living field when WebGL motion is unavailable', () => {
    const view = render(<LivingField stage="synergy" />);

    expect(view.container.querySelector('[data-living-field="static"]')).toBeInTheDocument();
  });
});
