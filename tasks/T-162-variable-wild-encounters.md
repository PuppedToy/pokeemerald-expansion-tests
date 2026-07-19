---
id: T-162
title: Variable wild encounters per zone (deterministic vs classic) via sweep generation
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-19
updated: 2026-07-19
target-version: 0.6.0
links: [T-052, T-063]
blocked-by: []
---

# T-162 — Variable wild encounters per zone (deterministic vs classic) via sweep generation

## Context

Requested by the owner. Two coupled goals:

1. Rework how wild-encounter randomization is generated. Today it is a **two-stage, text-substitution**
   design: `runWildModule` (`randomizer/modules/wildModule.js`) picks ONE species per hand-authored
   template species into a flat `replacementLog`, and `writer.js` (`substituteWildSpecies`, L159-174)
   does a **global find/replace over `src/data/wild_encounters.json` as text**. Each zone/method in that
   committed JSON template repeats a single species across all its slots (12 land, 5 surf, 2/3/5 fishing).
   Consequences: 1 template ⇒ 1 species broadcast everywhere (super-rod "sharing" is an emergent side
   effect); an empty pool silently leaks the template species into the ROM; levels/rates/slot-counts are
   frozen. The owner wants this **generated from scratch** (build the `mons[]` from code) instead of
   patched.

2. Add a frontend **"wild encounter type"** option (two `radio-card` boxes like the run-type selector):
   - **deterministic** (left, default): 1 species per zone/method — predictable per run.
   - **classic** (right): several species per zone (random which you meet). Selecting it reveals a
     numeric input "how many pokémon per zone?" (default **5**).

### Feasibility gate (done — VIABLE)

