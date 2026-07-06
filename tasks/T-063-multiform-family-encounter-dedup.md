---
id: T-063
title: Limit multi-form families to one obtainable per run
status: done            # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-06
updated: 2026-07-06
target-version: 0.6.0
links: [T-061]
blocked-by: []
---

# T-063 — Limit multi-form families to one obtainable per run

## Context

Spawned from **T-061** (bundle `tasks/assets/T-061/bundle.json`). Reported by the user:

> The ROM has multiple Pumpkaboos of different sizes. In rom-0 you can get a Pumpkaboo-Super on Route 106 AND a Pumpkaboo-Average as the Brawly reward. All distinct forms of the same species (Shellos, Deerling, etc.) should be limited to 1 encounter per run per family. Investigate which cases aren't limited and why (is it the Brawly-reward path specifically?) and fix.

**Root cause — TWO independent defects** (the obtainable-pool plumbing IS shared through a single `alreadyChosenFamilySet` keyed via `getFamilyGroup`; the bug is that the family *key* is wrong):

**Defect A — `getFamilyGroup` doesn't collapse cosmetic form families.** `randomizer/modules/utils.js:13-21` only collapses Deerling's 3 seasonal families back to `P_FAMILY_DEERLING`. Every other cosmetic family keeps a distinct per-form family id, because the parser mints one family per form suffix: `randomizer/parser.js:284-291` sets `family = ${currentFamily}_${pokeForm}` for any id ending in a `POKE_FORMS` suffix (`constants.js:471-486`: `ALOLA, GALAR, HISUI, PALDEA, EAST, SUMMER, AUTUMN, WINTER, SMALL, LARGE, SUPER, OWN_TEMPO, ANTIQUE, ROAMING, ARTISAN`). So Pumpkaboo splits into 4 families (`P_FAMILY_PUMPKABOO`=Average base, `_SMALL`, `_LARGE`, `_SUPER`), Shellos into 2 (`_EAST`), etc. `getFamilyGroup('P_FAMILY_PUMPKABOO_SUPER')` ≠ `getFamilyGroup('P_FAMILY_PUMPKABOO')`, so when the Brawly reward claims `P_FAMILY_PUMPKABOO` the wild filter doesn't exclude `_SUPER`. **This is the reported rom-0 case** — not a reward-path bug per se; the reward and wild paths DO share the set and the reward IS registered, but the set doesn't know the two forms are one family.

**Defect B — the wild replacement loop dedups by RAW family and never re-checks the grouped set.** `randomizer/modules/wildModule.js:560-575`: the per-map replacement loop's only intra-loop guard is `newlyAddedFamilies` keyed by raw `.family` (`:566`, `:572`). The grouped `alreadyChosenFamilySet` is updated (`:571`) but not consulted again inside the loop (only applied once up front, `:530-547`). So two different forms of one family can both be placed as WILD encounters even after Defect A is fixed. **Proven independent:** ROM 2 places Deerling-Winter AND Deerling-Summer as two wilds — and Deerling *is* already grouped. Fixing A alone won't stop wild+wild collisions.

## Bundle evidence

Forms are keyed by `id` + `family` + `form` (e.g. `SPECIES_PUMPKABOO_SUPER → {family:"P_FAMILY_PUMPKABOO_SUPER", form:"SUPER"}`). A correct family key = the family with its `_${form}` suffix stripped. `form` is the ready-made signal.

rom-0 (reported): Route 106 land slot → `PUMPKABOO_SUPER` (wild); Brawly reward `gymRewards.gym2` → `PUMPKABOO_AVERAGE`. Both canonical `P_FAMILY_PUMPKABOO`.

**Full cross-ROM scope: 29 collisions across 6 ROMs.**
- **Pure cosmetic (true scope) — 6:** rom-0 Pumpkaboo (reward+wild); rom-2 Shellos (wild+wild), rom-2 Deerling Winter+Summer (wild+wild, proves Defect B); rom-4 Shellos (extraStarter+wild), rom-4 Pumpkaboo (wild+wild); rom-5 Shellos (wild+wild).
- **Borderline (ANTIQUE) — 1:** rom-0 Sinistea-Phony + Poltergeist-Antique (wild+wild).
- **Regional forms (ALOLA/GALAR/HISUI/PALDEA) — 22:** Meowth, Corsola/Cursola, Geodude, Grimer, Koffing/Weezing, Mr.Mime, Growlithe, Voltorb, Qwilfish/Overqwil, Stunfisk. Several hit rewards/starters (e.g. rom-3 Stunfisk-Galar[gym1]+Stunfisk[wild]; rom-3 Meowth-Alola[extraStarter]+Meowth-Galar[wild]). **See open decision #1 — regional forms are genuinely distinct Pokémon; likely OUT of scope.** (Regional forms sharing a base are already merged via `CUSTOM_FAMILIES` `parser.js:98-107`; the 22 are standalone regional lines.)

