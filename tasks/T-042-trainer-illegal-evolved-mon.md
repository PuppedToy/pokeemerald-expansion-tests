---
id: T-042
title: Diagnose illegal evolved mon assigned to under-levelled trainer (Grunt Rusturf Tunnel → Ludicolo)
status: done
type: fix
created: 2026-07-01
updated: 2026-07-01
target-version: 0.5.1
links: [B-017, T-043]
blocked-by: []
---

# T-042 — Diagnose illegal evolved mon assigned to under-levelled trainer (Grunt Rusturf Tunnel → Ludicolo)

## Context

A randomized bundle produced a trainer team that looks illegal. In ROM
`player-1-rom-3` (the 4th ROM of the session) the trainer **"Grunt Rusturf
Tunnel"** — whose party sits at **level 15** — was assigned a **Ludicolo**.

Ludicolo is a stage-2 line member: Lotad → Lombre (level 14) → **Ludicolo only
via Water Stone**, and the earliest a Lombre line reaches a fully-evolved
Ludicolo in normal play is well above level 15. A level-15 trainer should never
be able to field a Ludicolo. So the trainer-team assignment appears to be
placing a mon whose evolution stage is not reachable at the trainer's level.

This is an investigation task: find **why** the pipeline assigned that Ludicolo.
Do not fix anything yet — diagnose the root cause and report back to the owner
before proposing a fix.

Inputs (provided by the owner into `tasks/assets/T-042/`):
- `bundle.json` — the full randomizer output for the session that produced the ROM.
- the run's `rom-*.html` viewer for `player-1-rom-3`.

Relevant design references (do not paste — link):
- Trainer team generation lives in the randomizer pipeline (`randomizer/`).
- `randomizer/docs/trainer-determinism.md` — how shared-trainer teams stay
  consistent across a bundle's ROMs (per-slot reseeding) and the known,
  deliberately-unfixed family-dedup limitation.

## Plan

Investigation only — no code changes until the owner green-lights a fix.

1. Load `tasks/assets/T-042/bundle.json` and confirm the finding: locate
   `player-1-rom-3`, the "Grunt Rusturf Tunnel" trainer, its level, and the
   Ludicolo entry. Cross-check against the viewer HTML.
2. Trace how that trainer slot's species was selected in the pipeline
   (evolution-stage / level-cap constraints, per-slot reseeding, family dedup).
3. Determine whether the bundle already contains the illegal mon (bug upstream
   in the randomizer/rater) or whether it was introduced later by a writer
   (`writer.js` / TM / item) — per CLAUDE.md, corruption usually originates in
   the writers, so confirm which stage is at fault.
4. Report the root cause to the owner. Do NOT implement a fix in this task step
   without explicit go-ahead.

