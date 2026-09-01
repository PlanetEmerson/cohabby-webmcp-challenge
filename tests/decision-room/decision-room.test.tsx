import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { DecisionRoom } from '@/components/decision-room/decision-room';

class BrowserModelContext extends EventTarget implements WebMCP.ModelContext {
  readonly active = new Set<string>();
  ontoolchange: ((this: WebMCP.ModelContext, ev: Event) => unknown) | null = null;

  async registerTool(tool: WebMCP.ModelContextTool, options?: WebMCP.ModelContextRegisterToolOptions) {
    if (this.active.has(tool.name)) throw new DOMException('duplicate', 'InvalidStateError');
    this.active.add(tool.name);
    options?.signal?.addEventListener('abort', () => this.active.delete(tool.name), { once: true });
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
