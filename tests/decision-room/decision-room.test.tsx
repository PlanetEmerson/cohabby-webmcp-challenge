import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { DecisionRoom } from '@/components/decision-room/decision-room';

describe('Living Decision Room human experience', () => {
  it('keeps the complete decision path available when WebMCP is unsupported', async () => {
    const user = userEvent.setup();
    render(<DecisionRoom sourceRevision="test123" />);

    expect(screen.getByRole('heading', { name: 'Living Decision Room' })).toBeInTheDocument();
    expect(await screen.findByText('Site tools are not available here. You can still use the full demo on this page.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Load sample brief' }));
    expect(screen.getByRole('region', { name: 'Review living brief' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Market' })).toHaveValue('New York');
    expect(screen.queryByText('Quiet room with sunny shared space')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Use this brief' }));
    expect(screen.getByText('Brief approved by you')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Find compatible rooms' }));
    expect(await screen.findByText('Quiet room with sunny shared space')).toBeInTheDocument();
    expect(screen.getByText('Calm room with clear shared-home rules')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Compare Quiet room with sunny shared space' }));
    await user.click(screen.getByRole('checkbox', { name: 'Compare Calm room with clear shared-home rules' }));
    await user.click(screen.getByRole('button', { name: 'Compare 2 rooms' }));
    expect(screen.getByRole('region', { name: 'Room comparison' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Prepare introduction' }));
    expect(screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Introduction draft' }).value)
      .toContain('Quiet room with sunny shared space');
    expect(screen.queryByText('Demo confirmed. No real message was sent.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirm demo introduction' }));
    expect(screen.getByText('Demo confirmed. No real message was sent.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset demo' }));
    await waitFor(() => expect(screen.getByText('Your brief will appear here')).toBeInTheDocument());
    expect(screen.queryByText('Quiet room with sunny shared space')).not.toBeInTheDocument();
  });
});
