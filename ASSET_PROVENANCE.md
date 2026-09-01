# Asset provenance

The challenge app uses no real member photo, real listing media, map imagery, exact property, or production data. Every person and home shown in the demo is fictional.

| Asset | Source and rights | Use |
| --- | --- | --- |
| CoHabby name and app icon | CoHabby owns the name and icon. The founder authorized this challenge build to copy and use the existing app icon. The brand remains excluded from third-party branding rights under the MIT code license. | Header identity and favicon |
| Outfit font | Google Fonts, SIL Open Font License 1.1, bundled at build time by `next/font` | Headings, labels, and buttons |
| Lucide icons | `lucide-react`, ISC License | Interface icons |
| Motion for React | `motion`, MIT License | Layout and causal state transitions |
| Paper Shaders | `@paper-design/shaders-react` version 0.0.80, Apache-2.0 License | One bounded decorative living field with a CSS fallback |
| Synthetic people and home copy | Written for this repository | Fictional fixtures and visible explanations |
| Twelve synthetic home images | Generated for this repository with the built-in OpenAI image generation tool, then resized and stripped of metadata with the official `cwebp` encoder. No source photo, address, or real listing was used. | Fictional home context |
| Twelve synthetic portraits | Generated for this repository with the built-in OpenAI image generation tool, then resized and stripped of metadata with the official `cwebp` encoder. The portraits do not depict real people and never enter matching logic. | Fictional roommate cards |

The exact generation prompts and shared constraints are recorded in [ASSET_PROMPTS.md](./docs/ASSET_PROMPTS.md).

Room files are 1200 by 800 WebP images under 180 KB. Portraits are 512 by 512 WebP images under 60 KB. `cwebp -metadata none` removed EXIF, XMP, and ICC metadata.

The public demo video is not part of this repository. It will show the submitted build and founder narration without music.
