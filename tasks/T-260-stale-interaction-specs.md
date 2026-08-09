---
id: T-260
title: Repair the two failing interaction specs — retire one, make the other seed-independent
status: done
type: fix
created: 2026-08-09
updated: 2026-08-09
target-version: 0.9.0
links: [B-024, T-172, T-245, docs/adr/ADR-024-single-fifo-build-queue.md, docs/adr/ADR-010-visual-regression-playwright-dev-tool.md]
blocked-by: []
---

# T-260 — Repair the two failing interaction specs

## Context

`visual-tests/interaction.spec.mjs` has two long-standing desktop failures, found while running the
harness during T-259 and confirmed present on a clean `master` before that work. They look alike in a
test report and have nothing in common underneath — investigated in this task's log:

1. **`T-172: slow-queue ROM-count warning`** — asserts `#nz-slow-queue-warning` exists. It does not:
   T-245 deliberately removed the whole slow-queue warning when ADR-024 retired the fast/slow build
   tiers. That commit removed the feature *and* its unit test (`frontend/__tests__/slow-queue-warning.js`)
   but missed this Playwright test. The test is stale — it guards a feature we chose not to have.

2. **`B-024: evolution mails below the first cap`** — fails on its own *precondition*
   (`seed-42 fixture has a box mon evolving at ≤ first cap` → null), not on its assertion. The B-024 fix
   is intact (`frontend/template.html` `generateForBoss`, `evoPrev = (i === 0) ? -Infinity : prev`); the
   test simply cannot find a case to exercise. It searches the generated fixture for a starting-box
   Pokémon whose evolution is gated at or below the first cap — and whether a seed produces one is luck.

The second is the interesting one: it means a `major` bug's regression guard has silently stopped
guarding. The fixture is gitignored and rebuilt from the current randomizer
(`visual-tests/fixtures/build-doc-sample.cjs`), so its content is not pinned — any rating, tier or
evolution-level change can remove the case again without touching the mail engine.

## Plan

Different causes, different fixes:

1. **Retire the T-172 spec.** Delete its `describe` block. The feature is gone by decision (ADR-024), so
   there is nothing to restore and nothing to re-point the test at. Note it in T-172's log so the removal
   is traceable from the task that built it.
2. **Rewrite the B-024 spec to construct its scenario instead of hunting for it.** Give real box mons an
   evolution gated exactly at the first cap and one gated at 0 (immediate/stone), then defeat the first
   boss and assert both mails appear — plus a negative control (a gate above boss 0's upper bound must
   NOT appear yet) so the test cannot pass vacuously. Seed-independent, so it guards on every fixture.
   It should call the viewer's own `evoGateLevel` rather than keeping a copy of it.
3. Correct B-024's `## Fix` regression paragraph, which describes the old fixture-hunting approach.

Acceptance criteria:
- [x] `npx playwright test interaction.spec.mjs` is fully green (all viewports), with no test skipped to
      get there.
- [x] The B-024 spec fails if the fix is reverted (`evoPrev = prev`) — verified by actually reverting it.
- [x] The B-024 spec passes against a fixture built from a seed whose box has NO low evolver (42) — i.e.
      it no longer depends on what the seed happened to roll.
- [x] No `#nz-slow-queue-warning` reference remains anywhere.
- [x] `frontend`, `backend` and `randomizer` suites stay green; B-024's bug file describes the guard that
      now exists.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-09** — Task created after investigating both failures.

- **2026-08-09** — **T-172: confirmed stale, not broken.** `#nz-slow-queue-warning` is absent from
  `config-form.js` and `index.html`. `git log -S` gives the whole story: added by
  `34301d451f feat: T-172`, removed by `296fa67cdc refactor(T-245)`, whose own message says it "drops the
  frontend 'slow queue' warning (T-172) with its SSOT drift guard". The unit test went with it;
  `visual-tests/` was missed because it is a separate dev-only harness (ADR-010) outside `npm test`.

- **2026-08-09** — **B-024: the fix is fine, the test's premise is not.** Evidence gathered before
  deciding:
  - The fix is present (`evoPrev = (i === 0) ? -Infinity : prev`), and the test's local `evoGate` helper
    is a verbatim copy of the viewer's `evoGateLevel` — so no drift between them.
  - `bossCaps` comes from the **static** `frontend/data/bosscaps.json`, so the first cap is always 8 and
    is not seed-dependent. The only variable is the box.
  - Probed the on-disk fixture: box gates are `[20, 35, 28/25/25, —, 28, 36, 18, 20, 28]` vs a first cap
    of **8**. Not a near miss.
  - Suspected a stale fixture (the file was two weeks old) — **dead end**: regenerated it and got a
    byte-for-byte equivalent box. Generation is deterministic for seed 42 and unchanged.
  - Surveyed 8 seeds by running the pokedex/starters/wild modules directly: **1 of 8** produced a box mon
    gated at or below the first cap (seed 3, Happiny→Chansey at gate 0). So the precondition is roughly a
    1-in-8 roll, and the test was only ever guarding by luck — it passed on 2026-07-09 because that
    fixture happened to contain the case.
  - Conclusion: regenerating or seed-shopping would both "fix" the red without fixing the fragility, and
    the next rating change would take it out again. Rewriting it to construct the case is the only
    version that actually guards B-024.

