# People-First Synergy verification

Date: September 1, 2026

## CoHabby Living named release

- Public product name: `CoHabby Living`.
- Judged source tag: `submission-2026-09-03-cohabby-living`.
- Deployed source: `9225e33559015c58a2f3f9a6fd0b5ce60b87a3cd`.
- The app header, browser metadata, README, Devpost copy, YouTube package, narration, and captions use the same short public name. WebMCP tool names, schemas, state behavior, and repository URLs remain unchanged.
- The V2 video package includes a booth-only nine-take read, an exact five-prompt screen-recording runbook, a timed shot list, and 22 caption cues. The booth read, timed narration, and captions match word for word at 337 spoken words and end at 2:53.
- A fresh public-tag clone under Node 22 passed all 95 tests, type-check, lint, the exact-SHA production build, the production dependency audit, diff check, and clean status.
- Vercel reports the production deployment Ready. The custom domain and stable fallback return HTTP 200 with the required security headers. Deployment warning and error logs are empty.
- The live header shows `CoHabby Living` and `People-first roommate matching`. The browser title is `CoHabby Living | Compatibility-first roommate finder`, and the footer shows `Source 9225e3355901`.
- The in-app browser discovered all six exact WebMCP tools. `get_living_context` returned `ready` in phase `READY`, and the browser reported no warning or error.
- Live desktop Lighthouse scores 100 for performance, accessibility, best practices, and SEO. It measures 0.56 s LCP, 0 ms TBT, and 0.0003 CLS.
- Live mobile Lighthouse scores 99 for performance and 100 for accessibility, best practices, and SEO. It measures 2.27 s LCP, 0 ms TBT, and 0.0064 CLS.
- Every earlier immutable submission tag remains unchanged.

## Final people-first submission release

- Judged source tag: `submission-2026-09-03-final-people-first`.
- Deployed source: `cb6c5f0df5b4a57357d62b8b93abb6786bbcc5d8`.
- The final interaction polish gives every roommate card a visible card-wide hover and focus treatment while preserving whole-card mouse and keyboard selection. The independent `Why Synergy?` action now has a reduced-motion-safe shimmer and never toggles selection.
- The repository includes the final 2:53 narration, shot list, screen-capture plan, 22-cue SRT file, YouTube package, paste-ready Devpost answers, testing instructions, gallery captions, and final submission checklist.
- A fresh public-tag clone under Node 22 passed all 94 tests, type-check, lint, the exact-SHA production build, the production dependency audit, diff check, and clean status.
- The final production deployment is Ready. The custom domain and stable fallback return HTTP 200 with the required security headers. Deployment warning and error logs are empty.
- The live footer shows `Source cb6c5f0df5b4`.
- The final in-app browser run discovered all six exact WebMCP tools, completed the six-tool path with both human-only actions, and reached `Demo confirmed. No real message was sent.`
- The final in-app browser run reported no warning or error.
- Final live desktop Lighthouse scores 100 for performance, accessibility, best practices, and SEO. It measures 0.38 s LCP, 0 ms TBT, and 0.0005 CLS.
- Final live mobile Lighthouse scores 99 for performance and 100 for accessibility, best practices, and SEO. It measures 2.27 s LCP, 38 ms TBT, and 0.0074 CLS.
- Five clean full-page submission frames were captured from the exact final deployment after every lazy image reported ready.

## V4 presentation release

- The six WebMCP contracts, eight product phases, fixtures, and two human-only approvals remain unchanged.
- The full local suite now contains 94 passing tests. TypeScript and ESLint pass with no errors or warnings.
- Focused tests cover the larger person-first portraits, non-overlapping SVG Synergy gauge, solid comparison surface, stage text treatment, and lighter action gradient.
- Local screenshots cover 360×800, 768×1024, 1296×1233, and 1440×900. The page has no horizontal overflow at 360 px.
- The complete unsupported-browser path reaches the exact receipt with no app console error or failed app-origin request.
- A bounded security diff scan reviewed all ten changed production files and found no reportable issue. The tool schemas, safe-output boundary, state and cancellation controls, human-only actions, self-only resource policy, and headers were unchanged.
- Desktop Lighthouse scores 100 for performance, accessibility, best practices, and SEO. It measures 0.53 s LCP, 0 ms TBT, and 0.0003 CLS.
- Mobile Lighthouse scores 98 for performance and 100 for accessibility, best practices, and SEO. It measures 2.50 s LCP, 3.5 ms TBT, and 0.0074 CLS.
- Public source tag: `submission-2026-09-03-people-first-v4`.
- Deployed source: `3aa7869022cebbb370e3db5ef7e7d1f52fbccc11`.
- A fresh public-tag clone under Node 22 passed all 94 tests, type-check, lint, the exact-SHA production build, the production dependency audit, diff check, and clean status.
- Vercel reports the production deployment ready. The custom domain and stable fallback alias return HTTP 200, and the error and warning logs are empty.
- The custom domain exposes the required production headers and the live footer shows `Source 3aa7869022ce`.
- The in-app judge browser discovered all six exact WebMCP tools with the unchanged strict schemas.
- The live six-tool path completed through the visible Synergy explanation and exact human-confirmed receipt. A second pass skipped the optional explanation and completed successfully.
- The in-app browser console reported no warning or error after both passes.
- The immutable V3 tag remains unchanged as the rollback-safe baseline.

