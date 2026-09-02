# Devpost submission copy

## Submission links

- Live app: [https://webmcp.cohabby.com](https://webmcp.cohabby.com)
- Public source: [https://github.com/PlanetEmerson/cohabby-webmcp-challenge](https://github.com/PlanetEmerson/cohabby-webmcp-challenge)
- Judged source tag: `submission-2026-09-03-final-people-first`
- YouTube demo: pending CJ narration and public upload

## Project title

CoHabby Living Decision Room

## Tagline

Live with someone who gets you. Your browser agent sorts the options. You choose who to meet.

## Short description

CoHabby helps people find roommates they may live well with. I built Living Decision Room so a person and their browser agent can work through that choice on the same page. The agent can understand a living style, stage must-haves, find fictional people and homes, explain a fixed synthetic Synergy read, compare daily life, and prepare a practical first hello. The person approves the living plan and confirms the introduction.

## Testing instructions

Open the live app in ChatGPT's in-app browser. The top-right badge should read `Site tools ready`, and the tool disclosure should list six WebMCP tools.

Use this prompt:

> Help me find a compatible roommate in New York. My budget is $1,900 a month, I want to move within 30 days, I have a cat, and I value quiet evenings and a smoke-free home. Explain the strongest synthetic Synergy read, compare the top two people and homes, then prepare a warm roommate introduction.

The agent will stop twice for human action. Click **Yes, use these choices** after reviewing the living plan. At the end, review the editable hello and click **Confirm demo introduction**. The final receipt must say `Demo confirmed. No real message was sent.`

For Chrome 149 or later, enable `chrome://flags/#enable-webmcp-testing` and restart Chrome. A browser without WebMCP can still complete the same human path.

## Why is this a strong fit for WebMCP?

Roommate search is hard for a browser agent when the real decision is spread across filters, cards, hidden state, and confirmation screens. WebMCP lets the page expose six narrow operations through the same state machine used by the human interface: `get_living_context`, `stage_living_brief`, `find_compatible_rooms`, `explain_synergy_match`, `compare_shortlist`, and `prepare_introduction`.

The agent does not call another agent. It uses CoHabby's page directly. Each tool has one clear job, bounded input, current-state checks, and a visible result. The signature tool, `explain_synergy_match`, opens a clear explanation for one current fictional roommate possibility without exposing or calculating CoHabby's private production score.

## How does it create a better user experience?

The first screen gives the person one obvious next step. After that, every next step appears in the same spot on the page. The page shows one stage at a time, so people do not have to search through a stack of old panels.

The search puts possible roommates first and keeps the home as practical context. Large portraits, clear Synergy gauges, and plain labels make the next choice easy to see. A person can scan the household rhythm, synthetic Synergy read, rent, timing, and reasons together. The Synergy Lens explains the read before comparison. The comparison makes the person and tone choice explicit before the hello appears.

The full flow works without WebMCP, so an unsupported browser still gets the complete product path.

## What can people and agents do together now?

A browser agent can turn a housing request into a visible living plan, find current fictional roommate possibilities, explain one synthetic Synergy read, compare two or three people and homes, and prepare a roommate introduction.

The person keeps the two decisions that should not be automated. They approve the living plan and confirm the introduction. No tool can send a message, contact a real person, touch a real listing, or write to production.

This creates a clean handoff. The browser handles structured work. The person controls intent and contact. In roommate search, that split makes the work faster without automating the personal decision of who to contact.

## How did I implement WebMCP?

The top-level page statically registers six imperative tools with `document.modelContext.registerTool`. Each input uses a bounded object schema with `additionalProperties: false`. The callbacks reject non-plain values, revalidate with standalone Ajv code that works under the production CSP, check that the page is in the right state, reject stale result references, and return an exact safe projection.

Mutating tools honor both the invocation and workspace-reset cancellation signals. They wait for React to render the new state before resolving. If cancellation lands during render acknowledgement, the store restores the previous logical state and keeps `stateVersion` monotonic.

Only `get_living_context` is marked read-only. Fixture-derived results are marked untrusted. Outputs exclude image paths, URLs, exact locations, contact details, production identifiers, internal rank, and agent instructions.

The app uses twelve fictional people, twelve fictional homes, and fixed synthetic scores. It makes no backend or model call.

## What is new for the challenge?

CoHabby existed before the challenge. Living Decision Room, its six WebMCP tools, public state machine, synthetic fixtures, original generated assets, Synergy Lens, comparison, human controls, tests, public repository, and standalone deployment were built during the submission period. `CHALLENGE_WORK.md` separates that work from the private product.

## Technology

WebMCP, Next.js, React, TypeScript, Ajv, Vitest, Tailwind CSS, Motion, Paper Shaders, Lucide, and WebP.

## Suggested gallery captions

1. Six WebMCP tools share one visible decision room with the person.
2. The agent adds fictional roommate matches while the home stays practical context.
3. `explain_synergy_match` opens a fixed synthetic Synergy read with three bounded reasons.
4. The agent compares current roommates, then the person chooses who to greet and how the hello should sound.
5. The person confirms the demo introduction. No real message is sent.
