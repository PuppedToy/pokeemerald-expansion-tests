---
id: T-199
title: Rival legendary — shuffle assignment and hide it in the viewer until Juan is defeated
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [B-052, B-053]
blocked-by: []
---

# T-199 — Rival legendary — shuffle assignment and hide it in the viewer until Juan is defeated

## Context

The Ever Grande rival carries a LEGEND-tier ace that is one of the three Sky Pillar Top legendaries.
Today those three (`staticRewards.legend1/2/3`, chosen in `randomizer/modules/wildModule.js`) are BOTH
the Sky Pillar Top static encounters AND the rival aces, and the rival→legendary mapping is a fixed
positional one in `randomizer/modules/trainerSelector.js` (`PLAYER_LEGEND_TREECKO→legend1`,
`TORCHIC→legend2`, `MUDKIP→legend3`). So the rival's ace is deducible from the order the three
legendaries appear at Sky Pillar.

Two owner-requested changes:
1. **Shuffle** the three Sky Pillar legendaries before assigning one to each rival type, so the rival's
   ace is no longer positionally tied to the Sky Pillar slot order. (Owner decision: keep the pool as the
   three Sky Pillar legendaries — the ace stays catchable — only the assignment is shuffled.)
2. **Hide** the rival's legendary in the docs viewer until the player marks **Juan** (`TRAINER_JUAN_1`)
   as defeated. When shown, the Ever Grande rival's legendary slot renders "A legendary Pokémon" (nothing
   else) until Juan's per-trainer *Defeated* checkbox is ticked, then it reveals the actual species.
   (Owner decision: always-on behaviour, no config toggle.)

## Plan

**Part 1 — shuffle (pipeline).** In `wildModule.js`, after the wild sweep (so the sweep RNG stream stays
byte-identical), shuffle `[legend1, legend2, legend3]` and expose the result on `staticRewards` as
`rivalLegendTreecko / rivalLegendTorchic / rivalLegendMudkip` (a permutation of the three). Point the
`PLAYER_LEGEND_*` branches in `trainerSelector.js` at those new fields. Sky Pillar keeps `legend1/2/3`.

**Part 2a — tag the legendary slot (pipeline).** In `resolveTrainerTeam.js`, stamp `playerLegend: true`
on the resolved team member whose slot `special` starts with `PLAYER_LEGEND` (only the Ever Grande rival
uses it). It rides the spread in `buildTrainersResultsSimplified` into the viewer copy.

**Part 2b — hide/reveal (viewer, `frontend/template.html`).** In the team-render loop, a `playerLegend`
member renders a "A legendary Pokémon" placeholder plus the real row (hidden). A new
`applyLegendaryHiding()` toggles them from `nzState.trainers['TRAINER_JUAN_1']`; call it at init and at
the end of `handleDefeatChange`. Works in both viewers (browser docs + `out.html`) — it reads `nzState`,
not `bossCaps`.

Acceptance criteria:
- [x] The rival's legendary is a shuffled one of the three Sky Pillar legendaries (a permutation,
      deterministic per seed) — decoupled from the Sky Pillar positional slot. Unit test (red→green).
- [x] The Ever Grande rival's legendary member is flagged (`playerLegend`) in the viewer trainer data;
      other members are not. Unit test.
- [x] In the viewer, the Ever Grande rival's legendary reads "A legendary Pokémon" until `TRAINER_JUAN_1`
      is marked defeated, then reveals the species; verified manually in the browser docs (owner OK).
- [x] `cd randomizer && npm test` green; browser bundle rebuilt (`node build.js`).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created. Mapped the pipeline: legendary pool + `legend1/2/3` sampling
  (`wildModule.js:655-678`), fixed positional rival mapping (`trainerSelector.js:214-219`), Sky Pillar
  statics (`wild.js:613-618`), viewer team render + `nz-defeat` checkbox / `nzState` engine
  (`frontend/template.html`), Juan = `TRAINER_JUAN_1` (`bossCaps.js:58`, `trainers.js:3277`). Owner
  decisions locked: (1) shuffle the three Sky Pillar legendaries among the rivals; (2) hide-until-Juan is
  always-on (no config toggle).

