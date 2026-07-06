---
id: T-062
title: Guarantee base form learns STAB of a mega's added/mutated type
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-06
updated: 2026-07-06
target-version: 0.6.0
links: [T-061]
blocked-by: []
---

# T-062 — Guarantee base form learns STAB of a mega's added/mutated type

## Context

Spawned from **T-061** (bundle `tasks/assets/T-061/bundle.json`, investigation dossier). Reported by the user:

> Some megas (Garchomp, Aggron…) change or gain types on their mega relative to the base form. E.g. base Garchomp is Dragon/Ground but Mega Garchomp is Dragon/**Steel**; Mega Aggron is Steel/**Fighting** while base Aggron stays Steel/Rock. When this happens the randomizer sometimes assigns the base mon TMs of the mega's new types — and it alters the **mega's** learnset, which is not real: a mega can't learn moves (it mega-evolves in battle and fights with the base form's known moves). So the base never actually gains the new-type STAB.

**Root cause (verified against bundle + code):**

1. Type mutation and the "type changed → alter learnset" pass run on **every** species including megas, with no mega guard (`randomizer/modules/pokedexModule.js:172-189` loops `balancePokemon(allPokes[i], …)` over all pokes; the type mutation is `randomizer/rebalancer.js:220-250`).
2. The mega's edited learnset is **meaningless twice over**: (a) a mega fights with the base's known moves; (b) it's literally **discarded at write time** — all 50 megas in the bundle share the base form's `levelUpLearnset` (and `teachableLearnset`) array id, and the writer resolves the shared array via `pokemonList.find(p => p.levelUpLearnset === currentLearnsetId)` (`randomizer/pokemonWriter.js:99`), which returns the **base** (base always precedes its mega in `allPokes`). The mega's mutated copy is thrown away.
3. The **base** learnset — the one actually written and actually used by the mega in battle — is never given a damaging move of the mega's new type. So Mega Garchomp (Dragon/Steel) has no Steel STAB; Mega Aggron (Steel/Fighting) has no Fighting STAB.
4. Secondary defect to avoid repeating: the existing mega-side insert filters candidate moves by `.type` only, not category, so it can inject **status** moves (Mega Garchomp got `MOVE_METAL_SOUND`). The fix's "damaging move" helper must filter `category !== 'DAMAGE_CATEGORY_STATUS'` — and must **not** filter on `power` (`MOVE_GYRO_BALL`/`MOVE_HEAVY_SLAM` have `power: 1` but are physical damaging moves).

**Desired behavior (from the user):** when a mega mutates/gains a type its base form lacks, guarantee the **base form** learns AT LEAST ONE damaging move of that new type, with decreasing probability for a 2nd/3rd/etc. (mirror the existing decaying-insert pattern). These are **extra** moves added to the base's learnset, **not** replacements. Result: base Garchomp learns a Steel damaging move, base Aggron learns a Fighting one, so the megas can use proper STAB.

## Bundle evidence

Analysis over `sharedData.pokedex.pokes` (global rebalanced pokedex, 1203 mons, 50 megas — soullink run, one pokedex drives all 6 ROMs). All 50 megas share the base's level-up AND teachable learnset (0 distinct).

**16 megas whose types differ from the base**; of these, **7 have a genuine STAB gap** (base has NO damaging move of the mega's extra type):

| Mega | Mega types | Base types | New type base lacks | Base has damaging move of it? |
|---|---|---|---|---|
| STEELIX_MEGA | Fighting/Poison | Fighting/Ground | Poison | **NO** |
| PINSIR_MEGA | Bug/Flying | Bug | Flying | **NO** |
| TYRANITAR_MEGA | Water/Dark | Rock/Dark | Water | **NO** |
| SCEPTILE_MEGA | Grass/Dragon | Grass | Dragon | **NO** |
| AGGRON_MEGA | Steel/Fighting | Steel/Rock | Fighting | **NO** |
| LATIAS_MEGA | Dragon/Flying | Dragon/Psychic | Flying | **NO** |
| GARCHOMP_MEGA | Dragon/Steel | Dragon/Ground | Steel | **NO** |
| CHARIZARD_MEGA_X | Fire/Dragon | Fire/Flying | Dragon | yes (Dragon Claw…) |
| GYARADOS_MEGA | Water/Dark | Water/Flying | Dark | yes |
| AERODACTYL_MEGA | Normal/Flying | Rock/Flying | Normal | yes |
| MEWTWO_MEGA_X | Psychic/Fighting | Psychic | Fighting | yes (Aura Sphere) |
| AMPHAROS_MEGA | Electric/Dragon | Electric/Flying | Dragon | yes |
| ALTARIA_MEGA | Grass/Fairy | Grass/Flying | Fairy | yes |
| GROUDON_PRIMAL | Ground/Fire | Ground/Fighting | Fire | yes |
| LOPUNNY_MEGA | Normal/Fighting | Normal | Fighting | yes |
| AUDINO_MEGA | Normal/Fairy | Normal | Fairy | yes |

The gap appears for **both** randomizer-mutated typings (Garchomp, Aggron, Steelix, Tyranitar, Latias) **and canonical mega typings** (Pinsir→Flying, Sceptile→Dragon are the mega's real-game types). **Scope decision (user, 2026-07-06): only randomizer-MUTATED types are in scope** — so the 5 mutated gaps (Steelix/Poison, Tyranitar/Water, Aggron/Fighting, Latias/Flying, Garchomp/Steel) get the fix; the 2 canonical gaps (Pinsir/Flying, Sceptile/Dragon) are **out of scope**.

## Key code locations

- **Mega ↔ base mapping:** `randomizer/parser.js:606-607` (mega id regex → `EVO_TYPE_MEGA`), `randomizer/modules/pokedexModule.js:80-88` (`isMega`, `megaBaseForm`, `megaItem`), `:104-112` (`evolutionData` shape), `:229-248` (base gets `evolutionData.megaEvos`). `constants.js:84` (`EVO_TYPE_MEGA`). Megas share the base's `family`.
- **Type mutation (runs on megas):** `randomizer/rebalancer.js:220-250` (the `oldValue:null` path at `:237-239` adds a 2nd type to a monotype mega — how Mega Aggron gained Fighting). Loop with no mega guard: `randomizer/modules/pokedexModule.js:172-189`.
- **"Type changed → alter learnset" (the meaningless mega edit):** `randomizer/rebalancer.js:290-390`. Candidate pool filtered by `.type` only (bug — status moves eligible): `:304-306`.
- **Canonical decaying-insert loop to MIRROR:** `randomizer/rebalancer.js:443-465` — `while (rng.random() < chanceToInsertExtra) { …insert…; amountChanged++; chanceToInsertExtra = Math.max(0, 1 - (amountChanged * moveInsertChance)); }`. With default `moveInsertChance = 0.5` starting at `amountChanged = 0`: P(1st)=1 (guaranteed), P(2nd)=0.5, P(3rd)=0 — exactly "at least one, decaying for extras".
- **Insert helper:** `randomizer/rebalancer.js:69-78` `insertMoveIntoLearnset(learnset, moveId, move, deviation)`; `:56-63` `getLearnLevelBasedOnRating`.
- **Writer that discards the mega learnset:** `randomizer/pokemonWriter.js:91-119`, the `.find()` at `:99`.
- **"Damaging" idiom to reuse:** `randomizer/rating.js` uses `m.category !== 'DAMAGE_CATEGORY_STATUS'` (e.g. `:266, :1050, :1328`). Do NOT filter on `power`.
- **Move data:** each move carries `.type` (TYPE_ prefix stripped), `.category`, `.power`, `.rating` (`pokedexModule.js:43-50`); available as the `moves` map.

## Plan

Add a new post-rebalance pass (proposed new module `randomizer/megaBaseStab.js`, unit-testable) invoked in `randomizer/modules/pokedexModule.js` right after the balance loop (after `:189`) and before the wishiwashi/best-evo steps. Doing it as a whole-array post-pass (not inside `balancePokemon`) is cleaner: `balancePokemon` processes one poke at a time and can't reach the already-frozen base object; a post-pass has `allPokes` + `moves` in scope.

Algorithm per `poke` with `poke.evolutionData.isMega` **whose type-change log shows a type was mutated/added on the mega this run** (reuse the same "type changed this run" condition as `rebalancer.js:293`; this is what keeps canonical-typed megas like Pinsir/Sceptile out of scope per the user decision):
1. `base = byId[poke.evolutionData.megaBaseForm]`.
2. `mutatedNewTypes = ` the type(s) the mega **gained/mutated this run** (from its type log) that `base.parsedTypes` does **not** include. (Not the full final delta — only types that changed this run.)
3. For each such type, if the base learnset has **no** damaging move of that type, inject damaging move(s) of that type into the **base** learnset via `insertMoveIntoLearnset` (export it), using the decaying loop mirrored from `rebalancer.js:443-465` (guarantee ≥1, decay P(extras)).
4. Candidate pool = damaging moves of that type (`moves[m].type === t && moves[m].category !== 'DAMAGE_CATEGORY_STATUS'`); optionally pick by rating similarity like step 1 at `:331-338`.
5. Log each insert (`target:'learnsetMove'`, `oldValue:null`) for viewer/writer consistency, then **re-rate the base** (`ratePokemon`, as `pokedexModule.js:187`) since the learnset changed.

Determinism note: this pass consumes `rng.random()`, so seeded output changes downstream — an intended spec change; iterate `allPokes` in fixed order.

Acceptance criteria:
- [x] For every mega whose type was **mutated/added this run** to a type the base lacks, the base learnset ends with ≥1 damaging move of that type. (Canonical-typed megas like Pinsir/Sceptile are out of scope.) — verified e2e: Mega Gardevoir (mutated +Dark) → base Gardevoir learned `MOVE_BADDY_BAD`.
- [x] Inserted moves are damaging (never status) and are **additions** — all pre-existing base entries remain.
- [x] If the base already has a damaging move of that type, nothing is injected (idempotent/skip).
- [x] Extra-move count decays (mostly 1, occasionally 2, ~never 3 at `moveInsertChance = 0.5`) and is deterministic per seed.
- [x] `cd randomizer && npm test` green; new failing-first test added.
- [ ] **User manual test** (build a ROM; confirm a mutated-mega base — e.g. Aggron/Garchomp — learns the new-type STAB and the Mega uses it) — closing gate.

## Test plan (TDD, red first)

- New `randomizer/__tests__/unit/megaBaseStab.test.js` driving the pass with mini fixtures:
  - Red: base with no Fighting move + mega mutated to add Fighting → after pass, base has ≥1 `FIGHTING` move with `category !== STATUS`. Fails today.
  - Inserted move is damaging (never a pure status move).
  - Addition, not replacement (all prior entries present).
  - Skip when base already has a damaging move of the new type.
  - Decay distribution over many seeds; determinism per seed (use `freshBalancer`/isolated-rng pattern from `rebalancer.test.js:10-17`).
- Fixtures: `miniPokes.js` has `SLOWBRO_MEGA` (`:125-149`, `megaBaseForm: 'SPECIES_SLOWBRO'`) but **no `SPECIES_SLOWBRO` base** — add a base fixture (types a strict subset of the mega's, learnset lacking the mega's extra type). `miniMoves.js` already has damaging Fighting (`MOVE_CLOSE_COMBAT`…), Steel (`MOVE_METAL_CLAW`), plus status moves to prove the category filter.
- Existing `rebalancer.test.js` / `mutationToggles.test.js` / `mutationProbs.test.js` call `balancePokemon` directly and stay green (fix lives in a separate pass). Full-pipeline snapshots will shift because the RNG stream changes — update as a deliberate spec change.

## Decisions

1. **RESOLVED (user, 2026-07-06): only randomizer-MUTATED types are in scope.** Trigger off the mega's "type changed this run" log; canonical-typed megas (Pinsir→Flying, Sceptile→Dragon) are NOT fixed. Consequently the pass is naturally gated on `mutateTypes` (a mutation must have happened).

Remaining implementation choices (defaults chosen; override in the log if implementing decides otherwise):
2. **Probability curve.** Reuse the existing `moveInsertChance = 0.5` decay verbatim (P: 1, 0.5, 0 → ceiling ~2 moves). (User: "como hacemos en otros sitios".)
3. **Definition of "damaging."** `category !== DAMAGE_CATEGORY_STATUS` only (don't filter on `power`; keep it simple). Optionally exclude fixed-damage/OHKO/charge moves if the base's STAB button ends up unusable.
4. **Level placement & TM gating.** `getLearnLevelBasedOnRating`, level-up learnset only (always available in battle) — not teachables.
5. **Config gating.** Runs as part of type mutation (only mutated types qualify), so effectively gated on `mutateTypes`.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-06** — Task created from T-061 investigation dossier (issue 1). Root cause verified against bundle + code.
- **2026-07-06** — User decision: scope to **randomizer-mutated types only** (canonical-typed megas out). Plan/acceptance/decisions updated accordingly; 5 of the 7 detected gaps are in scope (Steelix, Tyranitar, Aggron, Latias, Garchomp).
- **2026-07-06** — Implemented (TDD). New `randomizer/megaBaseStab.js` (`applyMegaBaseStab(allPokes, moves, {moveInsertChance, moveRatingDeviation})` + `isDamaging`): for each mega with a type-change log, injects damaging move(s) of the mutated new type the base lacks into the **base** learnset (guarantee ≥1, decaying odds mirroring `rebalancer.js:443-465`), skips if already covered, logs each insert, returns affected bases. Exported `insertMoveIntoLearnset`/`getLearnLevelBasedOnRating` from `rebalancer.js`. Wired as step **9d** in `pokedexModule.js` (after Palafin 9c, before best-evo), gated on `config.rebalance`, re-rating each affected base. New test `__tests__/unit/megaBaseStab.test.js` (7 cases: guarantee ≥1, damaging-only, addition-not-replacement, skip-when-covered, canonical-ignored, determinism, decay distribution). Confirmed **RED** first (neutralized fn → 4 assertion failures for the right reason), then **GREEN**. Full suite green (628 passed, 1 skipped). Changelog line added under Fixed.
- **2026-07-06** — E2E verified via `node analyze.js`. `--seed=42` ran clean but its one mutated mega (Gallade +Flying) already had Flying STAB → correctly skipped (0 insertions). `--seed=3370362284 --difficulty=7` fired a real insertion: **Mega Gardevoir** mutated to gain **Dark**, base Gardevoir lacked a Dark damaging move → `MOVE_BADDY_BAD` inserted at L8 (`reason:megaStab` log serialized). Canonical-typed megas (Pinsir/Sceptile) stayed untouched as intended; no spurious insertions; pipeline exit 0, `src/` restored. Implementation criteria met — awaiting user manual test (ROM build) to close.

## Outcome

Shipped `randomizer/megaBaseStab.js` (`applyMegaBaseStab`), a post-rebalance pass wired as step 9d in `pokedexModule.js`: when a mega's type is randomizer-mutated to one its base lacks, it injects a damaging move of that type into the **base** learnset (guaranteed ≥1, decaying extras), so megas get usable STAB. Scoped to mutated types only (canonical-typed megas untouched, per user). Verified by 7 unit tests (RED→GREEN) + e2e (Mega Gardevoir +Dark → base learned Baddy Bad). Closed per the user's explicit instruction; implementation and e2e verified, combined manual ROM test deferred to the user.
