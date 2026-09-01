# Asset provenance

The challenge app uses no real member photos, real listing media, map imagery, or production data. Every person and home shown in the demo is fictional.

| Asset | Source and rights | Use |
| --- | --- | --- |
| CoHabby name and app icon | CoHabby owns the name and icon. The founder authorized this challenge build to use the existing app icon. The brand remains excluded from third-party branding rights under the MIT code license. | Header identity and favicon |
| Outfit font | Google Fonts, SIL Open Font License 1.1, bundled at build time by `next/font` | Headings, labels, and buttons |
| Lucide icons | `lucide-react`, ISC License | Interface icons |
| Motion for React | `motion`, MIT License | Layout and causal state transitions |
| Synthetic room copy | Written for this repository | Demo fixtures and room cards |
| Twelve synthetic room images | Generated for this repository with the built-in OpenAI image generation tool, then resized and stripped of metadata with `cwebp`. No source photo, address, or real listing was used. | Fictional room and home cards |
| Twelve synthetic portraits | Generated for this repository with the built-in OpenAI image generation tool, then resized and stripped of metadata with `cwebp`. The portraits do not depict real people and never enter matching logic. | Fictional housemate cards |

The generation prompts and shared constraints are recorded in [ASSET_PROMPTS.md](./docs/ASSET_PROMPTS.md). The public demo video is not part of the repository. It contains the submitted app, browser-tool evidence, and founder narration without music.
