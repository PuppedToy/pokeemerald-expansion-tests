---
id: T-251
title: Give the mega-stone assignment one home and stop it producing NaN levels
status: done
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
- [x] Both ROMs built as PRO builds them, object-event bytes read back.
- [x] Owner play-tests Jagged Pass and confirms. — confirmed 2026-08-05.

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
- **2026-08-05** — Built both ROMs on the PRO box the way PRO builds them (`make.js --bundle=… --full-rom`,
  inject mode, the box's own `base/`). Production was **not** touched: the build ran in a throwaway
  `/opt/emerald/.t251` whose `base/ src/ include/ data/ backend/ …` were relative symlinks into the real
  tree and whose only real content was a copy of `randomizer/` + `make.js`. Two things had to be handled:
  the box has no `randomizer/injector/sources.js` yet (T-249 is not deployed), so its own
  `megaMapItems.js` got the same delegation patch rather than my T-249 copy; and the scratch dir must
  **not** symlink `.git`, or `checkInjectInputsClean` sees the whole of `src/` as deleted and aborts.
  Scratch removed afterwards and the four production files re-checksummed unchanged.
- **2026-08-05** — Byte-level proof, reading `<Map>_ObjectEvents[i].trainer_sight_or_berry_tree_id`
  straight out of the built images against the bundles' own docs: **21/21 on both ROMs**. The same reader
  over the ROM the owner played (`rom-1.gba` from the presentation archive) reports **0/21** and names
  Jagged Pass as `doc=Pidgeotite / rom=Scizorite`, which is exactly the symptom reported.
- **2026-08-05** — Owner play-tested Jagged Pass on the rebuilt presentation ROM and confirmed the stone is
  the documented one. Closing. Landed on `master` as a cherry-pick of the two T-251 commits only: the task
  was developed on top of the still-`in-progress` [T-249](T-249-client-side-offline-injector.md) branch, and
  merging the branch would have dragged six unrelated commits in with it (owner's call).

## Outcome

Shipped as planned, in two parts — the cause and the class:

- `megaBaseFormLevel()` (`randomizer/modules/wildModule.js`) cannot return a non-finite level. A non-`LEVEL`
  evolution uses its `minLevel`, falling back to the default evolution level. This is the fix that matters
  going forward: no run can write a `NaN` level into a bundle again.
- `randomizer/megaAssignment.js` is the assignment rule's only home. `writer.js`, `writerDocs.js` and
  `injector/modules/megaMapItems.js` all call it; none re-implements it. Its `megaEvoLevel()` reads a
  serialized `null` back as the `NaN` it was, which is what lets a bundle generated *before* the fix still
  build the ROM its own documentation describes — the presentation bundle went from 0/21 to 21/21 without
  regenerating it.

Deviations from the plan: none in substance. One approach was considered and rejected mid-task (having the
injector read the assignment out of `docs.viewerTrainers[].reward`) — see the log for why.

Follow-ups: none spawned. Worth noting for whoever next crosses this boundary: the general hazard is that
the docs are computed in the browser and the ROM on the box, with `JSON.stringify` between them, so a value
that is not JSON-representable makes the two disagree while the code that computes them is identical. That
is recorded in [B-062](../bugs/B-062-mega-stones-disagree-with-the-docs.md)'s root cause rather than as a
new task.
