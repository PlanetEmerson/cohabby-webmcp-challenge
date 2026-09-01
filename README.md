# CoHabby Living Decision Room

I built Living Decision Room to test a simple idea: finding a room works better when a person and their browser agent share the same page and the same state.

The agent can read the current brief, stage practical housing needs, ask CoHabby for synthetic room options, compare a shortlist, and prepare an introduction. The person applies the brief and confirms the introduction. No tool can send a message or touch a real listing.

[Open the live app](https://webmcp.cohabby.com)

## Try it

Use the sample prompt in a WebMCP-capable browser:

> Help me find a quiet room in New York under $1,900 a month. I want to move within 30 days, I do not smoke, and I have a cat. Compare the strongest options and prepare a warm introduction to the best one.

The page also has a complete human path. If site tools are unavailable, click **Load sample brief** and continue through the same state machine.

## Five site tools

The top-level page registers five imperative tools with `document.modelContext.registerTool`:

| Tool | What it does |
| --- | --- |
| `get_living_context` | Reads only state already visible on the page. |
| `stage_living_brief` | Creates a visible proposal for human review. |
| `find_compatible_rooms` | Uses the human-approved brief to return synthetic rooms and safe practical reasons. |
| `compare_shortlist` | Builds a board from two or three current room references. |
| `prepare_introduction` | Creates an editable local draft without sending it. |

The schemas are bounded and reject unknown properties. The same validators run inside the callbacks. Ajv compiles them into committed standalone ESM so the production CSP does not need `unsafe-eval`.

## Run locally

Requirements: Node 22 and npm 10 or later.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A normal browser shows the full human flow. To inspect native WebMCP in Chrome 149 or later, enable `chrome://flags/#enable-webmcp-testing` and restart Chrome.

## Verify

```bash
npm run test
npm run type-check
npm run lint
npm run build
npm run audit:prod
```

The app has no backend, login, analytics, cookies, model API, or production connection. All housing records are synthetic and live in `lib/decision-room/living-data-source.ts`.

## Human control and housing safety

The agent can stage, search, compare, and prepare. The person alone can:

- Apply or discard the living brief.
- Edit and confirm the demo introduction.
- Reset the workspace.

CoHabby compares budget, move timing, home type, pets, smoking, quiet time, and shared-home rules. It rejects protected-trait and demographic requests. Tool outputs exclude exact addresses, coordinates, contact details, private IDs, photo URLs, stack traces, and instructions aimed at the agent.

The confirmation receipt says exactly: `Demo confirmed. No real message was sent.`

## Repository map

- `lib/decision-room`: typed state, synthetic data adapter, safe templates, and store actions.
- `lib/webmcp`: public schemas, standalone validators, output safety, tool callbacks, and registration cleanup.
- `components/decision-room`: the shared human and agent workspace.
- `tests`: contracts, transitions, cancellation, registration, security headers, and the full human path.

## Challenge provenance

CoHabby existed before the challenge. Living Decision Room, its five WebMCP tools, synthetic data, comparison board, confirmation flow, and this public repository were created during the WebMCP Challenge submission period. [CHALLENGE_WORK.md](./CHALLENGE_WORK.md) separates that work from the existing product.

The live footer prints the source revision supplied at deployment. The immutable `submission-2026-09-03` tag identifies the judged source.

## License

The challenge code is available under the [MIT License](./LICENSE). The CoHabby name and wordmark remain part of the CoHabby brand and are not licensed for third-party branding.