## V3 baseline release proof

## Local automated gate

- Node 22 install is locked by `package-lock.json`.
- 89 tests pass across schemas, exact outputs, state transitions, deterministic ordering, asset maps, cancellation rollback, reset invalidation, registration, UI, safety, security headers, reduced motion, and computed contrast.
- TypeScript passes with no errors.
- ESLint passes with zero warnings.
- The optimized Next.js production build completes.
- The complete dependency audit reports zero vulnerabilities, including development tools.
- The V3 security diff scan reviewed all 26 changed source files and produced no reportable finding. It reproduced two lifecycle specification gaps, which were fixed with focused tests before release.

## Local browser gate

- The unsupported-browser path completes from living plan through the exact receipt.
- Desktop screenshots cover ready, plan review, people and homes, Synergy explanation, comparison, introduction, and success at 1440×900.
- Mobile screenshots cover the clear next action and person-first match stage at 360×800.
- The action dock remains visible, the whole people-and-home card is selectable, and the supporting Synergy action does not toggle selection.
- The comparison shows the person and practical tone choice before the note action.
- The success art uses two roommate paths meeting at a home. It has no romantic symbol or dating language.
- Desktop Lighthouse scores 100 for performance, accessibility, best practices, and SEO. It measures 0.5 s LCP, 0 ms TBT, and 0.008 CLS.
- Mobile Lighthouse scores 98 for performance and 100 for accessibility, best practices, and SEO. It measures 2.4 s LCP, 0 ms TBT, and 0.007 CLS.
- The decorative shader chunk does not load on the opening stage. It becomes eligible only after the person advances to results, keeping the first paint static and fast.
- A full 768×1024 interaction pass recorded zero browser long tasks through reset, living-plan approval, keyboard card selection, Synergy, comparison, note preparation, and confirmation.
- The same pass produced no console error, page error, or failed app-origin request. The introduction safety gate disabled confirmation for a phone number and exact street, then re-enabled it for a safe roommate note.
- With reduced motion enabled, the results stage kept `data-living-field="static"` and did not mount the WebGL shader.

## Public release proof

- Public source tag: `submission-2026-09-03-people-first-v3`.
- Deployed source: `a1a61c787e797bbe6497ad9b17a34d053548ae99`.
- Live URL: [https://webmcp.cohabby.com](https://webmcp.cohabby.com).
- Public fallback alias: [https://cohabby-webmcp-challenge-weld.vercel.app](https://cohabby-webmcp-challenge-weld.vercel.app).
- Public repository: [PlanetEmerson/cohabby-webmcp-challenge](https://github.com/PlanetEmerson/cohabby-webmcp-challenge).
- GitHub reports a public repository, `main` as the default branch, and MIT as the detected license.
- A fresh shallow clone of the public tag passed `npm ci`, all 89 tests, type-check, lint, the exact-SHA production build, the full dependency audit, and diff and status checks.
- The custom domain returns HTTP 200 over TLS with a certificate for `webmcp.cohabby.com`.
- The live response includes the required CSP, WebMCP permissions policy, HSTS, origin isolation, referrer policy, content-type protection, and frame denial.
- The live footer shows `Source a1a61c787e79`.
- The in-app judge browser discovered all six exact tools with the V3 schemas.
- The in-app browser completed the full six-tool path twice from reset. Every mutating call returned only after its matching stage was visible.
- A third in-app pass moved from results straight to comparison without calling the optional explanation tool, then completed the introduction.
- The live `explain_synergy_match` call rendered Maya’s Synthetic Synergy Lens and three bounded reasons before resolving.
- Both human-only actions remained visible page clicks. Every pass ended with `Demo confirmed. No real message was sent.`
- The in-app browser reported zero warnings or errors after the three passes.
- Chrome 151 completed the deployed unsupported-browser human path through the same receipt with zero warnings or errors.
- Deployed screenshots cover 360×800, 768×1024, and 1440×900.
- Deployed desktop Lighthouse scores 100 for performance, accessibility, best practices, and SEO. It measures 0.5 s LCP, 0 ms TBT, and 0.001 CLS.
- Deployed mobile Lighthouse scores 99 for performance and 100 for accessibility, best practices, and SEO. It measures 2.3 s LCP, 10 ms TBT, and 0.007 CLS.
- Vercel reports the production deployment ready and the deployment error log is empty.

## Remaining human and runtime gates

- Chrome 151 does not expose `document.modelContext` in the connected profile. CJ must enable Chrome’s WebMCP testing flag before the Chrome-specific six-tool pass.
- Run one model-specific GPT-5.6 Terra six-tool pass. GPT-5.6 Luna remains out of scope.
- Record CJ’s final narration, add accurate captions, and upload the under-three-minute video publicly to YouTube.
- Add the YouTube URL and selected screenshots to Devpost.
- Stop before final Devpost submission and obtain CJ’s explicit approval.
