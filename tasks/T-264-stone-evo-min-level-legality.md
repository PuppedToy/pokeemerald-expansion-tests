---
id: T-264
title: Honour a stone evolution's min level in the trainer legality check
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: [B-067, B-068, B-069, B-070]
blocked-by: []
---

# T-264 — Honour a stone evolution's min level in the trainer legality check

## Context

[B-067](../bugs/B-067-stone-evolutions-ignore-their-min-level.md): `isValidEvolution` gives every
`EVO_ITEM` evolution a blanket pass at any level above a hardcoded 28 and never reads the per-run
`minLevel` that `randomizer/evoLevelWriter.js` writes into it. The observed case is Wally at Route
110 (level 29) fielding a Basculegion M whose Dawn Stone gate is level 49 in that run.

## Plan

Make `isValidEvolution` read the level from the same place the rest of the pipeline does — `param`
for `LEVEL`, `minLevel` for `ITEM` — instead of switching on `method`. `randomizer/modules/wildModule.js`
already models this correctly in `megaBaseFormLevel` (B-062); reuse that precedence rule rather than
inventing a second one.

Two decisions to settle before writing code:

1. **What a stone evolution with no `minLevel` should do.** All 50 `EVO_ITEM` entries in the current
   source carry `CONDITIONS({IF_MIN_LEVEL, N})`, so the case is unreachable today, but the fallback
   decides whether a future stone evo added without a clause is permissive (keeps the old `> 28`) or
   strict. Prefer the explicit `DEFAULT_EVOLUTION_LEVEL` used by `wildModule` over a second magic 28.
2. **Blast radius on team quality.** Tightening the filter shrinks the candidate pool for every
   `checkValidEvo: true` slot and makes `devolveToLevel` walk one stage further down. Run the
   pipeline before/after and check the diagnostics for new short-team or empty-pool warnings.

Acceptance criteria:

- [x] `isValidEvolution` derives the required level from `minLevel` for `EVO_ITEM` and rejects a
      trainer level below it.
- [x] Regression test named for B-067 reproduces the Basculegion case (Basculin White-Striped,
      Dawn Stone, `minLevel: 49`, trainer level 29) — verified RED before the fix, GREEN after.
- [x] `checkValidEvo` and `devolveToLevel` are both covered: a selection filter case (Norman/Kleavor)
      and a continuity-echo case (Wally Mauville).
- [x] Re-auditing a freshly generated bundle yields 0 mons fielded below their evolution level.
      (Seed `2231547897` at `2193b400ab`: 3 → 0. Two of four sweep seeds keep a residual, both
      [B-068](../bugs/B-068-evolution-check-skipped-on-some-team-paths.md), unchanged by this fix.)
- [x] `cd randomizer && npm test` green.
- [x] Decide and record whether `wildModule.js:552` (`method === 'ITEM'` with no level check) and the
      hardcoded `checkValidEvo(..., 29 / 41)` calls at lines 568/594 are in scope or spun out.
- [x] A stone evolution requires `max(stone-unlock cap, rolled gate)`, with the level derived from the
      caps SSOT rather than hardcoded.
- [x] [B-068](../bugs/B-068-evolution-check-skipped-on-some-team-paths.md) fixed: all three
      forced-species / misclassified paths, with a structural guard over the whole template file.
- [x] [B-069](../bugs/B-069-same-seed-diverges-on-a-second-generation-in-one-process.md) fixed: the same
      seed reproduces on repeat generations in one process.
- [x] A seven-seed sweep reports 0 mons below their evolution level and 0 stone gates below the unlock
      level.
- [x] [B-070](../bugs/B-070-empty-reward-pool-crashes-the-run.md) fixed: an exhausted reward pool
      degrades instead of dying on a null dereference, and a healthy run stays byte-identical.
