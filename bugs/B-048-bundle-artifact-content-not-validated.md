---
id: B-048
title: Bundle artifact contents (species/item/move ids) are not validated before the native build
status: open
severity: major
created: 2026-07-22
updated: 2026-07-22
found-in: 0.5.0
fixed-in:
regression-test:
links: [T-190, docs/adr/ADR-006-untrusted-bundle-build-sandbox.md]
---

# B-048 — Bundle artifact contents are not validated before the native build

## Symptom

`backend/build/bundleSchema.js` `validateBundle` (the T-026 / ADR-006 untrusted-input boundary)
validates the bundle's **structure, paths and charsets** but **not the contents of the artifacts**
(`pokedex`, `trainers`, `starters`, and `wild` beyond `wild.file`). Only the *existence* of the
four required artifacts is checked (`REQUIRED_ARTIFACTS`), never the legitimacy of the id strings
inside them.

Those id strings flow verbatim into the ROM writers and are substituted into generated C/JSON:
- species ids via `new RegExp('\\b' + speciesId + '\\b', 'g')` (`randomizer/writer.js:167-173`)
- item ids via `itemIdToName` (`writer.js:134-136`)

So a **hostile-but-well-formed** bundle (one that passes `validateBundle`) can carry a species/item
id containing RegExp metacharacters or C-breaking content, altering the substitution or injecting
text into the compiled sources. `bundleSchema.js`'s own header (lines 9-10) already flags "confining
the writers themselves to a fixed target set" as a **recommended, not-yet-implemented follow-up**;
container hardening of the builder is T-019.

Reproduction (conceptual): POST to `/api/produce` (or upload via the T-190 "regenerate from bundle"
control) a bundle whose `roms[0].artifacts.pokedex.pokes[i].species` is e.g. `SPECIES_A.*` — it
passes `validateBundle` today and reaches `writer.js`'s RegExp substitution.

**Threat scope:** requires an authenticated **and** verified user (the `/api/produce` route is behind
`requireAuth` + `requireVerified`), and the build runs on the container-hardened builder (T-019).
The T-190 "regenerate from bundle" UI does not widen this surface — an authenticated user could
already POST an arbitrary bundle to `/api/produce`. This is registered so the residual
content-validation gap is tracked rather than lost.

## Root cause

<!-- Filled during the fix. Likely: validateBundle intentionally scoped to path-traversal (T-026);
     content allow-listing (valid species/item/move id sets, or a strict C-token charset on the
     substituted fields) was deferred. -->

## Fix

<!-- Not yet fixed. A fix must add content validation for the id fields that reach the writers
     (a strict [A-Z0-9_] token charset at minimum, ideally an allow-list from base data) and ship a
     regression test that feeds a hostile-but-well-formed bundle and asserts validateBundle rejects
     it (FAIL before, PASS after). No test, no `fixed` status. -->
