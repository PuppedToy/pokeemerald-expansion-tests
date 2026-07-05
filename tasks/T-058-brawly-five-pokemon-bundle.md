---
id: T-058
title: Analyze why Brawly has 5 pokemon instead of 6 in a bundle
status: done            # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-05
updated: 2026-07-05
target-version: 0.5.1
links: [B-019]          # related bug/ADR/PR ids or paths
blocked-by: []
---

# T-058 — Analyze why Brawly has 5 pokemon instead of 6 in a bundle

## Context

In a randomizer bundle produced by the pipeline, the gym leader Brawly ends up with a
team of 5 pokemon instead of the expected 6. We need to find the root cause: whether it
originates in the bundle data itself (upstream of the writers) or in how the trainer team
is generated/written.

The bundle for this investigation is dropped by the owner into this task's assets folder:
`tasks/assets/T-058/`. It is clean pipeline input — per the writer notes in
[CLAUDE.md](../CLAUDE.md) (Randomizer pipeline → ROM builds), corruption almost always
originates in the writers (`randomizer/writer.js`), not the bundle, so both the bundle's
Brawly entry and the trainer-writing path are in scope.

## Plan

1. Wait for the owner to drop the bundle in `tasks/assets/T-058/`.
2. Inspect Brawly's entry in the bundle: does it already carry 5 or 6 pokemon?
   - If 5 → the fault is upstream (team generation in the analyzer/rebalancer).
   - If 6 → the fault is in the writer path (`randomizer/writer.js` / trainer writing).
3. Trace the responsible code path and identify the root cause.
4. If it is a defect, register it via `/bug-new` with a failing regression test
   (iron rule) before proposing a fix.

