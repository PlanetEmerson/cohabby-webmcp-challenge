# Security and privacy

## Challenge boundary

CoHabby Living is a synthetic browser demo. It has no backend, authentication, production API, model API, microphone access, speech recognition, WebRTC, analytics, cookies, or persistent storage.

Do not enter real personal information. The app does not need it.

## Tool boundary

- Tool inputs use strict JSON schemas and runtime validation.
- Non-plain objects, accessors, prototype keys, unknown fields, unsupported enums, and over-bounds values fail closed.
- Protected-trait and demographic housing requests are rejected.
- Room references must come from the current visible result generation.
- Exact tool output schemas run before a second size, depth, key, URL, and agent-instruction safety check.
- Registration and in-flight work use abort signals.
- Invocation cancellation is combined with the workspace-reset signal.
- A mutation canceled during render acknowledgement restores the previous logical state.
- Living-plan approval and introduction confirmation exist only as visible human controls.
- The deployment denies microphone access and does not connect to OpenAI or any CoHabby production origin.

## Data

Every display name, portrait, home image, price, reason, and score is fictional and committed to this public repository. The demo contains no real member likeness, biography, contact detail, exact address, coordinate, production identifier, or real listing.

Synergy Scores are fixed synthetic fixture values. They do not use CoHabby’s production scoring model. Portrait appearance never enters filtering or ordering.

## Report a problem

Use the repository’s private GitHub security advisory flow for a security issue. Use a normal GitHub issue for a non-sensitive bug.
