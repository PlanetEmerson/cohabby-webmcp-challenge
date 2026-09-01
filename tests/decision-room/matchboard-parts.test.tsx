import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BrandDoorwayMark, ComparisonStage } from '@/components/decision-room/matchboard-parts';
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
    reasonLabels: ['Within the approved budget', 'Shared-home rules support the brief'],
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
    reasonLabels: ['Within the approved budget', 'Shared-home rules support the brief'],
  },
];

describe('Living Matchboard visual primitives', () => {
  it('gives repeated doorway marks unique SVG gradient identifiers', () => {
    const view = render(<><BrandDoorwayMark /><BrandDoorwayMark /></>);
    const ids = Array.from(view.container.querySelectorAll('linearGradient')).map((node) => node.id);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('renders only the comparison dimensions requested by the current board', () => {
    render(<ComparisonStage rooms={rooms} dimensions={['budget', 'house_rules']} />);

    expect(screen.getByRole('rowheader', { name: 'Monthly price' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'House rules' })).toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Move timing' })).not.toBeInTheDocument();
  });
});