Cross-checked demand (127 randomizable slots in `wild.js`) against supply (families per `tier×evo`
bucket in `pokes.json`, using the code's real semantics: `rating.bestEvoTier` + evo-stage flags):

| Bucket | Deterministic demand | Supply (families) |
|---|---|---|
| RU\|LC | 13 excl / 87 union | 138 |
| RU\|{LC,NFE,SOLO} (dominant `LC_NFE_OR_SOLO_AVERAGE` ×63) | 63 | ~209 |
| RU\|FINAL | 16 | 139 |
| UU\|FINAL | 6 | 140 |
| UBERS\|{FINAL,SOLO} (Victory Road) | 4 | 44 |
| NU\|LC | 13 | 27 |

Deterministic (N=1): picks ≪ supply everywhere → zero forced duplication. Classic (N=5): land demand
~×5 (~165 picks) still absorbed by the large early buckets; duplication only in the most concentrated
buckets and, by the sweep + regeneration design, spread across all zones. The GBA JSON schema already
supports heterogeneous slots (proven by Granite Cave B2F `rock_smash`: 2 species + per-slot level
ranges), so variable-N needs no format change — only the writer and config.

## Owner decisions (2026-07-19)

- **Scope of N = "everything that fits":** land = N, surf = min(N,5), old rod = min(N,2), good rod =
  min(N,3). Super rod and static/legendary encounters are **unchanged** (excluded from the sweep).
- **Rarity = equiprobable:** per-slot probabilities are hard-coded GBA engine constants (not editable
  via JSON), so equiprobability is approximated by **grouping slots** (greedy balance) to equalise each
  species' summed probability. When #species = #slots (e.g. surf with N≥5) it degrades to raw slot
  rates — inevitable; documented.
- **Per-zone difficulty profiles preserved:** each zone/slot keeps its `replacementType` (the hand-tuned
  LC-weak→FINAL-premium curve). Only the fill algorithm changes.
- **Encounter levels preserved:** the N species in a zone/method share that zone's existing balanced
  level; no level randomization.

## Plan

Replace the flat-`replacementLog` + text-substitution path with a **sweep (batida) generator** that
emits a per-zone/per-method **pick list**, and a writer that **builds the `mons[]` arrays from code**.

**Algorithm (sweep / "batidas"):**
- Build one pool per `(tier, evo)` bucket, keyed by **family**, seeded excluding families already taken
  by starters/gym rewards/statics (reuse `alreadyChosenFamilySet`).
- Deterministic mode = N=1; classic mode = N (per-method capped to slot capacity).
- Sweep zone-by-zone/slot-by-slot: for each pick, draw a random family from the **union** of that
  slot's `replacementType` pools and remove it. Multi-pool type: exhausting one pool falls back to the
  others; single-pool type (or all pools of a multi-pool type) exhausted: **regenerate** that pool and
  continue. Minimises duplication and spreads it across zones.
- Super rod + statics keep today's behaviour (shared/static).

**Writer:** parse `wild_encounters.json` as structured JSON; for each map/method fill `mons[]` from the
pick list, distributing the picks across the method's slots with greedy probability-balancing; preserve
each method's authored `min_level`/`max_level`/`encounter_rate`. Remove `substituteWildSpecies`.

**Config threading:** `wildEncounterType` (`deterministic`|`classic`) + `pokemonPerZone` (default 5)
through `frontend/js/config-form.js` (DEFAULTS, `_build`, `getConfig`, `setConfig`, `_syncUI`,
`_wireEvents`), both `toModuleConfig` copies (`frontend/js/randomizer-worker.cjs` +
`backend/generator.js`), and `runWildModule(...moduleConfig)`. Rebuild worker bundle (`node build.js`).

Acceptance criteria:
- [x] Sweep generator produces a per-template pick list; deterministic (N=1) and classic (N) modes,
      per-method slot caps honoured; super rod + statics untouched. (`buildWildPlan`)
- [x] Duplication is minimised (no family reused until its pool is exhausted) and, on exhaustion,
      overflows/regenerates and spreads duplicates; unit tests assert both. (`wildSweep.test.js`)
- [x] Writer builds `mons[]` from code (structural JSON, `substituteWildSpecies` kept only as the
      no-`wildPlan` fallback), preserving levels/rates/slot counts; equiprobable slot grouping; unit
      tests on the emitted JSON. (`wildWriter.test.js`)
- [x] Frontend two-box selector + conditional numeric panel; round-trips through Save/Load + `lastConfig`;
      both `toModuleConfig`s forward the fields; defaults in all required spots.
- [x] Deterministic default reproduces "1 species per zone/method" behaviour.
- [x] `cd randomizer && npm test` green (1332); frontend `node --test` green (81); backend green (132);
      failing-first tests added.
- [x] `node build.js` rebuilds the worker bundle.
- [x] `randomizer/docs/wild-encounters.md` + `randomization-options.md` + CLAUDE.md table +
      `CHANGELOG.brooktec.md [Unreleased]` updated.
- [ ] **User manual test** (build ROM(s): deterministic = 1/zone predictable; classic N=5 = several/zone,
      minimal spread duplication; super rod still shared; statics intact) — closing gate.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-19** — Task created. Feasibility gate PASSED (supply/demand table above). Three exploration
  passes mapped the full system: selection (`wildModule.js` L530-581, pools on `bestEvoTier`+evo-stage,
  family dedup via 3 sets, mulberry32 seeded once in `generate.js`), application (`writer.js`
  `substituteWildSpecies` text replace; JSON is a hand-authored template with 1 species/method), and the
  config plumbing + nuzlocke `radio-card` UI pattern (`config-form.js` → `app.js` →
  `randomizer-worker.cjs`/`backend/generator.js` `toModuleConfig` → `runWildModule`). Owner decisions
  recorded (scope=everything-that-fits, rarity=equiprobable, preserve profiles+levels).

- **2026-07-19** — Implemented (TDD, red→green throughout).
  - **Sweep** — new `buildWildPlan` in `wildModule.js` replaces the old `replacements`-loop (L530-581).
    Round-by-round draws across all zones; family-keyed pools per replacementType with a normal→overflow
    (regenerate-on-exhaust) rule; per-method caps (land 12 / surf·underwater 5 / old 2 / good 3); super =
    1 shared pick per template; statics ignored. Returns `wildPlan` + representative `replacementLog`.
  - **Spec change (documented):** wild generation is now **maps-driven**, so the `wildModule.test.js`
    "replacement picks from the matching tier pool" test was updated from `maps:[]`/`replacements`-driven
    to a real map slot (per CLAUDE.md TDD rule 3 — deliberate spec change).
  - **Key mid-course correction:** an integration cross-check found **9 wild.js map ids don't match the
    JSON** (split maps: Granite Cave/Victory Road/Ever Grande floors; Route104 surf; Route126/127
    underwater). A map-id-keyed writer would silently drop them. **Refactored the plan to be keyed by
    TEMPLATE species** and the writer (`applyWildPlanToEncounters`) to place picks *wherever the template
    appears in the JSON* (mirrors the legacy substitution). Real-JSON smoke: 130/135 templates placed;
    the **5 unplaced** (POOCHYENA @Route104-surf; MOLTRES/ZAPDOS/ARTICUNO/LUGIA @Victory Road fishing)
    are **dead wild.js entries** (their species aren't in the JSON at all) — the legacy substitution
    didn't place them either, so no regression. Re-stringify → valid JSON.
  - **Writer** — structural build from the parsed JSON (`JSON.parse`→mutate→`JSON.stringify`); legacy
    `substituteWildSpecies` retained as the no-`wildPlan` fallback (old bundles still build; its test
    stays green). Equiprobable slot grouping (`distributeSpeciesAcrossSlots`, greedy). Levels/rates/slot
    counts untouched.
  - **Config** — `wildEncounterType`/`pokemonPerZone` through `DEFAULTS`, `getConfig`, `setConfig`,
    `_syncUI` (reveal panel), `_wireEvents`, both `toModuleConfig`s, and `runWildModule`. New two-box
    `radio-card-group` + `#wild-classic-panel`; app.js review row. Tests added to `config-form.test.js`
    + `config-roundtrip.test.js`.
  - **Verify** — randomizer Jest 1332 ✓, frontend node:test 81 ✓, backend 132 ✓; `node build.js`
    rebuilt the worker bundle; `node analyze.js --no-balance --seed=42` exit 0 (real pipeline exercises
    the new sweep; src restored). ROM-write path (`make.js`) needs the user's build to fully verify.
  - Docs: `randomizer/docs/wild-encounters.md` (new) + `randomization-options.md` + CLAUDE.md table +
    `CHANGELOG.brooktec.md [Unreleased]`. Awaiting user manual ROM test to close.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
