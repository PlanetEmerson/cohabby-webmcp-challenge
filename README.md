# CoHabby Living Decision Room

I built Living Decision Room to show what WebMCP can do for a decision that starts with people. A browser agent can understand how someone wants to live, bring fictional roommates and homes onto the page, explain a fixed synthetic Synergy read, compare daily life side by side, and prepare a practical first hello.

The person keeps the two decisions that matter. They approve the living plan and confirm the introduction.

[Open the live app](https://webmcp.cohabby.com)

## Try the six-tool path

Use this prompt in a WebMCP-capable browser:

> Help me find a compatible roommate in New York. My budget is $1,900 a month, I want to move within 30 days, I have a cat, and I value quiet evenings and a smoke-free home. Explain the strongest synthetic Synergy read, compare the top two people and homes, then prepare a warm roommate introduction.

The same complete path works without WebMCP. Try the roommate demo, approve the choices, meet the fictional roommates, open the Synergy Lens, compare two people, review the hello, and confirm the simulation.

## Six site tools

The top-level page registers six imperative tools with `document.modelContext.registerTool`:

| Tool | Visible purpose |
| --- | --- |
| `get_living_context` | Reads the living style and state already visible on the page. |
| `stage_living_brief` | Stages practical must-haves for the person to review. The fixed technical name keeps `brief`; the human interface says “living plan.” |
| `find_compatible_rooms` | Adds current fictional people and home context after human approval. |
| `explain_synergy_match` | Opens one bounded synthetic Synergy explanation. It explains a fixture; it never calculates a score. |
| `compare_shortlist` | Compares two or three current roommate possibilities. |
| `prepare_introduction` | Prepares an editable local roommate note without sending it. |

Inputs use strict bounded schemas with `additionalProperties: false`. The callbacks reject non-plain values, revalidate with committed standalone Ajv validators, enforce the current state and result generation, and pass every result through an exact output schema plus a second safety inspection.

Every mutating tool waits for its page change to render before it resolves. Cancellation combines the invocation and workspace signals. If cancellation lands during render acknowledgement, the store restores the previous logical state without breaking monotonic versioning.

## Synthetic Synergy, clearly labeled

Every display name, portrait, home, price, and score is a committed fictional fixture. The scores are fixed between 75 and 92.

**Synergy Scores in this demo are fixed synthetic reads and do not use CoHabby’s production scoring model.**

The demo does not infer compatibility from appearance. Portraits are decorative and never enter ranking, tool input, or tool output. Matching uses only bounded practical housing needs and allowlisted household reasons. Protected-trait and demographic requests fail closed.

## Human control

The browser agent can read, stage, find, explain, compare, and prepare. Only visible human controls can:

- Approve or discard the living plan.
- Edit the roommate introduction.
- Confirm the demo introduction.
- Reset the workspace.

No tool can apply choices, send a message, contact a fictional person, access a real listing, or persist data. The final receipt is exactly: `Demo confirmed. No real message was sent.`

## Run locally

Requirements: Node 22 and npm 10 or later.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A normal browser shows the unsupported-site-tools message and the full human path. For Chrome WebMCP testing, use Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled.

## Verify

```bash
npm run test
npm run type-check
npm run lint
SOURCE_COMMIT_SHA=<candidate-sha> npm run build
npm run audit:prod
git diff --check
```

The app has no backend, login, analytics, cookies, persistent storage, microphone, model API, or production CoHabby connection.

## Repository map

- `lib/decision-room`: eight-phase state machine, deterministic people-and-home fixtures, safe note templates, and UI-only asset maps.
- `lib/webmcp`: six public schemas, standalone validators, exact output contracts, tool callbacks, cancellation rollback, and registration cleanup.
- `components/decision-room`: one-stage experience, six-step WebMCP ribbon, people-and-home cards, Synergy Lens, comparison, and human controls.
- `public/assets`: original fictional portraits, original fictional homes, and the founder-authorized CoHabby app icon.
- `tests`: contracts, state transitions, cancellation, tool lifecycle, safety, registration, security headers, accessibility behavior, contrast, and the complete human path.
- `docs`: exact asset prompts, demo script, Devpost draft, and claim-to-evidence map.

## Challenge provenance

CoHabby existed before the challenge. This standalone public repository contains only the challenge app and synthetic data. It contains no private Git history, production configuration, member data, backend snapshot, or private product code.

[CHALLENGE_WORK.md](./CHALLENGE_WORK.md) separates pre-existing brand context from work created for the challenge. The live footer prints the exact deployment revision. The immutable tag `submission-2026-09-03-people-first-v4` identifies the polished judged source. The earlier V3 tag remains unchanged as a rollback-safe record.

## License

The challenge code is available under the [MIT License](./LICENSE). Outfit remains under the SIL Open Font License, Lucide under ISC, Motion under MIT, and Paper Shaders under Apache-2.0.

The CoHabby name and app icon remain CoHabby brand assets. Their inclusion here does not grant third-party branding rights.
