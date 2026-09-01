# Devpost submission copy

## Project title

CoHabby Living Decision Room

## Tagline

Find a room with your browser agent on one shared, human-controlled page.

## Short description

Finding a room means choosing a home, shared rules, and another human relationship. I built Living Decision Room so a person and their browser agent can work through that choice on the same page. The agent can stage a brief, find synthetic rooms, compare a shortlist, and prepare an introduction. The person applies the brief and confirms the introduction.

## Why is this a strong fit for WebMCP?

Housing search breaks when an agent has to guess at page structure, hidden state, or confirmation boundaries. WebMCP lets the page expose five narrow operations through its real state machine. The person and agent see the same brief, results, comparison, and draft. There is no second model behind the page and no external MCP server.

## How does it create a better user experience?

The person can describe a housing goal in normal language instead of rebuilding it across filters and tabs. Every agent change appears on the page. The brief can be corrected before it affects results. Room reasons come from the app's practical rules, and the final introduction remains editable and unsent until the person confirms the demo.

The full interface also works without WebMCP, so the site remains a useful web page in any modern browser.

## What can people and agents do together now?

An agent can turn a request into a reviewable living brief, ask CoHabby for current synthetic options, and build a comparison without losing the meaning of the search. The person keeps control at the two moments that matter: approving the brief and confirming the introduction.

That shared handoff was hard to express with browser clicking alone. WebMCP gives each operation a clear contract and lets the page show the result.

## How did I implement WebMCP?

The top-level page registers five imperative tools with `document.modelContext.registerTool`. Each tool has a bounded object schema with `additionalProperties: false`. The callbacks revalidate inputs against CSP-safe standalone Ajv validators, call the same typed store actions as the human UI, wait for React to render the new state, and return a narrow safe projection.

Registration and data work use abort signals. Room references are valid only for the current result generation. Outputs exclude exact locations, contact details, private IDs, URLs, and agent instructions. The app uses twelve owned synthetic room records and makes no network or production write.

## What is new for the challenge?

CoHabby existed before the challenge. Living Decision Room, its five WebMCP tools, browser lifecycle adapter, synthetic room data, comparison board, human confirmation flow, public tests, live deployment, and this public repository were created during the submission period. `CHALLENGE_WORK.md` links that work to the dated commit history.

## Technology

WebMCP, Next.js, React, TypeScript, Ajv, Vitest, Tailwind CSS, and Lucide.