Acceptance criteria:
- [x] Root cause of Brawly's 5-pokemon team is identified and documented in this log.
- [x] It is determined whether the fault is in the bundle data or the writer path.
- [x] If a defect, a bug is registered with a reproducing regression test.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-05** — Task created. Created `tasks/assets/T-058/` for the owner to drop the bundle; analysis pending the bundle.
- **2026-07-05** — Bundle received (`tasks/assets/T-058/bundle.json`, seed 1151989835, difficulty 7, rebalance on). **Root cause found and deterministically reproduced.**

  **Where the mon is lost.** The bundle already carries the fault: `artifacts.trainers.trainersData` has Brawly (`TRAINER_BRAWLY_1`) with **6** team slots, but `docs.trainersResultsSimplified` shows only **5** resolved mons (Passimian, Sawk, Pancham, Machop, Timburr). So the drop happens during *team resolution* (analyzer/writer), upstream of the ROM writers — not in the ROM-writing step.

  **Which slot is dropped.** The 6th slot — the only constrained "specific" one:
  `{specificIfTier: SPECIES_MAKUHITA, contextualTier: [PU], type: [FIGHTING], abilities: [GUTS], checkValidEvo: true, nature: Adamant, item: Flame Orb}`. It resolves to nothing.

  **Why it resolves to nothing** (verified against the bundle's pokedex with the real chooser code):
  - `nearestCap(19)` = 18. The `specificIfTier` gate ([trainerSelector.js:117-133](../randomizer/modules/trainerSelector.js#L117-L133)) requires `TIER_SEQ.indexOf(base rating.tier) <= TIER_SEQ.indexOf(contextual.tier)`. Makuhita's base `rating.tier` is **NU** but its contextual tier at cap 18 is **PU** (weaker) → `NU <= PU` is false → **Makuhita never qualifies for its own slot**, and it's also excluded from the loose fallback pool for the same reason.
  - Falling back to the loose pool (`contextualTier: [PU]` → auto-tier-down PU→ZU→MAGIKARP) needs a Fighting + GUTS pokemon whose contextual tier equals the requested weak tier **and** whose base tier is equal-or-weaker, that also passes `checkValidEvo@19` and isn't in a family already on the team. The whole game has only 11 Fighting+GUTS mons; every one fails: base tier stronger than the weak contextual tier (Makuhita/Tyrogue/Machop/…), or family already used (Machop, Timburr families), or invalid evo. **Loose survivors at PU / ZU / MAGIKARP = 0 / 0 / 0.**
  - Slot 6 has **no explicit `fallback` array**, so `selectWithAutoFallback` ([trainerFallback.js:17-61](../randomizer/modules/trainerFallback.js#L17-L61)) exhausts auto-tier-down and returns `null`.
  - On `null`, the team-building loop **silently skips the slot** — `console.error(...)` then `return` inside the `forEach` ([writer.js:578-584](../randomizer/writer.js#L578-L584); mirrored in [writerDocs.js:256](../randomizer/writerDocs.js#L256)) — leaving 5 mons with no last-resort filler.

  **Reproduction:** loading the bundle's pokedex + the real `createChooser`/`selectWithAutoFallback` and re-running slot 6 with the 5 picked mons on the team → **null in 200/200 attempts** (deterministic; scratchpad `repro-brawly.js`, `diag-pool.js`).

  **Two layered defects:**
  1. *Definition-level*: the `specificIfTier: MAKUHITA + contextualTier: [PU]` gate is self-defeating (base NU can never be `<=` contextual PU), and the slot has no `fallback` to catch the miss.
  2. *Systemic*: an unresolvable slot is silently dropped, so a boss/gym leader can ship with fewer than 6 — there is no "any legal mon" last resort.

  Next: register a bug (regression-test iron rule) and agree the fix direction with the owner before implementing.
- **2026-07-05** — Owner chose the minimal, targeted fix: "just add the proper fallback for Brawly's Makuhita slot." Registered [B-019](../bugs/B-019-brawly-five-pokemon-team.md).
  - **Red:** added regression test `randomizer/__tests__/unit/trainersBrawlyFallback.test.js` — forces the kept-gym-type branch (`gymsTypeChanged: 0`) so Brawly hits the `specificIfTier: SPECIES_MAKUHITA` slot, then asserts the slot carries a non-empty `fallback` with no re-imposed `specificIfTier`. Confirmed it FAILS on the fallback assertion (slot 6 is Makuhita-specific and team has 6 slots — those sub-assertions pass — but `fallback` is undefined).
  - **Green:** added a `fallback` to the Makuhita branch in [trainers.js:1656-1664](../randomizer/trainers.js#L1656) — a generic typed slot (`{ ...getBossPreset('BRAWLY')[5], type: [gymMainTypes[1]], breedTier: 'perfect' }`) that drops the specific/GUTS/item constraints, mirroring the changed-type branch. Regression test now passes.
  - **Verified against the actual bundle:** re-running slot 6 with the fix (bundle pokedex + real chooser) resolves 200/200 → Crabrawler / Meditite / Medicham (was null 200/200 before). Full suite green (`cd randomizer && npm test`): 621 passed, 1 skipped.
  - Changelog: added a Fixed line under `[Unreleased]` (B-019, T-058).
  - **Not manually testable here** (ROM build needs the builder machine — no GBA toolchain locally, see [[project_no_gba_toolchain_ci_verifies]]). Awaiting owner confirmation to close T-058 / B-019.
- **2026-07-05** — Owner confirmed close. Marked [B-019](../bugs/B-019-brawly-five-pokemon-team.md) `fixed` (fixed-in 0.5.1) and this task `done`; committed on `feature/T-058-brawly-five-pokemon-bundle` and merged `--no-ff` into `master`.

## Outcome

Diagnosis-and-fix task, both delivered. Diagnosed why Brawly shipped with 5 pokemon in the
owner's bundle (`tasks/assets/T-058/bundle.json`): his 6th slot's kept-gym-type branch is a
`specificIfTier: SPECIES_MAKUHITA` pick with **no `fallback`**, and Makuhita's base tier (NU)
exceeds its contextual tier (PU) at Brawly's level, so it can never satisfy its own tier gate
while the constrained loose pool (Fighting + GUTS + weak tier + family-dedup) is empty — leaving
`selectWithAutoFallback` to return null and the build loop to silently drop the slot.

Fix (owner chose the minimal, targeted route): gave the Makuhita branch a generic Fighting
`fallback` in [trainers.js](../randomizer/trainers.js#L1656), mirroring the changed-type branch,
so the slot is always fillable. Registered [B-019](../bugs/B-019-brawly-five-pokemon-team.md)
with regression test `randomizer/__tests__/unit/trainersBrawlyFallback.test.js` (FAIL before,
PASS after); verified against the actual bundle (slot resolves 200/200). Full suite green.

No follow-ups spawned. Note for future work: the *systemic* variant — the silent-drop of any
unresolvable boss slot in `writer.js`/`writerDocs.js` — was left unaddressed by owner's choice;
open a new task if a general last-resort filler is wanted.
