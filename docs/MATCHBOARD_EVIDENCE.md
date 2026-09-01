# People-First Synergy V3 verification

Date: September 1, 2026

## Local automated gate

- Node 22 install is locked by `package-lock.json`.
- 88 tests pass across schemas, exact outputs, state transitions, deterministic ordering, asset maps, cancellation rollback, reset invalidation, registration, UI, safety, security headers, reduced motion, and computed contrast.
- TypeScript passes with no errors.
- ESLint passes with zero warnings.
- The optimized Next.js production build completes.
- The V3 security diff scan reviewed all 26 changed source files and produced no reportable finding. It reproduced two lifecycle specification gaps, which were fixed with focused tests before release.

## Local browser gate

- The unsupported-browser path completes from living plan through the exact receipt.
- Desktop screenshots cover ready, plan review, people and homes, Synergy explanation, comparison, introduction, and success at 1440×900.
- Mobile screenshots cover the clear next action and person-first match stage at 360×800.
- The action dock remains visible, the whole people-and-home card is selectable, and the supporting Synergy action does not toggle selection.
- The comparison shows the person and practical tone choice before the note action.
- The success art uses two roommate paths meeting at a home. It has no romantic symbol or dating language.

## Release proof still required on the final public SHA

- Fresh public-tag clone: install, 88-test suite, type-check, lint, production build, dependency audit, and diff check.
- GPT-5.6 Sol: complete the six-tool path twice from reset.
- GPT-5.6 Terra: complete the six-tool path once.
- Chrome 149 or later with WebMCP testing enabled: discover and invoke all six tools.
- Normal browser: complete the full human path.
- Verify Synergy Lens render acknowledgement before `explain_synergy_match` resolves.
- Verify 360×800, 768×1024, and 1440×900 on the deployed build.
- Verify no app-origin console errors or failed requests.
- Run desktop and mobile Lighthouse plus accessibility and agentic browsing audits.
- Verify TLS, HTTP 200, security headers, public source, license detection, and live source revision.

This file records completed local proof separately from pending deployment proof. It must not claim a final live result until that exact public revision passes.