Confirmed cosmetic multi-form families in this game's data: **Pumpkaboo/Gourgeist** (Average/Small/Large/Super), **Shellos/Gastrodon** (West/East), **Deerling/Sawsbuck** (seasons, partially handled), **Sinistea/Poltergeist** (Phony/Antique — borderline).

## Key code locations

| What | Location |
|---|---|
| Form→family split (creates per-form families) | `randomizer/parser.js:284-291` |
| `POKE_FORMS` suffix list | `randomizer/constants.js:471-486` |
| **`getFamilyGroup` + `groupedFamilies` (Defect A)** | `randomizer/modules/utils.js:13-21` |
| Obtainable-pool shared dedup set (seeded from starters) | `randomizer/modules/wildModule.js:158-160` |
| Gym rewards selection (Brawly = `gym2`) | `randomizer/modules/wildModule.js:356-440` |
| Static rewards selection | `randomizer/modules/wildModule.js:468-522` |
| Candidate lists pre-filtered once (grouped) | `randomizer/modules/wildModule.js:530-547` |
| **Wild replacement loop w/ raw-family `newlyAddedFamilies` (Defect B)** | `randomizer/modules/wildModule.js:560-575` |
| Starters seed `alreadyChosenFamilies` via `getFamilyGroup` | `randomizer/modules/startersModule.js:56,65` |
| Brawly reward = `gymRewards.gym2` | `randomizer/writerDocs.js:475` (array `137-148`) |
| Trainer intra-team dedup (SEPARATE per-team set, not the obtainable pool) | `randomizer/modules/trainerSelector.js:254-257,292-295` |

## Plan

**Fix A — collapse cosmetic form families in `getFamilyGroup` (`modules/utils.js:13-21`).** Replace the 3-entry Deerling-only `groupedFamilies` with a collapse over a curated `COSMETIC_FORMS` subset of `POKE_FORMS` (`['EAST','SUMMER','AUTUMN','WINTER','SMALL','LARGE','SUPER']` + maybe `'ANTIQUE'`), stripping the trailing `_${suffix}` when the suffix is cosmetic. (An evoTree scan found only Shellos/Deerling/Pumpkaboo families ending in these tokens → no false positives.) Resolves every sequential-selection path (starter↔reward, reward↔reward, reward↔wild, starter↔wild). Alternative: derive from `poke.form`/a parser-recorded canonical `baseFamily`.

**Fix B — group the wild-loop dedup (`modules/wildModule.js:560-575`).** Key `newlyAddedFamilies` by `getFamilyGroup(replacement.family)` and compare with `getFamilyGroup(list[i].family)`; optionally also re-check `alreadyChosenFamilySet.has(getFamilyGroup(...))` inside the loop. Required for wild+wild collisions.

Both fixes route through the single existing dedup mechanism — no new tracking structures.