- [ ] Owner manual-tests a ROM built from a fixed run and confirms it is OK.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-11** — Task created from the owner's report of a Basculegion M on Wally at Route 110 in
  `bundle-2231547897.json`. Diagnosed without touching code: the mon is legal only because
  `isValidEvolution` (`randomizer/modules/utils.js:83`) matches on `method === 'ITEM' && level > 28`
  and never looks at `evo.minLevel`. Audited the whole bundle — 221 trainers — against its own
  evolution table: exactly 3 mons are fielded below their evolution level and all 3 are stone evos
  (Wally/Basculegion +20, Norman/Kleavor +16, Jessica/Kleavor +6), zero level-evo violations, which
  isolates the defect to that one clause. Registered as
  [B-067](../bugs/B-067-stone-evolutions-ignore-their-min-level.md). No code changed yet — waiting on
  the owner's go-ahead.

- **2026-08-11** — Fix implemented, TDD. `randomizer/__tests__/unit/stoneEvoMinLevel.test.js` written
  first from the bundle's real numbers and watched fail (12 of 14). `isValidEvolution` now reads the
  level instead of the method, via a new `evolutionMinLevel` helper; only the `EVO_ITEM` arm changed, so
  `EVO_LEVEL` and `param === '0'` keep their exact previous semantics. Full suite green (2298 tests).

  **Decision 1 — fallback when a stone evolution carries no `IF_MIN_LEVEL`.** Reused
  `DEFAULT_EVOLUTION_LEVEL` (25), promoted from a local const in `wildModule.js` to
  `randomizer/constants.js` so the value has one home. Rejected inventing a second magic number
  alongside the old 28. Unreachable in practice today: all 50 `EVO_ITEM` entries in
  `src/data/pokemon/species_info/gen_*.h` carry the clause.

  **Decision 2 — three copies of the rule collapsed into one.** Found a **verbatim duplicate** of
  `isValidEvolution` at `trainerSelector.js:59`, feeding the forward `tryEvolve` path — the same bug in
  a second place, and an SSOT violation. Deleted; `trainerSelector` imports from `utils`.
  `wildModule.megaBaseFormLevel` (B-062) had a third inline copy of the same param→minLevel→default
  precedence; it now calls `evolutionMinLevel`.

  **Decision 3 — wildModule, in scope.** `wildModule.js:552`'s gym-2 reward filter admitted any
  `method === 'ITEM'` evolution as "evolves by 25", the same defect one level up: a stone gated at 55
  read as early. Now reads the evolution's level against a named `GYM2_REWARD_MAX_EVO_LEVEL`. The
  hardcoded `checkValidEvo(..., 29 / 41)` calls at lines 568/594 needed no change — they are call sites
  and inherit the corrected check. Measured consequence on seed `2231547897`: the gym-2 reward and
  Shelly's reward change species (the pools were wrong before), no crash from an emptied pool.

  **Verification of the owner's exact ask.** Current master no longer reproduces the reported world for
  that seed (T-261/T-262/T-263 shifted the RNG stream), so I replayed the bundle's stored config at
  `2193b400ab` — the build that generated it — in a throwaway worktree, and got the original world
  byte-for-byte: same Wally team, same level-49 Dawn Stone gate, same 3 violations. The four files this
  task touches are identical between that commit and HEAD, so the fix drops in without dragging other
  drift. With it: Wally's slot goes `SPECIES_BASCULEGION_M` → `SPECIES_BASCULIN_WHITE_STRIPED`, the
  other five slots byte-identical, violations 3 → 0. 49 of 213 teams shift overall (a changed candidate
  pool moves the sampled index, which cascades); no team lost a member; no new errors or fatals.

  **Considered and not done — a stone-availability floor.** The old `> 28` was also a crude proxy for
  "you cannot have a stone yet". `data/maps/RustboroCity/scripts.inc:961` hands the player **all ten
  stones** right after the Rustboro rival (`CAP.RIVAL_RUSTBORO`, level 18), so the `IF_MIN_LEVEL` gate is
  the only real constraint from there on and the fix is right — including where it is now *more*
  permissive (22 of 50 stone evolutions in that run gate below 29 and were being wrongly blocked). The
  gap is trainers below level 18 against a gate below 18 (2 of 50 in that run). Not implemented: the
  Rustboro cap's home is `src/caps.c` via the injected `capLevels` map, which `utils.js` has no access
  to, and hardcoding 18 would be a fresh SSOT violation. Measured `preStoneHandout` across four seeds:
  0 in all four. Left as a known, quantified gap rather than a hardcode.