Acceptance criteria:
- [x] The finding is reproduced from the bundle (exact trainer, level, species located).
- [x] The stage responsible for the illegal assignment is identified (rater vs. writer vs. constraint gap).
- [x] A written root-cause explanation is delivered to the owner, with the code path/line(s) involved.
- [x] If a fix is warranted, a regression-test approach is outlined (bug registered via `/bug-new` before any fix).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-01** — Task created. Awaiting owner to drop `bundle.json` and the `rom-*.html` viewer into `tasks/assets/T-042/` before investigation begins.
- **2026-07-01** — Bundle + viewer received (`bundle.json` 37 MB, `player-1-rom-3.html`). Config: `runType=soullink`, `numPlayers=2`, `romsPerPlayer=3` (6 ROMs), `seed=1830319788`, shared pokedex + trainers. `player-1-rom-3` = `roms[3]` (playerIndex 1, romIndex 3, the 4th ROM).
- **2026-07-01** — **Finding reproduced.** `roms[3].docs.trainersResultsSimplified["TRAINER_GRUNT_RUSTURF_TUNNEL"]` (level 15, `isBoss:true`) contains `SPECIES_LUDICOLO` in the GRASS slot (template slot 3: `{contextualTier:["NU"], type:["GRASS"], checkValidEvo:true}`). Bundle pokedex has `SPECIES_LOMBRE → SPECIES_LUDICOLO` as `LEVEL 21` (base C data is `EVO_LEVEL 36`; the rebalancer lowered it). Ludicolo is `EVO_TYPE_LAST_OF_3` / `isFinal`.
- **2026-07-01** — **Validator is not broken.** With the current code + bundle data, `checkValidEvo(Ludicolo, 15)` correctly returns `false`. Code at bundle date (commit `09e69f4`, 2026-06-16) is byte-identical to current `utils.js`/`trainerSelector.js`. The tier-down fallback (`trainerFallback.js`) preserves `checkValidEvo`, and `bossCaps.js` does not force-evolve. So the constrained filter, fallback, and boss logic all reject Ludicolo@15 — the leak is elsewhere.
- **2026-07-01** — **Root cause: per-ROM evolution-level re-roll on a shared, serialized-once pokedex.** Evolution levels are chosen by `applyEvoLevels(pokemonList)` (`randomizer/evoLevelWriter.js`), which consumes RNG (`rng.random()`) and **mutates `evo.param` in place**. It is called at the top of `writerDocs()` ([randomizer/writerDocs.js:115](../randomizer/writerDocs.js#L115)), and the docs loop reseeds `rng.seed(romSeed)` with `romSeed = (cfg.seed ^ (i * 0x9E3779B9)) >>> 0` — **a per-ROM-index seed** — before each `writerDocs` call ([frontend/js/randomizer-worker.cjs:296-300](../frontend/js/randomizer-worker.cjs#L296-L300); same pattern server-side at [backend/generator.js:251-257](../backend/generator.js#L251-L257)). `sharedData.pokedex` is the **single shared object**, serialized once *after* the loop, so it captures only the **last ROM's** roll. Each ROM's trainer team is resolved against that ROM's transient roll; the bundle records a different (last-ROM) evolution table. RNG replay confirmed it exactly: Lombre→Ludicolo rolled per ROM = [19, 21, 17, **15**, 20, 21]; ROM[3] = **15** (so `checkValidEvo(Ludicolo,15)` passes: `15<=15`), while the bundle serialized **21** (= ROM[5], the last ROM). This also explains why the "shared" Grunt team differs across all 6 ROMs (trainer-determinism is silently defeated by the per-ROM evo-level perturbation of the candidate pool). Ludicolo is simply the borderline evolution whose rolled level straddles 15.
- **2026-07-01** — **Fix direction (NOT yet implemented — awaiting owner go-ahead):** roll evolution levels exactly once (deterministically, on the shared pokedex) *before* the per-ROM docs loop, then have `writerDocs` consume the already-set levels via the RNG-free `buildEvoLevelMapFromParams` (already written for the writer) instead of re-calling `applyEvoLevels`. Guarantees the evo levels used for every ROM's trainer resolution equal those serialized in `sharedData.pokedex`. Regression test: for every ROM, assert every trainer team member is legal against the bundle's serialized evolution levels (min evo level ≤ trainer level). Register via `/bug-new` before implementing.
- **2026-07-01** — Registered defect as [B-017](../bugs/B-017-per-rom-evo-level-reroll-breaks-shared-trainers.md) (SSOT for the root cause). Owner scoped the work into two interleaved halves: the concrete evo-level fix (this task, T-042) and a standing cross-ROM boss-determinism guarantee test ([T-043](T-043-cross-rom-boss-determinism-test.md)). Plan: build T-043 RED (fails on current master) → apply the T-042 fix carefully (must NOT change the evo levels the ROM build writes — only make them deterministic-once and consistent with the serialized pokedex) → iterate until T-043 is 100% green; then close T-042 against T-043 as its regression test. Fix implementation NOT started — awaiting owner go-ahead.
- **2026-07-01** — **Fix applied** (branch `feature/T-043-cross-rom-boss-determinism-test`). Rolled evolution levels **once per pokedex** at creation (`randomizer/generate.js` → new `makePokedex` wrapping `runPokedexModule` + `applyEvoLevels`), and removed the per-ROM `applyEvoLevels` call from `randomizer/writerDocs.js`. Levels are now a fixed property of the pokedex → identical for every ROM's trainer resolution and identical to the serialized `sharedData.pokedex`. `romSeed` no longer perturbs evo levels. Build path untouched by design (`writer.js` reads serialized levels in bundle mode, `recompute:false`). Full details + verification recorded in [B-017](../bugs/B-017-per-rom-evo-level-reroll-breaks-shared-trainers.md).
  - **T-043 determinism test: RED → GREEN.** Was 5/7 bosses diverging; now all comparable bosses identical across all 9 ROMs. Fast suite still green (`473 passed`), run hermetic (no game-file writes).
- **2026-07-01** — Owner confirmed the manual end-to-end check OK. **Closed (done).** Committed the fix in 3 commits (refactor `generate.js`, fix `writerDocs`+`makePokedex`, regression test); merged into `master` (this repo's integration branch — `develop` does not exist).

## Outcome

Diagnosed and fixed a class of bug, not just the reported symptom.

- **Root cause (B-017):** evolution levels were rolled inside `writerDocs` via `applyEvoLevels`, which mutates the **shared** pokedex under the docs loop's per-ROM `rng.seed(romSeed)`. `writerDocs` runs once per ROM, so each ROM re-rolled the levels on the shared object, but `sharedData.pokedex` is serialized once (the last ROM's roll). Teams were therefore validated against evolution data the bundle didn't keep → illegal evolved mons (the level-15 Grunt Rusturf Tunnel Ludicolo: Lombre→Ludicolo rolled 15 that ROM, serialized 21) and divergent shared-trainer teams. Proven by RNG replay: per-ROM Lombre→Ludicolo = [19,21,17,**15**,20,21], serialized = 21 (= last ROM).
- **Fix:** roll evo levels exactly once, when the pokedex is created (`makePokedex` in `randomizer/generate.js`); remove the per-ROM roll from `writerDocs`. Levels become a fixed pokedex property, consistent with the serialized bundle and with the ROM build (`writer.js`, `recompute:false` in bundle mode — build unchanged).
- **Deviation from plan:** the fix landed at pokedex-creation time (`makePokedex`) rather than "before the docs loop consuming `buildEvoLevelMapFromParams`" as originally sketched — same guarantee, cleaner seam (levels are owned by the pokedex, not re-derived). Also required extracting the duplicated worker/backend generation into a single source (`randomizer/generate.js`) so the regression test exercises the real path — see [T-043](T-043-cross-rom-boss-determinism-test.md).
- **Regression:** `randomizer/__tests__/integration/crossRomBossDeterminism.test.js` (B-017), RED→GREEN verified.
- **Follow-ups:** none required — the determinism guarantee ([T-043](T-043-cross-rom-boss-determinism-test.md)) found no nondeterminism sources beyond the evo-level roll; all 5 diverging bosses were fixed by this one change.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
