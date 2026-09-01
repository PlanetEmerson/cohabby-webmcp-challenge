# Security and privacy

## Challenge boundary

Living Decision Room is a synthetic browser demo. It has no backend, authentication, production API, model API, analytics, cookies, or persistent storage.

Do not submit real personal information. The app does not need it.

## Tool boundary

- Tool inputs use strict JSON schemas and runtime validation.
- Unknown fields and unsupported enums fail closed.
- Protected-trait and demographic housing requests are rejected.
- Room references must come from the current visible result generation.
- Outputs pass a separate size, depth, key, URL, and agent-instruction safety check.
- Registration and in-flight work support abort signals.
- Brief application and introduction confirmation exist only as visible human controls.

## Data

All room records are synthetic. They contain a market label, monthly price, currency, availability window, home type, practical policies, and allowlisted reason codes. They contain no resident names, faces, biographies, exact addresses, coordinates, contact details, or production identifiers.

## Report a problem

Use the repository's private GitHub security advisory flow for a security issue. Use a normal GitHub issue for a non-sensitive bug.
