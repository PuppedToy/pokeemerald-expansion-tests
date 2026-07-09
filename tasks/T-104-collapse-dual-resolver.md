---
id: T-104
title: Collapse the writer.js / writerDocs.js dual resolver into one shared module
status: proposed
type: refactor
created: 2026-07-09
updated: 2026-07-09
target-version: 0.8.0
links: [T-083, T-103]
blocked-by: [T-103]
---

# T-104 — Collapse the writer.js / writerDocs.js dual resolver into one shared module

## Context

`writer.js` (`:543-802`) and `writerDocs.js` (`~230-360`) implement the same ~250-line team
resolution loop and have drifted before (documented in `modules/trainerAbility.js:1-13`). The new
engine must have exactly one resolution path. Doing this refactor first — on the *current* behaviour,
guarded by tests — de-risks the rewrite by giving us a single seam to replace.

## Plan

- Extract the shared per-trainer resolution loop (select → moveset → item → nature → ability →
  order → battle-type stamp) into one module both the ROM-writing path and the docs path call.
- Preserve current outputs exactly (this is a pure refactor): the ROM `.party` and
  `docs.trainersResultsSimplified` must be byte-identical to before for a fixed seed.
- Add a determinism/parity test (same seed → identical ROM-party and docs).

Acceptance criteria:
- [ ] One shared resolver module; `writer.js` and the docs path both use it (no duplicated loop).
- [ ] Byte-identical output vs. pre-refactor for fixed seeds (regression test).
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
