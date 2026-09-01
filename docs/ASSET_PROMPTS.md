# Synthetic asset prompts

These assets were generated for the challenge with the built-in OpenAI image generation tool on September 1, 2026. No model API key or production CoHabby service was used.

## Room image template

Each room used this shared prompt structure:

```text
Use case: photorealistic-natural
Asset type: synthetic CoHabby room-card image, 3:2 landscape, target 1536 x 1024
Primary request: Create an original fictional interior for the named demo fixture.
Style/medium: natural editorial interior photography with realistic materials and proportions, not CGI.
Composition/framing: wide horizontal card crop that remains clear at thumbnail size.
Lighting/mood: calm natural light suited to the fixture description.
Constraints: entirely fictional; no people, faces, names, logos, readable text, signs, watermarks, maps, exact address clues, recognizable landmarks, distorted architecture, or luxury advertising gloss.
```

| File | Fixture-specific request |
| --- | --- |
| `room_nyc_cedar.webp` | Bright shared-home bedroom adjoining a sunny common area, with a desk, plants, warm neutral textiles, and quiet morning light. |
| `room_nyc_hudson.webp` | Calm shared bedroom with a reading corner, divided storage, and cat-friendly furniture without an animal. |
| `room_nyc_linden.webp` | Compact move-in-ready bedroom with a practical work corner, open storage, and relaxed afternoon light. |
| `room_nyc_orchard.webp` | Modest lightly furnished apartment living area for two future housemates searching for a full place together. |
| `room_ams_canal.webp` | Compact quiet bedroom with tall windows, a reading nook, natural wood, and soft northern daylight. |
| `room_ams_harbor.webp` | Simple efficient bedroom available now, with compact storage, a desk, and one muted teal textile. |
| `room_ams_tulip.webp` | Adaptable apartment living room and kitchen for two people shaping a new home together. |
| `room_ams_courtyard.webp` | Shared bedroom opening toward a green courtyard-facing space, with tidy storage and a steady morning rhythm. |
| `room_chi_maple.webp` | Bright urban bedroom with broad generic windows, a desk, radiator, plants, and rust accents. |
| `room_chi_lake.webp` | Flexible bedroom with organized storage, shared-hall cues, navy textiles, and practical household rules. |
| `room_chi_river.webp` | Modest apartment living room and kitchen with a fresh-start corner for two future housemates. |
| `room_chi_garden.webp` | Thoughtful budget bedroom with thrifted wood, useful shelving, and warm evening light. |

## Portrait template

Each portrait used this shared prompt structure:

```text
Use case: photorealistic-natural
Asset type: fictional CoHabby housemate portrait, square 1024 x 1024
Primary request: Create a completely fictional adult housemate portrait with the listed appearance and clothing.
Style/medium: natural editorial profile photography with authentic skin texture, not a glamour headshot.
Composition/framing: centered shoulders-up portrait, direct eye contact, plain warm background.
Lighting/mood: soft window light and an approachable expression.
Constraints: not based on or resembling any real person or celebrity; no text, logo, watermark, branded clothing, uniform, heavy retouching, extra people, hands, or background objects.
```

| File | Fixture-specific request |
| --- | --- |
| `person_demo_maya.webp` | Dark hair in a loose bun, warm medium complexion, cream shirt, and small coral layer. |
| `person_demo_jordan.webp` | Deep brown complexion, short natural curls, muted teal overshirt, and cream top. |
| `person_demo_sam.webp` | Fair complexion, loose brown curls, and a gray-green knit top. |
| `person_demo_riley.webp` | Olive-toned complexion, shoulder-length dark waves, sand overshirt, and muted coral tee. |
| `person_demo_noor.webp` | Light brown complexion, neutral headscarf, and dusty blue top. |
| `person_demo_luca.webp` | Warm fair-to-olive complexion, short dark hair, light stubble, cream tee, and muted teal cardigan. |
| `person_demo_sofie.webp` | Fair complexion with freckles, chin-length copper-blonde hair, sage top, and coral overshirt. |
| `person_demo_daan.webp` | Medium complexion, close-cropped dark-blond hair, subtle beard, and navy-teal crewneck. |
| `person_demo_amina.webp` | Rich brown complexion, natural braids gathered back, cream blouse, and muted rust layer. |
| `person_demo_theo.webp` | Light-medium complexion, short sandy-brown hair, warm gray top, and navy overshirt. |
| `person_demo_morgan.webp` | Medium-brown complexion, short textured dark hair, cream tee, and olive overshirt. |
| `person_demo_casey.webp` | Light-brown complexion, short cropped curls, cream collar, and mustard knit. |

The images were converted with `cwebp -metadata none`. Room files are 1200 by 800 pixels and under 180 KB. Portraits are 512 by 512 pixels and under 60 KB.
