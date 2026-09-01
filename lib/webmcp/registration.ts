export type RegistrationLease = Readonly<{
  ready: Promise<void>;
  dispose: () => void;
}>;

class WebMcpRegistrationCoordinator {
  private readonly context: WebMCP.ModelContext;
  private queue: Promise<void> = Promise.resolve();
  private current: { id: number; controller: AbortController } | null = null;
  private sequence = 0;

  constructor(context: WebMCP.ModelContext) {
    this.context = context;
  }

  register(tools: ReadonlyArray<WebMCP.ModelContextTool>): RegistrationLease {
    this.current?.controller.abort();
    const controller = new AbortController();
    const id = ++this.sequence;
    this.current = { id, controller };

    const ready = this.queue
      .catch(() => undefined)
      .then(async () => {
        await Promise.resolve();
        if (controller.signal.aborted) return;
        try {
          for (const tool of tools) {
            if (controller.signal.aborted) return;
            await this.context.registerTool(tool, { signal: controller.signal });
          }
        } catch {
          controller.abort();
          if (this.current?.id === id) this.current = null;
          throw new Error('site_tools_registration_failed');
        }
      });
    this.queue = ready.catch(() => undefined);

    return {
      ready,
      dispose: () => {
        if (this.current?.id !== id) return;
        controller.abort();
        this.current = null;
      },
    };
  }
}

const coordinators = new WeakMap<WebMCP.ModelContext, WebMcpRegistrationCoordinator>();

export function getWebMcpRegistrationCoordinator(context: WebMCP.ModelContext) {
  const existing = coordinators.get(context);
  if (existing) return existing;
  const coordinator = new WebMcpRegistrationCoordinator(context);
  coordinators.set(context, coordinator);
  return coordinator;
}