- **2026-07-25** — Implemented (TDD, Red→Green):
  - **Part 1 (shuffle):** `wildModule.js` now shuffles `[legend1,legend2,legend3]` into
    `staticRewards.rivalLegend{Treecko,Torchic,Mudkip}` AFTER the wild sweep (so the sweep RNG stream
    stays byte-identical — only 2 new draws, at the very end). `trainerSelector.js` maps
    `PLAYER_LEGEND_*` to those, with a fallback to `legend1/2/3` for pre-T-199 bundles. Sky Pillar keeps
    `legend1/2/3`. Tests: `wildModule.test.js` (permutation, determinism, actually-shuffles),
    `trainerSelector.test.js` (remap). Updated the "distinct families" test to exclude the deliberate
    rivalLegend aliases (spec change, documented in-test).
  - **Part 2a (tag):** new `isPlayerLegendSpecial` in `modules/utils.js`; `resolveTrainerTeam.js` stamps
    `playerLegend` on the resolved member. Tests: `playerLegendTag.test.js` (predicate + viewer-copy
    plumbing through `buildTrainersResultsSimplified`).
  - **Part 2b (viewer):** `frontend/template.html` renders a "A legendary Pokémon" placeholder + the real
    row (hidden) for a `playerLegend` member; `applyLegendaryHiding()` flips them from
    `nzState.trainers['TRAINER_JUAN_1']`, called at init and in `handleDefeatChange`. Real row is a
    `<template>`-free hidden `.trainer-poke` (display:none ⇒ not clickable while hidden). Added a passing
    Playwright interaction test in `visual-tests/interaction.spec.mjs`.
  - Full fast suite green (1656 passed). Rebuilt `node build.js` (gitignored bundle/base-data) + the
    seed-42 docs fixture so the browser + fixture carry the changes.
- **2026-07-25** — Verification findings (all pre-existing, NOT caused by T-199):
  - `RUN_DETERMINISM=1` shows 3 RED tests in `reverseOrderContinuity` (Tate & Liza) and the B-024
    evolution-mail interaction test. Confirmed on a stashed `master` baseline: byte-identical failures →
    seed-pinned regression tests drifted against a regenerated `base-data.json`. Registered as **B-052**.
    T-199's shuffle runs after `STARTER_EXTRA`/sweep, so it can't perturb these seeds (verified).
  - Playwright dead-end worth recording: marking a LATE boss (Juan = Badge 8) fires the mail engine's
    "mark earlier bosses too?" `confirm()` (`template.html:3386`); headless auto-dismiss un-checks it.
    The interaction test accepts the dialog (`page.on('dialog', d => d.accept())`) to mark Juan for real.
- **2026-07-25** — Owner manual-testing surfaced a separate pre-existing defect in T-197's Rival May/Brendan
  toggle (ignored until a starter is picked). Fixed on this branch as **B-053** (one-line `applyStarterRivals`
  predicate) with a Playwright regression test; the sibling `T-082` "Next boss" test was adapted to the new
  default visibility (targets the visible rival variant). Both T-199 and B-053 now await the owner's manual OK.

## Outcome

Shipped (owner manual-tested and confirmed OK, 2026-07-25):
- **Part 1:** `wildModule.js` shuffles the three Sky Pillar legendaries into
  `staticRewards.rivalLegend{Treecko,Torchic,Mudkip}` (after the sweep, so the wild RNG stream is
  unperturbed); `trainerSelector.js` maps `PLAYER_LEGEND_*` to them (fallback to `legend1/2/3` for
  pre-T-199 bundles). The rival's ace is no longer positionally tied to the Sky Pillar slot order but
  stays one of the three (still catchable).
- **Part 2:** `resolveTrainerTeam.js` tags the legendary slot (`playerLegend`, via
  `isPlayerLegendSpecial` in `utils.js`); the docs viewer (`template.html`) renders it as
  "A legendary Pokémon" until Juan (`TRAINER_JUAN_1`) is marked defeated, then reveals it.
- Tests: `wildModule.test.js`, `trainerSelector.test.js`, `playerLegendTag.test.js`, and a Playwright
  interaction test in `visual-tests/interaction.spec.mjs`. Fast suite 1656 green.
- Discovered (pre-existing, not caused here): seed-pinned determinism + B-024 interaction tests drift →
  **B-052**. Fixed the T-197 rival-gender toggle defect found during manual test → **B-053**.
No follow-ups spawned beyond B-052 (left open for triage).
