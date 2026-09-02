# Video capture and assembly plan V2

The strongest submission video is a real CoHabby Living screen recording with CJ's voice recorded separately. It proves the product works and gives us clean control over pacing.

Use the package in this order:

1. Record `BOOTH_NARRATION_V2.md` in the booth.
2. Capture the nine clips in `SCREEN_CAPTURE_RUNBOOK_V2.md`.
3. Assemble them against the timings in `DEMO_SCRIPT.md`.
4. Add `DEMO_CAPTIONS.srt` and verify every caption against the final audio.

## Capture setup

1. Use a 1920×1080 display or set the browser window to a clean 16:9 region.
2. Keep browser zoom at 100 percent and macOS in light appearance.
3. Turn off notifications, hide the desktop and Dock, and close private tabs and apps.
4. Reset the live app at `https://webmcp.cohabby.com` before every take.
5. Record at 30 fps. Capture the browser content and the minimum agent-tool area needed to prove the WebMCP call.
6. Do not record a microphone with the screen capture. Record CJ's voice as a separate clean WAV so mistakes can be fixed without repeating the demo.

On macOS, press Shift-Command-5, choose **Record Selected Portion**, draw a 16:9 region around the demo, set Microphone to **None**, and press **Record**. Capture the nine short clips in the runbook rather than trying to perform the full demo perfectly in one take.

## Clean master sequence

| Clip | Target | Required visible proof |
| --- | ---: | --- |
| 01 Opening | 14 s | Headline, CoHabby mark, `Site tools ready`, six-step ribbon |
| 02 WebMCP tools | 17 s | Exact six-tool disclosure and ribbon |
| 03 Living plan | 19 s | `get_living_context`, `stage_living_brief`, human approval |
| 04 Matches | 20 s | `find_compatible_rooms`, three people, card shimmer, whole-card selection |
| 05 Synergy Lens | 22 s | `explain_synergy_match`, score, evidence, three reasons |
| 06 Comparison | 22 s | `compare_shortlist`, two people, six clear rows, person and tone choice |
| 07 First hello | 23 s | `prepare_introduction`, editable text, human confirmation, exact receipt |
| 08 Source proof | 21 s | Strict schema, cancellation/render test, public source, deployed revision |
| 09 Close | 15 s | Success animation, exact receipt, CoHabby mark |

## Narration recording

- Record in a quiet room with the microphone 15 to 20 cm from CJ.
- Record 48 kHz WAV, mono or stereo, with peaks between -12 dB and -6 dB.
- Read conversationally. Leave a short breath between sections and do not rush tool names.
- Record each section as its own take plus one continuous safety read.
- Keep the final spoken track between 2:35 and 2:48. The visual close can hold for the remaining seconds.

## Edit

- Put narration down first and cut the screen recording to the voice.
- Use straight cuts and short 180 ms dissolves only when a cut feels abrupt.
- Add six small lower-thirds for the exact tool names. Use Outfit, warm white, coral, and teal.
- Add accurate captions from `DEMO_CAPTIONS.srt`.
- Use no music. Keep UI sounds muted unless one quiet click helps a human confirmation land.
- Crop out unrelated browser chrome, tabs, notifications, account names, and desktop content.
- Export H.264 at 1920×1080, 30 fps, 12 to 16 Mbps, with AAC audio at 48 kHz and 192 kbps or higher.

## Final video gate

- Runtime is below 3:00, preferably 2:45 to 2:55.
- Audio clearly covers what was built and how WebMCP is used.
- Every depicted action works on the submitted live revision.
- The video contains no unlicensed music, third-party footage, private data, real member data, or unsupported claim.
- YouTube visibility is **Public**, not Private. Verify the URL while signed out before pasting it into Devpost.
