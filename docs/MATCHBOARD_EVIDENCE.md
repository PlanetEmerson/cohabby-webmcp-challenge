# Living Matchboard verification

Date: September 1, 2026

## Automated gate

- Node 22 clean install completed from `package-lock.json`.
- 61 tests passed across contracts, state transitions, activity, UI, safety, registration, headers, motion policy, voice exclusion, and computed WCAG contrast pairs.
- TypeScript type-check passed.
- ESLint passed with zero warnings.
- The optimized Next.js production build completed.
- The production-only dependency audit found zero vulnerabilities.

## Browser evidence

- The production build exposed the five exact WebMCP tools in the in-app judge browser.
- The five-tool path completed twice from a fresh page.
- Both passes paused for the visible human brief approval and introduction confirmation.
- The final receipt read `Demo confirmed. No real message was sent.`
- The browser console contained no warnings or errors after the complete path.
- The connected Chrome instance did not expose WebMCP and showed the documented unsupported-browser state. Its complete human path reached the same receipt with no console warnings or errors.
- Visual checks covered 360×800, 768×1024, and 1440×900.

## Performance and presentation evidence

- Desktop Lighthouse scored 100 for performance, accessibility, best practices, and SEO. It measured 0.5 s LCP, 0 ms total blocking time, and 0.003 CLS.
- Mobile Lighthouse scored 99 for performance and 100 for accessibility, best practices, and SEO. It measured 2.2 s LCP, 0 ms total blocking time, and 0 CLS under Lighthouse throttling.
- Chrome's agentic browsing audit scored 100 on desktop and mobile.
- A Chrome trace with 4× CPU slowdown and Slow 4G measured 695 ms LCP and 0 CLS.
- The HyperFrames demo animatic passed with zero lint, runtime, layout, motion, or contrast findings. All 16 sampled text treatments passed WCAG AA.

## Boundary evidence

- The public source and history scans found no credentials, private checkout paths, production CoHabby hosts, OpenAI configuration, or private repository names.
- The repository contains no photo, audio, video, font, source-map, or private brand-asset file.
- Microphone access remains denied by `Permissions-Policy`.
- The runtime source contains no speech recognition, WebRTC, microphone request, OpenAI client, or model endpoint.

The final live revision and immutable tag are verified again after public deployment.
