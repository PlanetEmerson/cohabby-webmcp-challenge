# Challenge work record

## What existed before August 25, 2026

CoHabby already existed as a private housing product with its own mobile and web applications, brand, marketplace ideas, and compatibility research. None of that private Git history, member data, production configuration, backend code, or authenticated product state is included here.

The warm Craft Era colors and the CoHabby name predate the challenge. They are used here with the owner's permission.

## What is new

This repository started during the WebMCP Challenge submission period with the root scaffold commit `7df5d15`.

The following work is new for the challenge:

- The standalone Living Decision Room page.
- The five imperative WebMCP tools.
- Strict input schemas and CSP-safe standalone Ajv validation.
- The typed tab-local state machine and render acknowledgement boundary.
- Twelve synthetic room fixtures across three demo markets.
- Safe reason projections and deterministic introduction templates.
- Human-only brief application and demo introduction confirmation.
- Unsupported-browser, mobile, tablet, and desktop experiences.
- Registration cleanup, cancellation, stale-reference checks, and security headers.
- Public tests, setup instructions, provenance notes, demo script, and submission copy.

The challenge commit range begins at `7df5d15` and ends at the immutable `submission-2026-09-03` tag. The live footer shows the exact deployed revision.

## Public tools

1. `get_living_context`
2. `stage_living_brief`
3. `find_compatible_rooms`
4. `compare_shortlist`
5. `prepare_introduction`

No tool applies a brief, confirms an introduction, sends a message, publishes a listing, makes a payment, or writes to production.

## Deliberate omissions

This challenge build does not include production search, member profiles, real listings, Synergy scoring, authentication, payments, invitations, messaging, voice, external MCP, a model API, or an AI-platform submission.
