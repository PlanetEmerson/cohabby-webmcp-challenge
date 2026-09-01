import { describe, expect, it } from 'vitest';

import { createDecisionRoomStore } from '@/lib/decision-room/store';
import {
  getWebMcpRegistrationCoordinator,
  type RegistrationLease,
} from '@/lib/webmcp/registration';
import { createWebMcpTools } from '@/lib/webmcp/tools';

class FakeModelContext extends EventTarget implements WebMCP.ModelContext {
  readonly active = new Set<string>();
  ontoolchange: ((this: WebMCP.ModelContext, ev: Event) => unknown) | null = null;
  failOn: string | null = null;

  async registerTool(tool: WebMCP.ModelContextTool, options?: WebMCP.ModelContextRegisterToolOptions) {
    if (this.failOn === tool.name) throw new DOMException('registration failed', 'NotAllowedError');
    if (this.active.has(tool.name)) throw new DOMException('duplicate', 'InvalidStateError');
    this.active.add(tool.name);
    options?.signal?.addEventListener('abort', () => this.active.delete(tool.name), { once: true });
  }

  async getTools(): Promise<WebMCP.RegisteredTool[]> {
    return [];
  }
}

describe('WebMCP registration lifecycle', () => {
  it('serializes replacement generations and aborts every registration on cleanup', async () => {
    const context = new FakeModelContext();
    const tools = createWebMcpTools(createDecisionRoomStore());
    const coordinator = getWebMcpRegistrationCoordinator(context);

    const first = coordinator.register(tools);
    await first.ready;
    expect([...context.active]).toEqual(tools.map((tool) => tool.name));

    const second = coordinator.register(tools);
    await second.ready;
    expect([...context.active]).toEqual(tools.map((tool) => tool.name));

    first.dispose();
    expect(context.active.size).toBe(6);
    second.dispose();
    expect(context.active.size).toBe(0);
  });

  it('aborts a partial registration set when any tool fails', async () => {
    const context = new FakeModelContext();
    context.failOn = 'compare_shortlist';
    const coordinator = getWebMcpRegistrationCoordinator(context);
    const lease: RegistrationLease = coordinator.register(createWebMcpTools(createDecisionRoomStore()));

    await expect(lease.ready).rejects.toThrow('site_tools_registration_failed');
    expect(context.active.size).toBe(0);
  });
});
