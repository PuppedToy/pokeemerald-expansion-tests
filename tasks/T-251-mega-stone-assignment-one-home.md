---
id: T-251
title: Give the mega-stone assignment one home and stop it producing NaN levels
status: in-progress
type: fix
created: 2026-08-05
updated: 2026-08-05
target-version: 0.8.0
links: [B-062, B-060]
blocked-by: []
---

# T-251 — Give the mega-stone assignment one home and stop it producing NaN levels

## Context

[B-062](../bugs/B-062-mega-stones-disagree-with-the-docs.md) — the ground mega stones do not match the
documentation shipped with the run. The bug file holds the full root cause; the short version is that the
sort key was NaN for ITEM evolutions, NaN does not survive JSON, and the rule that consumes it was
written out three times either side of that boundary.

## Plan

1. Stop the cause: the level a mega evolution is filed under must always be a finite number.
2. Stop the class: one home for the assignment rule, called by the compile writer, the docs writer and
   the injector — including a faithful read-back of the `null` that JSON leaves behind, so bundles
   generated before the fix still build the ROM their own docs describe.
3. Prove it on both real bundles, then build both ROMs the way PRO does and read the bytes back.

Acceptance criteria:
- [x] `megaBaseFormLevel` never returns a non-finite level, for any evolution method (test-pinned).
- [x] A NaN level and its serialized `null` produce the same assignment (test-pinned).
- [x] `writer.js`, `writerDocs.js` and `injector/modules/megaMapItems.js` all call one function; none
      re-implements the rule.
- [x] `cd randomizer && npm test` green.
- [x] Both real bundles: every mega trainer's stone equals its `docs.viewerTrainers[trainer].reward`
      (21/21 on `bundle-735016030`, 21/21 on `bundle-2653882998`).
- [ ] Both ROMs built as PRO builds them, object-event bytes read back, owner play-tests Jagged Pass.

## Progress log

- **2026-08-05** — Task created from the presentation run. Reproduced the divergence exactly: assigning
  from the bundle as-is (`level: null`) matched the shipped docs **0/21**; restoring those levels to the
  `NaN` they were in the browser matched **21/21**. That pinned both the cause (`Number('ITEM_DAWN_STONE')`)
  and the mechanism (JSON has no NaN) without guessing.
- **2026-08-05** — Considered and rejected making the injector read the assignment straight out of
  `docs.viewerTrainers[].reward` (name → item id). It would make ROM==docs true by construction, but it
  reverses the direction of truth (the docs would drive the ROM), it cannot recover the *hidden* set for a
  redacted docs bundle, and it does nothing for `analyze.js`, which has no docs. One shared rule plus a
  faithful `null → NaN` read-back fixes the same cases without the inversion.
- **2026-08-05** — Red → green: `megaEvoLevel.test.js` + `megaAssignment.test.js` written and watched
  fail, then `megaAssignment.js` + `megaBaseFormLevel` landed and the three call sites rewired. Full suite
  green (2220 passed). Both bundles verified 21/21 against their own docs.

## Outcome

<!-- Filled when closing. -->
