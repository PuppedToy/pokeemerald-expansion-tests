---
id: T-043
title: Cross-ROM boss-team determinism guarantee test
status: done
type: chore
created: 2026-07-01
updated: 2026-07-01
target-version: 0.5.1
links: [T-042, B-017]
blocked-by: []
---

# T-043 — Cross-ROM boss-team determinism guarantee test

## Context

Shared-trainer soul-link bundles are meant to give the **same trainer the same
team across every ROM** of the session (per-slot reseeding — see
`randomizer/docs/trainer-determinism.md`). The only *legitimate* inter-ROM
variation is a slot whose species is committed by per-ROM game state:
- the rival (team anchored to the starter triangle / encounter),
- any trainer with a `TRAINER_POKE_ENCOUNTER` / starter-linked (`TRAINER_POKE_STARTER_*`) / per-ROM-reward slot,
- mega trainers, whose mega availability depends on **per-ROM** wild mega discovery (`wildFoundMegaEvos`).

T-042 proved this guarantee is currently **broken**: "Grunt Rusturf Tunnel" (no
committed slot) gets a different team in every ROM because evolution levels are
re-rolled per ROM inside `writerDocs` (`applyEvoLevels` mutates the shared
pokedex under a per-ROM `rng.seed(romSeed)`), which silently perturbs each ROM's
`checkValidEvo`-filtered candidate pool. See [T-042](T-042-trainer-illegal-evolved-mon.md)
for the full root-cause analysis and RNG replay.

The owner's concern is broader than the one Ludicolo: *what else* is altering
teams that should be fixed across ROMs? This task builds the automated guarantee
that answers that question and keeps answering it — a regression net for the
whole class of unjustified inter-ROM nondeterminism, and the regression test that
lets the T-042 bug be closed.

This task is the **testing/guarantee half**; the concrete evo-level fix lives in
T-042. Work interleaves: build the test (expect RED now) → fix T-042 → iterate
until the test is 100% green.

## Plan

Build a deterministic, headless cross-ROM boss-team comparison test.

Approach:
1. **Extract the shared generation loop** (shared modules → per-ROM `writerDocs`)
   into a single reusable function used by BOTH the worker/generator and the test,
   so the test exercises the *real* code path rather than a drifting copy. (This
   refactor also serves the T-042 fix.)
2. Generate a shared-trainer soul-link headlessly with a fixed seed
   (target config: `numPlayers=3`, `romsPerPlayer=3`, shared pokedex + trainers).
   Reuse whatever base data the existing integration tests use to run the full
   parse+rate pipeline.
3. Enumerate boss trainers from `randomizer/bossCaps.js` `BOSS_CAP_TRAINERS`.
4. For each boss, collect its resolved team (species + relevant attributes) from
   every ROM's `docs.trainersResultsSimplified`.
5. Assert **team identity across all ROMs**, EXCLUDING trainers with a legitimate
   per-ROM dependency. The exclusion set is **derived from the trainer template**
   (presence of a committed/per-ROM/mega slot), NOT a hardcoded name list, so it
   stays correct as trainers evolve. Rival falls out of this rule automatically.
6. Report every offending trainer with a per-ROM team diff (so failures are
   actionable), and iterate the fix until the assertion is 100% green.

Design notes / decisions to settle while implementing:
- Mega trainers: decide between excluding them or comparing only their non-mega slots.
- Runtime: the suite runs in <2 s; a full 3×3 (9-ROM) generation may exceed that.
  Measure; if needed, mark as a slower integration test or trim the config to the
  smallest one that still exposes divergence (≥2 ROMs, shared trainers).