- **2026-08-11** — Two unrelated defects found while verifying, both registered, neither fixed here:
  [B-068](../bugs/B-068-evolution-check-skipped-on-some-team-paths.md) (`checkValidEvo`'s
  `EVO_TYPE_SOLO` shortcut skips the level check for a cross-family branch evolution — Koffing →
  Weezing-Galar lands in its own family and parses as solo; plus a forced-species slot that survives
  `devolveToLevel`, not yet root-caused) and
  [B-069](../bugs/B-069-same-seed-diverges-on-a-second-generation-in-one-process.md) (a second
  `runGeneration` in one process ignores the seed). B-069 bit this task directly: the first multi-seed
  sweep ran all seeds in one process and its numbers were worthless. Re-ran one process per seed —
  that is the only trustworthy way to compare seeds until B-069 is fixed.

- **2026-08-11** — Owner pulled B-068, B-069 and the deferred stone-availability floor into this task.
  Scope is now four fixes; all TDD, all verified RED→GREEN, suite green (196 suites, 2325 tests).

  **The floor: `max`, not `min`.** The owner's note read `min(18, stone evolve level)`; taken literally
  that yields `min(18, 49) = 18` and would let Wally field the Basculegion at 18 — reintroducing B-067.
  The requirement is the **maximum**: satisfy the rolled gate AND hold a stone. Implemented as max, said
  so up front.

  Applied at the point the gate is DECIDED (`applyEvoLevels`), not where it is checked — so the ROM
  clause, the docs and the check all carry one number and nothing ambient has to be threaded into
  `isValidEvolution`. Runs after the T-066 stage-gap safeguard (which could otherwise push a gate back
  under the floor) and consumes no RNG. The level stays in `src/caps.c` and arrives through `capLevels`;
  only the relation lives in `bossCaps.js` (`EVOLUTION_STONES_UNLOCK_FLAG`, `stoneUnlockLevel()`),
  alongside the existing `STATIC_UNLOCKS` map that records the same kind of script relation. Wired into
  both the bundle path (`generate.js`) and the recompute path (`writer.js`) — the latter was silently
  skipping the run's `evoConfig` too, worth a follow-up.

  **B-069 root cause: `familyTracking`.** Found by counting RNG draws at each progress boundary across
  two runs in one process (identical through the pokédex step, then +171,001 draws), then bisecting
  inside the pokédex build to `balancePokemon` (10,156 vs 9,711 draws). Two hypotheses ruled out first:
  `baseData` is not mutated (fingerprinted every field; `allPokes`/`moves` are deep-cloned) and the RNG
  *is* reseeded. The state is module-scoped and was never cleared, so it lived for the process. Now reset
  per pokédex build. Three same-seed runs in one process are byte-identical, and a seven-seed sweep gives
  the same results whether run one-per-process or all in one.

  **B-068 root cause corrected — my first diagnosis was wrong.** I had attributed the `PARTNER_STEVEN`
  case by matching the mon's index in the RESULT team against the template array; those two orders
  differ. Re-attributed by `pokeId`, there are three entry points, not two: the `EVO_TYPE_SOLO` shortcut
  in `checkValidEvo` (the Weezing-Galar case), a **named favourite** (Norman's `favourite:
  ['SPECIES_SLAKING']` resolves to a `specific` slot → the STRICT list, which `checkValidEvo` never
  filtered), and `PARTNER_STEVEN`'s legend slot being the only `TRAINER_REPEAT_ID` slot in the whole
  template file without `devolveToLevel`, on the stated assumption "legends are solo-evo" — false for 9
  high-tier mons in the audited run (Cosmoem→Solgaleo/Lunala, Poipole→Naganadel, Kubfu→Urshifu…).

  A favourite is now projected with `devolveToLevel` rather than dropped, so an early boss shows its
  signature LINE (Norman at 39 → Vigoroth) and still gets the real ace once reachable; the claim keeps
  the NAMED species' tier slot, because that is the budget the trainer means to spend on its signature.
  Megas are exempt. The `REPEAT_ID` omission is now guarded by a structural test over the entire template
  file, not just that slot.

  **A dead end worth recording:** the first cut of the `checkValidEvo` rewrite decided "is this a base
  form?" from `EVO_TYPE_SOLO` and `isLC` alone, which broke `wildModule.test.js` — its fixture has a base
  form with `isLC: false` but `type: EVO_TYPE_LC_OF_3`, and the gym-3 candidate pool emptied, then crashed
  on `sampleAndRemove` returning null. The signals can disagree, so the predicate now reads both. That
  crash is a latent robustness hole in the gym-reward picks (an empty pool TypeErrors instead of
  degrading) — untouched here, worth its own task.

  **Verification.** Original world (seed `2231547897` replayed at `2193b400ab`, with only my edits ported
  — `trainers.js` had to be patched slot-only, since T-262 changed it): Wally's slot is
  `SPECIES_BASCULIN_WHITE_STRIPED`, the other five byte-identical, 0 mons below their evolution level.
  Seven-seed sweep: 0 below evolution level, 0 stone gates below the unlock level, in every seed.

- **2026-08-11** — Scope grew once more: owner asked for the empty-reward-pool crash too, registered as
  [B-070](../bugs/B-070-empty-reward-pool-crashes-the-run.md). Five fixes in this task now.

  All 21 gym/static reward picks in `wildModule` dereferenced `sampleAndRemove`'s result without checking
  it, so an exhausted pool ended the run with `Cannot read properties of null (reading 'family')`. The
  interesting half was *why* a pool empties: every filter leads with the one-family-per-run dedup, the set
  it consults grows with each reward handed out, and unlike the tier/shape constraints that clause is a
  *preference* — a repeated family is cosmetic, an invalid reward is not. So the pool was being emptied by
  the one constraint that should yield first.

  Each reward now declares its filter once (no dedup clause) and a `takeReward` helper walks a ladder:
  deduped list → same filter without dedup → (required only) a species another reward already got →
  throw naming the reward / null + diagnostic. The required/optional split follows what downstream takes:
  the eleven gym rewards are required because `writer.js` reads `.id` off all of them for `gGymRewards[]`;
  the statics are optional because `writer.js` already falls back to the vanilla species.

  **Design point worth recording:** rung 3 (reuse a species) exists because required and optional rewards
  share pools and the required one is not always drawn first — `wallyLilycove` comes last out of the same
  pool as the three regis, so without it a thin pool would kill the run on its final draw. Found by
  writing the test for the static-degradation case and watching it throw.

  **Zero-risk verification:** rung 1 is the old code verbatim and the later rungs build nothing and draw
  no RNG until it comes back empty, so a healthy run must be unchanged. Confirmed by fingerprinting the
  full ROM output (artifacts + docs, timestamps stripped) for three seeds before and after: identical.

  Regression tests went into `wildModule.test.js` rather than a new file, to reuse its existing reward
  fixture instead of duplicating a 100-line pokémon list — that fixture is the single home of that shape.
  Two test-authoring corrections along the way: `SPECIES_NU_SOLO` also satisfies gym1's filter, so
  starving gym1 means removing both NU solos; and starving a pool via `alreadyChosenFamilies` (rather than
  by deleting mons) is what exercises rung 2.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
