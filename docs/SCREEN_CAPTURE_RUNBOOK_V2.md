# CoHabby Living screen-recording runbook V2

Use this after the narration is recorded. Capture short clips, not one perfect three-minute performance. The final edit will follow the narration timing in `BOOTH_NARRATION_V2.md`.

## Before recording

1. Open `https://webmcp.cohabby.com` in ChatGPT's in-app browser.
2. Confirm the page says `Site tools ready` and the footer shows the final source revision.
3. Set browser zoom to 100 percent and use a 1920×1080 recording region.
4. Hide notifications, other tabs, account details, the Dock, and desktop files.
5. Press **Reset** so the opening page is clean.
6. Record without a microphone. CJ's booth narration will be added afterward.

## Exact agent prompts

Use one prompt per clip. This keeps each page state on screen long enough to record cleanly.

### Prompt A · living context and plan

> Use CoHabby Living's site tools. Read the current living context, then stage this plan for my review: New York, up to $1,900 per month, move within 30 days, shared home, cat, smoke-free, and quiet evenings. Stop when my approval is needed.

Click **Yes, use these choices** yourself. Do not ask the agent to approve it.

### Prompt B · roommate matches

> I approved the living plan. Use the site tools to show the top three compatible roommate matches. Stop on the matches page.

Click anywhere on Maya's card, then anywhere on Jordan's card. Let one **Why Synergy?** shimmer pass remain visible.

### Prompt C · Synergy Lens

> Use the site tools to explain Maya's Synergy read. Stop on the explanation.

Hold until the large `92 Synergy` gauge, evidence ring, portrait, home, and three reasons are all visible.

### Prompt D · comparison

> Use the site tools to compare Maya and Jordan across Synergy, rent, move timing, daily rhythm, household boundaries, and practical fit. Stop on the comparison.

Briefly select **Direct**, then **Casual**, then return to **Warm**. Keep Maya selected.

### Prompt E · first hello

> Use the site tools to prepare a warm first hello to Maya. Use the strongest visible practical reasons. Stop for my confirmation.

In the editable hello, add this short sentence before the final sentence:

> I'd also like to talk about kitchen routines.

Click **Confirm demo introduction** yourself. Hold on `Demo confirmed. No real message was sent.`

## Clip list

| File | Narration take | Capture |
| --- | --- | --- |
| `01-opening.mov` | Take 1 | Opening screen, headline, logo, `Site tools ready` |
| `02-tools.mov` | Take 2 | Open the six-tool disclosure and trace the ribbon |
| `03-plan.mov` | Take 3 | Prompt A, staged plan, human approval click |
| `04-matches.mov` | Take 4 | Prompt B, three matches, shimmer, two whole-card selections |
| `05-synergy.mov` | Take 5 | Prompt C, large Synergy Lens and three reasons |
| `06-compare.mov` | Take 6 | Prompt D, comparison rows, person and tone controls |
| `07-hello.mov` | Take 7 | Prompt E, human text edit, human confirmation, exact receipt |
| `08-proof.mov` | Take 8 | Three source-proof crops listed below |
| `09-close.mov` | Take 9 | Success animation and CoHabby Living branding |

## Source-proof crops for clip 08

Show each for four to six seconds. Use the immutable judged tag in every GitHub URL.

1. Strict schema: `lib/webmcp/tool-schemas.ts`, lines 3–17 and 47–95.
2. Cancellation and render acknowledgement: `lib/webmcp/tools.ts`, lines 69–108.
3. Human boundary test: `tests/webmcp/tools.test.ts`, lines 315–353.
4. Finish on the public repository header with MIT visible, then the live footer source revision.

## Capture quality gate

- Wait for every portrait and room image to load before recording a stage.
- Keep the cursor still unless it is demonstrating a click.
- Do not scroll while a tool is still running.
- Hold each completed state for at least two seconds.
- Keep all six tool names readable once.
- Do not show private tabs, account menus, notifications, terminal history, tokens, or local file paths.
- Do not show or claim a real message, real member, production score, or production backend.
