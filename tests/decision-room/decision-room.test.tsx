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
  it('registers one strict-mode-safe six-tool generation and cleans it up on unmount', async () => {
    const context = new BrowserModelContext();
    Object.defineProperty(document, 'modelContext', { configurable: true, value: context });
    const view = render(<StrictMode><DecisionRoom sourceRevision="test123" /></StrictMode>);

    expect(await screen.findByText('Site tools ready')).toBeInTheDocument();
    expect(context.active.size).toBe(6);
    view.unmount();
    expect(context.active.size).toBe(0);
  });

  it('keeps the complete decision path available when WebMCP is unsupported', async () => {
    const user = userEvent.setup();
    render(<DecisionRoom sourceRevision="test123" />);

    expect(screen.getByRole('heading', { name: 'Meet someone you could actually live well with.' })).toBeInTheDocument();
    const stage = screen.getByRole('region', { name: 'People-first decision stage' });
    expect(stage).toHaveAttribute('data-visual-stage', 'ready');
    expect(screen.getByRole('list', { name: 'CoHabby and browser agent steps' }).children).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Start with this demo plan' })).toBeInTheDocument();
    expect(await screen.findByText('Site tools are not available here. You can still use the full demo on this page.')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Site tools status' })).toHaveTextContent('Site tools unavailable');
    const visibleCopy = document.body.cloneNode(true) as HTMLElement;
    visibleCopy.querySelector('[data-exact-tool-disclosure]')?.remove();
    expect(visibleCopy.textContent).not.toMatch(/\bbrief\b/i);
    expect(visibleCopy.textContent).not.toMatch(/dating|romance|chemistry|relationship/i);

    await user.click(screen.getByRole('button', { name: 'Start with this demo plan' }));
    expect(screen.getByRole('region', { name: 'Check your living plan' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'People-first decision stage' })).toHaveAttribute('data-visual-stage', 'brief');
    expect(document.querySelectorAll('[data-human-action]')).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Market' })).toHaveValue('New York');
    expect(screen.queryByText('Quiet room with sunny shared space')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Use these choices' }));
    expect(screen.getByRole('region', { name: 'Ready to find people and homes' })).toBeInTheDocument();
    expect(document.querySelectorAll('[data-human-action]')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Show people and homes' }));
    expect(await screen.findByText('Quiet room with sunny shared space')).toBeInTheDocument();
    expect(screen.getByText('Maya')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Synthetic demo portrait of Maya' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: "Synthetic demo room matched with Maya" })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Select Maya and their home' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Jordan and their home' }));
    await user.click(screen.getByRole('button', { name: "Why Maya's Synergy?" }));
    expect(screen.getByRole('region', { name: 'Synthetic Synergy explanation for Maya' })).toBeInTheDocument();
    expect(screen.getByText('Both prefer quiet mornings')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Compare 2 matches' }));
    const comparison = screen.getByRole('region', { name: 'People and home comparison' });
    expect(within(comparison).getByRole('table', { name: 'People and home comparison details' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Say hello to Maya' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Warm tone' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Write a warm hello to Maya' }));
    expect(screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Introduction draft' }).value)
      .toContain('Hi Maya!');
    const chosenMatch = screen.getByRole('region', { name: 'Chosen match with Maya' });
    expect(within(chosenMatch).getByText('Quiet room with sunny shared space')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-human-action]')).toHaveLength(1);
    expect(screen.queryByText('Demo confirmed. No real message was sent.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirm demo introduction' }));
    expect(screen.getByText('Demo confirmed. No real message was sent.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Demo introduction confirmed' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset demo' }));
    await waitFor(() => expect(screen.getByRole('region', { name: 'People-first decision stage' })).toHaveAttribute('data-visual-stage', 'ready'));
    expect(screen.getByRole('button', { name: 'Start with this demo plan' })).toBeInTheDocument();
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
    expect(screen.getByText('Your living style is visible to the agent.')).toBeInTheDocument();

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
    expect(screen.getByText('Your living plan is ready to check.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'People-first decision stage' })).toHaveAttribute('data-visual-stage', 'brief');
  });
});