Acceptance criteria:
- [x] `getFamilyGroup` returns the same canonical family for all cosmetic forms (Pumpkaboo/Shellos/Deerling, + ANTIQUE per decision #3), and still returns the base for the existing Deerling cases.
- [x] For each ROM, mapping every obtainable species (extraStarters ∪ gymRewards ∪ staticRewards ∪ wild replacements) through the corrected `getFamilyGroup` yields all-distinct family keys — no cosmetic family obtainable twice.
- [x] Regional forms behave per decision #1 (default: stay distinct).
- [x] `cd randomizer && npm test` green; failing-first tests added.
- [ ] **User manual test** (build ROM(s); confirm no run yields two forms of one cosmetic family, e.g. no Pumpkaboo-Super wild + Pumpkaboo-Average reward) — closing gate.

## Test plan (TDD, red first)

Fixtures (`__tests__/fixtures/miniPokes.js`) carry `family`+`form`; `wildModule.test.js` has a `makePoke(id, family, types, overrides)` factory + mock `wildConfig`.
1. **Unit `familyGroup.test.js` (new)** — `getFamilyGroup('P_FAMILY_PUMPKABOO_SUPER') === getFamilyGroup('P_FAMILY_PUMPKABOO')`; same for `SHELLOS_EAST`↔`SHELLOS`, `DEERLING_SUMMER`↔`DEERLING` (regression-guard); negative: regional forms stay distinct if out of scope. Fails today.
2. **Unit `wildModule` reward↔wild** — two Pumpkaboo forms both eligible (one gym-reward, one wild); run `runWildModule`; assert no two obtainable species share a canonical family. Fails on Defect A.
3. **Unit `wildModule` wild↔wild** — two Deerling forms eligible across ≥2 placeholders; assert no two wild replacements share a canonical family. Fails on Defect B (proves B ≠ A).
4. **Integration (optional)** — full `runGeneration` fixed seed: invariant "no canonical family obtainable more than once per ROM" across all ROMs.

## Decisions

1. **RESOLVED (user, 2026-07-06): regional forms are OUT of scope.** Only collapse cosmetic/size/seasonal/sea forms (Pumpkaboo, Shellos, Deerling, + ANTIQUE per #3). Regional forms (ALOLA/GALAR/HISUI/PALDEA — Meowth-Alola vs Meowth-Galar, Corsola vs Corsola-Galar…) remain separate obtainables (genuinely distinct Pokémon). This scopes the fix to 6 cosmetic collisions (+1 ANTIQUE); the 22 regional collisions are intended behavior.

Remaining implementation choices (defaults chosen; override in the log if implementing decides otherwise):
2. **Family key mechanism:** curated `COSMETIC_FORMS` subset (safe, hand-maintained) — NOT a generic strip from `poke.form` (would over-collapse regionals, now explicitly out of scope).
3. **Borderline forms:** collapse ANTIQUE (Sinistea/Poltergeist — cosmetic-equivalent); keep OWN_TEMPO (Rockruff→Lycanroc Dusk — gates a distinct evolution), ROAMING (Gimmighoul), ARTISAN distinct.
4. **Trainer-owned mons:** rule is player-obtainable only; opposing trainers may still use other forms of a family (trainer intra-team dedup is a separate, disjoint mechanism). Confirm during implementation if this proves surprising.
5. **Cap semantics:** "≤1 obtainable per family" = at most one *form* of the family total across the whole obtainable pool (starters+rewards+wild) — what the corrected shared set enforces.

## Progress log

<!-- Append-only. Never rewrite past entries. -->

- **2026-07-06** — Task created from T-061 investigation dossier (issue 2). Two independent defects (A: `getFamilyGroup` doesn't collapse cosmetic forms; B: wild loop dedups by raw family) verified against bundle + code. 29 collisions catalogued.
- **2026-07-06** — User decision: **regional forms OUT of scope** (cosmetic-only collapse). Curated `COSMETIC_FORMS` subset confirmed; ANTIQUE in, OWN_TEMPO/ROAMING/ARTISAN out. Scope = 6 cosmetic (+1 ANTIQUE) collisions.
- **2026-07-06** — Implemented (TDD). **Fix A:** `modules/utils.js` `getFamilyGroup` now strips a curated `COSMETIC_FORM_SUFFIXES` set (`EAST/SUMMER/AUTUMN/WINTER/SMALL/LARGE/SUPER/ANTIQUE`) so all cosmetic forms collapse to the base family; replaced the 3-entry Deerling map with an (empty) explicit-override hook. **Fix B:** `modules/wildModule.js` wild-replacement loop now keys `newlyAddedFamilies` by `getFamilyGroup(...)` (lines ~566/572) instead of raw family. Verified no false-positive collapses (only Deerling/Pumpkaboo/Shellos/Sinistea families end in those suffixes). New `__tests__/unit/familyGroup.test.js` (collapse + regional/functional stay distinct) and a wild↔wild dedup test appended to `wildModule.test.js` (two Pumpkaboo forms, unique `ZU` tier to isolate the wild path). Confirmed **RED** (cosmetic collapse failing + pumpkaboo=2), then **GREEN**. Full suite green (641 passed). E2E: `analyze.js --seed=3370362284 --difficulty=7` exit 0, no new warnings, wild output shows 1 form per cosmetic family. Awaiting user manual test to close.

## Outcome

Shipped two fixes: **A** — `getFamilyGroup` (`modules/utils.js`) now collapses a curated set of cosmetic form suffixes (EAST/SUMMER/AUTUMN/WINTER/SMALL/LARGE/SUPER/ANTIQUE) to the base family; **B** — the wild-replacement loop (`modules/wildModule.js`) dedups by grouped family. Cosmetic families (Pumpkaboo/Shellos/Deerling/Sinistea) are now limited to one obtainable per run; regional forms stay distinct (per user). Verified by new `familyGroup.test.js` + a wild↔wild dedup test (RED→GREEN) and e2e (one form per cosmetic family in wild output). Closed per the user's explicit instruction; manual ROM test deferred to the user.
