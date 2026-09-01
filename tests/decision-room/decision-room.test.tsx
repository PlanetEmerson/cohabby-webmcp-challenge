import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { DecisionRoom } from '@/components/decision-room/decision-room';

class BrowserModelContext extends EventTarget implements WebMCP.ModelContext {
  readonly active = new Set<string>();
  readonly tools = new Map<string, WebMCP.ModelContextTool>();
  ontoolchange: ((this: WebMCP.ModelContext, ev: Event) => unknown) | null = null;

  async registerTool(tool: WebMCP.ModelContextTool, options?: WebMCP.ModelContextRegisterToolOptions) {
    if (this.active.has(tool.name)) throw new DOMException('duplicate', 'InvalidStateError');
    this.active.add(tool.name);
    this.tools.set(tool.name, tool);
    options?.signal?.addEventListener('abort', () => {
      this.active.delete(tool.name);
      this.tools.delete(tool.name);
    }, { once: true });
  }

  async getTools(): Promise<WebMCP.RegisteredTool[]> {
    return [];
  }
}

afterEach(() => {
  Reflect.deleteProperty(document, 'modelContext');
});

describe('Living Decision Room human experience', () => {
  it('registers one strict-mode-safe five-tool generation and cleans it up on unmount', async () => {
    const context = new BrowserModelContext();
    Object.defineProperty(document, 'modelContext', { configurable: true, value: context });
    const view = render(<StrictMode><DecisionRoom sourceRevision="test123" /></StrictMode>);

    expect(await screen.findByText('Site tools ready')).toBeInTheDocument();
    expect(context.active.size).toBe(5);
    view.unmount();
    expect(context.active.size).toBe(0);
  });

  it('keeps the complete decision path available when WebMCP is unsupported', async () => {
    const user = userEvent.setup();
    render(<DecisionRoom sourceRevision="test123" />);

    expect(screen.getByRole('heading', { name: 'Tell CoHabby how you want to live.' })).toBeInTheDocument();
    const matchboard = screen.getByRole('region', { name: 'Living Matchboard' });
    const agentHeading = screen.getByRole('heading', { name: 'Your browser agent' });
    expect(matchboard).toHaveAttribute('data-visual-stage', 'ready');
    expect(matchboard.compareDocumentPosition(agentHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try a New York example' })).toBeInTheDocument();
    expect(await screen.findByText('Site tools are not available here. You can still use the full demo on this page.')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Site tools status' })).toHaveTextContent('Site tools unavailable');

    await user.click(screen.getByRole('button', { name: 'Try a New York example' }));
    expect(screen.getByRole('region', { name: 'Review living brief' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Living Matchboard' })).toHaveAttribute('data-visual-stage', 'brief');
    expect(document.querySelectorAll('[data-human-action]')).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Market' })).toHaveValue('New York');
    expect(screen.queryByText('Quiet room with sunny shared space')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Use this brief' }));
    expect(screen.getByText('Brief approved by you')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-human-action]')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Find compatible rooms' }));
    expect(await screen.findByText('Quiet room with sunny shared space')).toBeInTheDocument();
    expect(screen.getByText('Calm room with clear shared-home rules')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Compare Quiet room with sunny shared space' }));
    await user.click(screen.getByRole('checkbox', { name: 'Compare Calm room with clear shared-home rules' }));
    await user.click(screen.getByRole('button', { name: 'Compare 2 rooms' }));
    const comparison = screen.getByRole('region', { name: 'Room comparison' });
    expect(within(comparison).getByRole('table', { name: 'Room comparison details' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Prepare introduction' }));
    expect(screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Introduction draft' }).value)
      .toContain('Quiet room with sunny shared space');
    const chosenRoom = screen.getByRole('region', { name: 'Chosen room' });
    expect(within(chosenRoom).getByText('Quiet room with sunny shared space')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-human-action]')).toHaveLength(1);
    expect(screen.queryByText('Demo confirmed. No real message was sent.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirm demo introduction' }));
    expect(screen.getByText('Demo confirmed. No real message was sent.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset demo' }));
    await waitFor(() => expect(screen.getByRole('region', { name: 'Living Matchboard' })).toHaveAttribute('data-visual-stage', 'ready'));
    expect(screen.getByText('Start with the six cards above.')).toBeInTheDocument();
    expect(screen.queryByText('Quiet room with sunny shared space')).not.toBeInTheDocument();
  });

  it('shows browser-agent tool activity on the shared page', async () => {
    const context = new BrowserModelContext();
    Object.defineProperty(document, 'modelContext', { configurable: true, value: context });
    render(<DecisionRoom sourceRevision="test123" />);

    expect(await screen.findByText('Site tools ready')).toBeInTheDocument();
    await act(async () => {
      await context.tools.get('get_living_context')!.execute({}, {
        signal: new AbortController().signal,
      });
    });
    expect(screen.getByText('Agent read the visible room.')).toBeInTheDocument();

    await act(async () => {
      await context.tools.get('stage_living_brief')!.execute({
        market: 'New York',
        currency: 'USD',
        maxMonthlyBudget: 1900,
        moveWindow: 'within_30_days',
        homeType: 'room_in_shared_home',
        pets: 'cat',
        smoking: 'no_smoking',
        quietTime: 'early_evenings',
      }, { signal: new AbortController().signal });
    });
    expect(screen.getByText('Brief ready for your review.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Living Matchboard' })).toHaveAttribute('data-visual-stage', 'brief');
  });
});
