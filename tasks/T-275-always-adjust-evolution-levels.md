---
id: T-275
title: Make evolution-level adjustment unconditional (drop the on/off toggle)
status: in-progress    # proposed | in-progress | done | abandoned
type: refactor         # feature | fix | refactor | docs | chore
created: 2026-08-12
updated: 2026-08-12
target-version: 0.9.0
links: [T-052, randomizer/docs/randomization-options.md]
blocked-by: []
---

# T-275 — Make evolution-level adjustment unconditional (drop the on/off toggle)

## Context

T-052 (Step 7) shipped the *Evolution levels* category with an **on/off toggle** (`evoLevels.enabled`)
on top of its tuning knobs: off ⇒ keep the base game's evolution levels untouched. The owner decided
the feature is no longer optional — every run always rebalances evolution levels with the algorithm,
and only *how* it does so stays configurable (min/max, deviation, stage spacing, the Advanced tier
tables).

The setting is only a gate: `randomizer/generate.js makePokedex` skips `applyEvoLevels` when it is
false. Removing the gate is what makes "always ON" true for every caller (browser worker, backend
generator, determinism tests) and for any **legacy config** still carrying `enabled: false` — a saved
session JSON, or a bundle regenerated from an older run.

## Plan

Remove the option from the three places it lives, keeping the tuning surface untouched:

1. **Frontend** (`frontend/js/config-form.js`) — drop the `#evo-enabled` checkbox and its
   label/`toggle-wrap`, the `enabled` key from `EVO_LEVELS_DEFAULT` / `_readEvoLevels()` /
   `_setEvoLevels()`, the show/hide gating of `#evo-tuning`, and the change listener. The category's
   descriptive copy stays (no text rewrites); the tuning controls are now always visible.
2. **Bundle** — with `enabled` gone from `_readEvoLevels()`, the config a run serializes no longer
   carries the setting at all.
3. **Pipeline** (`randomizer/generate.js`) — `makePokedex` always calls `applyEvoLevels`, so a legacy
   `enabled: false` in an imported config is inert rather than switching the feature off.

No user-facing text changes; no changes to the algorithm or to `evoLevelWriter.js`.

Acceptance criteria:
- [x] A config carrying `evoLevels.enabled: false` still comes back with adjusted evolution levels
      (regression-style unit test on the real `makePokedex`, red before the change).
- [x] No `#evo-enabled` control exists in the frontend and no code reads `evoLevels.enabled`.
- [x] The *Evolution levels* tuning controls (scalars, stage spacing, Advanced tables) are always
      visible and unchanged, and still round-trip through save/load.
- [x] `randomizer/docs/randomization-options.md` no longer documents `enabled`.
- [x] `cd randomizer && npm test`, `cd frontend && npm test`, `cd backend && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-12** — Task created. Mapped every reference to the setting: the toggle + read/set/sync/listener
  in `frontend/js/config-form.js`, the summary row in `frontend/js/app.js`, the gate in
  `randomizer/generate.js makePokedex`, the doc row in `randomizer/docs/randomization-options.md`, and the
  structural id list in `frontend/__tests__/config-form.test.js`. `backend/generator.js` and
  `frontend/js/randomizer-worker.cjs` only forward `cfg.evoLevels` verbatim — nothing to change there.
- **2026-08-12** — TDD: added `randomizer/__tests__/unit/evoLevelsAlwaysApplied.test.js`, which drives the
  real `makePokedex` with a stubbed pokédex module and a legacy `{ enabled: false }` config. Red first
  (levels stayed at the base-game `16`), then green by deleting the gate. `makePokedex` is now exported
  from `generate.js` as the test seam (it was private).
- **2026-08-12** — Frontend: removed the toggle markup (keeping its description line as the category's
  intro copy — no text rewritten), the `enabled` key from the defaults/read/set, the `#evo-tuning`
  show/hide, and the listener. The Review/Run-details summary keeps its **Evolution levels** row, now a
  constant `Adjusted`, so the run summary still states the rule instead of silently losing a line.
- **2026-08-12** — Spec change recorded for the two tests that pinned the old surface: the id list in
  `config-form.test.js` (now asserts `#evo-enabled` is *absent*) and the `evoLevels` fixture in
  `config-roundtrip.test.js` (dropped the dead key). Two more the change made red, both spec changes in
  the same direction: `flex-gap-toggle.test.js` (T-227's guard on `#evo-tuning`'s show/hide — now pins
  that nothing hides it at all) and `config-review-completeness.test.js` (T-213's drift guard —
  `evoLevels` joins the knobs a headline row summarises, like `mutationProbs`). All three suites green:
  randomizer 2486 passed / 23 skipped, frontend 249, backend 240. `node build.js` clean.
- **2026-08-12** — Browser smoke check (throwaway Playwright script against a FAKE_BUILD server, not kept):
  on `/randomizer` the *Evolution levels* category now holds **zero** checkboxes, its tuning + Advanced
  panel render and open with the toggle gone, the saved config's `evoLevels` keys are
  `min/max/deviation/stageAdjustments/baseRanges/preEvoModifiers` (no `enabled`), an edited min survives to
  storage, and the console is clean — so nothing was left querying `#evo-enabled`.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