Acceptance criteria:
- [x] A headless generator entry point produces a shared-trainer soul-link bundle in-test (no browser, no file I/O to game sources). — `randomizer/generate.js` + pre-parsed `base-data.json` + `fs`-write mock; run leaves the working tree clean.
- [x] The test enumerates boss trainers and derives the legitimate-exclusion set from templates (not names). — `bossCaps.BOSS_CAP_TRAINERS`; exclusion via `slot.special`/`encounterIds`/`tryMega`/`isMega`/`megaTier`.
- [x] The test asserts identical teams across ROMs for all non-excluded bosses and prints actionable diffs on failure.
- [x] The test FAILS on current `master` (documents the pre-fix RED state). — 5/7 comparable bosses diverged.
- [x] After the T-042 fix, the test PASSES at 100% for the target config; runtime impact measured and acceptable. — GREEN; ~61 s, gated behind `npm run test:determinism`, fast suite unchanged (~1.5 s, 1 skipped).
- [x] Any *additional* nondeterminism sources surfaced beyond the evo-level bug are logged and fixed/justified. — none: all 5 diverging bosses were resolved by the single B-017 evo-level fix.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-01** — Task created. Spun off from [T-042](T-042-trainer-illegal-evolved-mon.md) after the owner asked for a standing guarantee that inter-ROM team differences are always justified. Proposed; will start RED (expected to fail on current master) and iterate alongside the T-042 fix.
- **2026-07-01** — Started (in-progress). Branch `feature/T-043-cross-rom-boss-determinism-test`.
  - **De-duplication (no test double).** The generation orchestration was **duplicated** between `frontend/js/randomizer-worker.cjs` (canonical — emits the app bundle; the reported bundle came from it, difficulty 7) and `backend/generator.js` (a transitional Phase-G artifact, slated for deletion). They had even **diverged** (difficulty default `7` vs `'fair'`, `showExactPositions` honored vs ignored, unshared `trainingBaseSeed` `romSeed` vs `null`). Extracted the algorithm into a single source of truth, **`randomizer/generate.js`** (`runGeneration(cfg, mcfg, sessionId, hooks)`), and rewired both callers to delegate. Per-caller behavior is preserved via injected hooks (`progress`, `flush`, `baseData`, `defaultBaseSeed`, `unsharedTrainingBaseSeed`, `generatedAt`), so no behavior changed. Verified behavior-preserving: full suite green (`473 passed`), worker still bundles via `buildWorker.cjs`, `backend/generator.js` parses. The determinism test imports `randomizer/generate.js` directly — it exercises the exact code the app runs, no re-implementation.
  - **Test added:** `randomizer/__tests__/integration/crossRomBossDeterminism.test.js`. Generates a shared-trainer soul-link (3 players × 3 ROMs = 9 ROMs, fixed seed) via the real path in node mode (reads game files), enumerates bosses from `bossCaps.BOSS_CAP_TRAINERS`, and asserts identical teams across ROMs. Exclusion (rival / encounter / mega) is **derived from the trainer template** (`slot.special` / `encounterIds` / `tryMega` / `isMega` / `megaTier`), not names — verified rivals carry `TRAINER_POKE_STARTER_*` / `TRAINER_POKE_ENCOUNTER` slots and are dropped. A `compared.length > 0` guard prevents a vacuous pass.
  - **Runtime:** ~64 s (runs the real parse+rate of ~1200 mons + 9-ROM generation) — far over the fast suite's <2 s budget. Gated out of default `npm test` (skipped via `RUN_DETERMINISM` env) and runnable on demand with **`npm run test:determinism`**. Default suite measured back at ~1.3 s (1 skipped).
  - **RED confirmed (as expected, pre-fix):** `5/7` non-committed-slot bosses diverge across ROMs — `TRAINER_GRUNT_RUSTURF_TUNNEL` (6 distinct teams / 9 ROMs), `TRAINER_GRUNT_PETALBURG_WOODS`, `TRAINER_BRAWLY_1`, `TRAINER_GRUNT_MUSEUM_1`, `TRAINER_GRUNT_MUSEUM_2`. Divergences are single-slot flips (e.g. VANILLITE/SPHEAL/PIPLUP) — the B-017 evo-level-reroll signature. Note: the guarantee flags **more** than just the Ludicolo trainer, exactly the broader concern the owner raised.
  - **Hermeticity.** First run mutated tracked game files (`data/maps/**/scripts.inc`, `include/constants/tms_hms.h`, `src/data/script_menu.h`, randomizer caches): the `run*Module` functions write game source under Node (`IS_NODE` guards) — the browser suppresses these via an `fs` shim yet still yields a correct in-memory bundle. Mirrored that in the test: pass the pre-parsed `frontend/data/base-data.json` as `baseData` (the exact artifact the worker fetches) **and** `jest.mock('fs')` to no-op every write (reads stay real). The test now leaves the working tree clean — verified `git status` shows no game-file changes after a run. Restored the files the exploratory runs had dirtied.
  - Next (interleaved): apply the B-017 / [T-042](T-042-trainer-illegal-evolved-mon.md) fix (roll evo levels once, deterministically, before the per-ROM docs loop; keep the ROM build writing the same levels), then re-run `npm run test:determinism` and iterate to 100% green.
- **2026-07-01** — **GREEN after the B-017/T-042 fix.** Fix rolls evo levels once per pokedex (`generate.js` `makePokedex`) and drops the per-ROM roll from `writerDocs`. `npm run test:determinism` now passes: every comparable boss (the 7 without a per-ROM slot) has an identical team across all 9 ROMs. First green run took no new work in this task — the fix landed under T-042. Fast default suite unchanged (`473 passed`, determinism skipped, ~1.5 s); determinism run stays hermetic. Harness deliverable (acceptance criteria) met; leaving in-progress until the owner confirms the end-to-end manual check tied to B-017.
- **2026-07-01** — Owner confirmed OK. **Closed (done).** Test committed as the B-017 regression; merged into `master` with the rest of the work.

## Outcome

Shipped a standing cross-ROM boss-team determinism guarantee and, in doing so, removed a real source of duplication.

- **What shipped:** `randomizer/__tests__/integration/crossRomBossDeterminism.test.js` — generates a 3×3 shared-trainer soul-link through the real path, asserts every boss without a per-ROM-dependent slot is identical across all ROMs, exclusions derived from templates. Gated behind `npm run test:determinism` (~61 s); hermetic (base-data + `fs`-write mock). It is B-017's regression test (RED→GREEN verified).
- **Enabling refactor:** the generation orchestration was duplicated (and drifted) between `frontend/js/randomizer-worker.cjs` and `backend/generator.js`. Extracted it into a single source, `randomizer/generate.js`, with both callers now thin adapters — so the test exercises exactly the code the app runs, no re-implementation. (Bonus: killed the worker/backend drift.)
- **Deviations from plan:** used `describe.skip` env-gating (`RUN_DETERMINISM`) rather than a Jest path-ignore to keep the file discoverable while excluded from the fast suite. The "compare only non-mega slots for mega trainers" question was mooted — mega trainers are simply excluded (mega availability is per-ROM wild-dependent), which was sufficient.
- **Result:** guarantee is GREEN; it found 5 diverging bosses pre-fix, all resolved by the B-017 fix, and no other nondeterminism sources. Future regressions of this class will now fail the test.
- **Follow-ups:** none. (Optional future: speed up the ~61 s run if it becomes a friction point — dominated by the real parse+rate.)

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
