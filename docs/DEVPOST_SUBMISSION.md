# Devpost submission copy

## Submission links

- Live app: [https://webmcp.cohabby.com](https://webmcp.cohabby.com)
- Public source: [https://github.com/PlanetEmerson/cohabby-webmcp-challenge](https://github.com/PlanetEmerson/cohabby-webmcp-challenge)
- Judged source tag: `submission-2026-09-03-people-first-v3`
- YouTube demo: pending CJ narration and public upload

## Project title

CoHabby Living Decision Room

## Tagline

Meet a compatible roommate with your browser agent on one shared, human-controlled page.

## Short description

CoHabby helps people look for roommates who may live well together. I built Living Decision Room so a person and their browser agent can work through that choice on the same page. The agent can understand a living style, stage must-haves, bring forward fictional people and homes, explain a fixed synthetic Synergy read, compare daily life, and prepare a practical first hello. The person approves the living plan and confirms the introduction.

## Why is this a strong fit for WebMCP?

Roommate search is hard for a browser agent when the real decision is spread across filters, cards, hidden state, and confirmation screens. WebMCP lets the page expose six narrow operations through the same state machine used by the human interface.

The agent does not call another agent. It uses CoHabby’s page directly. Each tool has one clear job, bounded input, current-state checks, and a visible result. The signature tool, `explain_synergy_match`, opens a clear explanation for one current fictional roommate possibility without exposing or calculating CoHabby’s private production score.

## How does it create a better user experience?

The first screen gives the person one obvious next step. After that, the action stays in the same place. The page shows one stage at a time, so people do not have to search through a stack of old panels.

The search puts possible roommates first and keeps the home as practical context. A person can see the portrait, household rhythm, synthetic Synergy read, rent, timing, and reason labels together. The Synergy Lens explains the read before comparison. The comparison makes the person and tone choice explicit before the note appears.

The full flow works without WebMCP, so an unsupported browser still gets the complete product path.

## What can people and agents do together now?

A browser agent can turn a housing request into a visible living plan, find current fictional roommate possibilities, explain one synthetic Synergy read, compare two or three people and homes, and prepare a roommate introduction.

The person keeps the two decisions that should not be automated. They approve the living plan and confirm the introduction. No tool can send a message, contact a real person, touch a real listing, or write to production.

This creates a clean handoff. The browser handles structured work. The person controls intent and contact.

## How did I implement WebMCP?

The top-level page statically registers six imperative tools with `document.modelContext.registerTool`. Each input uses a bounded object schema with `additionalProperties: false`. The callbacks reject non-plain values, revalidate with standalone Ajv code that works under the production CSP, enforce the current state and visible result generation, and return an exact safe projection.

Mutating tools combine the invocation and workspace-reset signals. They wait for React to render the new state before resolving. If cancellation lands during render acknowledgement, the store restores the previous logical state and keeps `stateVersion` monotonic.

Only `get_living_context` is marked read-only. Fixture-derived results are marked untrusted. Outputs exclude image paths, URLs, exact locations, contact details, production identifiers, internal rank, and agent instructions.

The app uses twelve fictional people, twelve fictional homes, and fixed synthetic scores. It makes no backend or model call.

## What is new for the challenge?

CoHabby existed before the challenge. Living Decision Room, its six WebMCP tools, public state machine, synthetic fixtures, original generated assets, Synergy Lens, comparison, human controls, tests, public repository, and standalone deployment were built during the submission period. `CHALLENGE_WORK.md` separates that work from the private product.

## Technology

WebMCP, Next.js, React, TypeScript, Ajv, Vitest, Tailwind CSS, Motion, Paper Shaders, Lucide, and WebP.