- **2026-08-09** — Shipped both fixes.
  - **T-172 spec deleted**, replaced by a comment naming T-245/ADR-024 so the next reader does not
    "restore" it. Confirmed no `nz-slow-queue-warning` / `slowQueueWarning` / `FAST_QUEUE_MAX_ROMS`
    reference survives anywhere in the tree.
  - **B-024 spec rewritten** to construct its scenario: three distinct box mons get one known evolution
    each — gated at exactly the first cap, gated at 0 (immediate/stone), and gated above boss 0's window.
    First two must be surfaced by defeating boss 0; the third must NOT be, and then must appear once
    boss 1 falls.
  - **Constraint hit while writing it:** the Mail engine lives in an IIFE (`template.html` line ~3237), so
    `capturedEntries` / `pokeById` / `evoGateLevel` are NOT reachable from `page.evaluate` — only the
    injected `pokes` / `bossCaps` / `wildPokes` are. First attempt called `capturedEntries()` and died on
    `ReferenceError`. That is also why the original test hand-rolled its own `evoGate` copy. Resolved by
    building the case from the globals (`pokeById` is built from `pokes` by reference at load, so mutating
    a species' `evolutions` is what `levelEvos()` reads) and dropping the duplicated gate helper
    altogether — the gates are now *chosen*, so there is nothing to recompute.
  - **The negative control is the point.** Without it the test could pass against a change that surfaces
    every evolution unconditionally; and asserting the third case appears after boss 1 proves its earlier
    absence was the window, not an unrendered list or a mistyped key.
  - Verified the guard really guards: reverted the fix to `evoPrev = prev`, rebuilt the fixture (the
    fixture embeds `template.html`, so a rebuild is required for the revert to be visible), and the spec
    failed on *"an evolution gated exactly at the first cap must be surfaced"*. Restored the fix
    (byte-identical, `git diff` clean), rebuilt, green again.
  - `interaction.spec.mjs` now: **11 passed, 0 failed** across the 5 viewports (34 skips are the
    pre-existing `test.skip` viewport gates, unchanged). Suites green: frontend 206, backend 232,
    randomizer 2232.
  - No `CHANGELOG.brooktec.md` entry: test-only maintenance, nothing user-visible.
  - Also appended a dated note to **T-172**, which was still sitting `in-progress` with its feature
    deleted underneath it. Left the status alone — closing (even as `abandoned`) is the owner's call — and
    flagged it for them instead.

- **2026-08-09** — Closed. Test-only work with nothing manually testable, and the owner explicitly
  authorized closing; the B-024 guard was proven by reverting the fix and watching it fail.

## Outcome

Both failures handled, with opposite treatments — the investigation is the substance of this task.

**T-172 slow-queue spec — deleted.** It guarded a feature that no longer exists: T-245 removed the
warning when ADR-024 retired the fast/slow build tiers, dropping the feature and its unit test but not
this Playwright test, because `visual-tests/` sits outside `npm test` (ADR-010). Replaced by a comment
naming T-245/ADR-024 so it does not get "restored". No `nz-slow-queue-warning` / `slowQueueWarning` /
`FAST_QUEUE_MAX_ROMS` reference survives anywhere.

**B-024 spec — rewritten, and now actually guards.** It was failing on its own precondition, not an
assertion: it searched the generated fixture for a box mon whose evolution is gated at or below the first
cap, which is luck (1 seed in 8). It passed in July because that fixture happened to hold the case, then
went red once seed 42 rolled a box whose lowest gate was 18 against a first cap of 8 — so a `major` bug's
regression guard had silently stopped guarding while the fix itself was intact. It now constructs the
case: three distinct box mons get one known evolution each (gated exactly at the first cap, gated at 0,
and gated above boss 0's window as a negative control that must not appear until boss 1 falls, then must).
Seed-independent, so it holds on every fixture.

**Deviations from the plan** — one, forced by the code: the plan said the spec should call the viewer's own
`evoGateLevel` instead of keeping a copy. It cannot: the Mail engine is inside an IIFE, so
`capturedEntries` / `pokeById` / `evoGateLevel` are unreachable from `page.evaluate` (the first attempt
died on `ReferenceError`) — which is also why the original hand-rolled its own copy. Resolved better than
planned: the case is built from the injected globals and the duplicated helper is gone entirely, because
the gates are now chosen rather than discovered.

**Verification** — the criterion that mattered: reverted the fix to `evoPrev = prev`, rebuilt the fixture
(it embeds `template.html`), and the spec failed on *"an evolution gated exactly at the first cap must be
surfaced"*; restored byte-identical, rebuilt, green. `interaction.spec.mjs`: 11 passed, 0 failed across
the 5 viewports (34 skips are the pre-existing viewport gates). Suites green: frontend 206, backend 232,
randomizer 2232. No changelog entry — test-only, nothing user-visible.

**Follow-ups** — no new task files, two things handed to the owner instead:
- **T-172** is still `in-progress` with its feature deleted underneath it. A dated note was appended; the
  status was deliberately left alone because closing (even as `abandoned`) is the owner's call. It wants
  `abandoned`, not `done`.
- **`visual.spec.mjs` pixel baselines** fail locally (41, all `toHaveScreenshot`) on this machine's font
  rendering — pre-existing and already recorded in T-172's own July log. Untouched here; the baselines
  Playwright auto-wrote for `presets-modal` during a full run were deleted rather than committed, so this
  machine's drift does not become the reference.
