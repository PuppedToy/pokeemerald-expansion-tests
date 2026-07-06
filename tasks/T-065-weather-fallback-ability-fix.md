---
id: T-065
title: Weather-archetype fallback must keep the weather ability
status: proposed        # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-06
updated: 2026-07-06
target-version: 0.6.0
links: [T-061]
blocked-by: []
---

# T-065 — Weather-archetype fallback must keep the weather ability

## Context

Spawned from **T-061** (bundle `tasks/assets/T-061/bundle.json`). Reported by the user:

> In rom-0 the museum grunt uses Qwilfish-Hisui with its Intimidate ability when it should be a Drizzle mon. Since there's no Drizzle mon of the tier it uses a rain dancer with a water ability — but instead of Swift Swim it took Intimidate. Find why and fix. Check if it also happens for drought/sand/snow and fix them all at once. The fallback must not pick an ability ignoring that the slot was a weather setter — it must pick the right one.

**Root cause:** the trainer resolver picks the slot's final ability from the **primary** poke-definition's ability list (`trainerMonDefinition.abilities`) instead of the **effective** definition that actually selected the mon (`effectiveDef.abilities`).

A weather **setter** slot (e.g. `pokeDefDrizzleMon`) has primary `abilities:['DRIZZLE']` and a `fallback` whose `abilities` are the **abusers** (`rainAbilities = ['SWIFT_SWIM','RAIN_DISH','DRY_SKIN','HYDRATION']`). When no tier-appropriate Drizzle mon exists, `selectWithAutoFallback` returns `effectiveDef = <the rain-abuser fallback def>` and picks a mon filtered on `effectiveDef.abilities` (so the mon is guaranteed to have a matching weather ability). But the ability step then intersects the mon's abilities with the **primary's** `['DRIZZLE']` → empty → drops into the generic "best ability by rating" branch, which (at level ≥ `ABILITY_STRATEGY_MIN_LEVEL = 12`, `constants.js:13`) picks the highest-rated ability the mon has: **Intimidate (rating 7)** for Qwilfish-Hisui — ignoring the rain role.

**This is a wrong-ability bug, NOT a mon-selection bug**: the selector already filtered on `effectiveDef.abilities` (`trainerSelector.js:224-225`), so using `effectiveDef.abilities` for the final pick always yields a non-empty intersection → a genuine weather ability. Proof the fallback WAS taken: moves are read from `effectiveDef.tryToHaveMove` (`writerDocs.js:310-315`) and every mispicked mon carries the fallback's forced weather move (Qwilfish-Hisui has `MOVE_RAIN_DANCE`, Boldore `MOVE_SANDSTORM`, Scrafty `MOVE_SUNNY_DAY`).

**Why it's an in-game bug (not just a viewer glitch):** the ROM builder does NOT re-resolve teams. In bundle mode `writer.js:528-531` calls `buildTrainersResultsFromDocs`, which copies each member verbatim (`...member`, including `ability`; `writer.js:192-212`) and writes it straight into `src/data/trainers.party`. So **`writerDocs.js` is the source of truth for the game.** The correct ability logic in `writer.js:640-704` (already uses `effectiveDef?.abilities`) only runs in the non-bundle `else` branch and is **dead code** for real bundle builds. The two near-duplicate blocks have silently diverged (an SSOT violation).

## Bundle evidence

Per-ROM trainer data lives in `roms[i].docs.trainersResultsSimplified` (`.artifacts.pokedex`/`.trainers` are `"global"` stubs). These weather bosses are `isBoss + preventShuffle` with per-slot deterministic reseeding → byte-identical across all 6 ROMs (expected).

**Reported case — `TRAINER_GRUNT_MUSEUM_1` (Slateport Museum, "Aqua Grunt M", L24, reward Sableye):** rain team —
- slot0 Meltan = DRIZZLE (setter OK, mutation gave Meltan Drizzle)
- slot1 Poliwhirl = SWIFT_SWIM, slot2 Qwilfish = SWIFT_SWIM
- **slot3 Qwilfish-Hisui = INTIMIDATE @ Shell Bell, move `MOVE_RAIN_DANCE` ← THE BUG.** Qwilfish-Hisui canonically has `{POISON_POINT, SWIFT_SWIM, INTIMIDATE}` (`src/data/pokemon/species_info/gen_2_families.h:5088`) → it HAS Swift Swim. Expected SWIFT_SWIM, got INTIMIDATE.

**Other confirmed mispicks (all ROMs, deterministic):**
- `TRAINER_TABITHA_MT_CHIMNEY` (sand, L32): slot0 Hippopotas=SAND_STREAM (OK), **slot3 Boldore=STURDY, move `MOVE_SANDSTORM`** (2nd Sand Stream setter → fallback). Boldore canonically has `SAND_FORCE`.
- `TRAINER_MAXIE_MT_CHIMNEY` (sun, L33): **slot2 Scrafty=MOXIE, move `MOVE_SUNNY_DAY`** (2nd Drought setter → fallback). Scrafty has no canonical sun ability but was picked through the sun-abuser filter, so `mutateAbilities` had given it one this run — the fix restores that mutated sun ability. Same bug.
- **Latent (coincidentally correct):** `MAXIE` slot0 Swadloon got CHLOROPHYLL via the same broken branch (its top-rated ability happened to be a sun ability). Fragile luck, not logic.

**False positives (NOT setter slots — ignore):** `TRAINER_ISABEL_1`, `TRAINER_MARIA_1`, `TRAINER_ALLEN`, Route-103 rivals (generic tier teams via `genericTrainerTeam*`). **Not affected by design:** `pokeDefElectricSurgeMon` (terrain, fallback has no `abilities`) and Maxie slot4 Arboliva (type-only fallback) — `effectiveDef.abilities` is legitimately undefined there, so the generic pick is intended; the fix preserves this.

## Key code locations

- **THE BUG:** `randomizer/writerDocs.js:322-323` — `if (trainerMonDefinition.abilities)` / `trainerMonDefinition.abilities` should be `effectiveDef?.abilities` / `effectiveDef.abilities`. `effectiveDef` is already in scope (`:256`, used correctly for moves at `:310`).
- Generic best-ability fallthrough (yields Intimidate): `writerDocs.js:332-350`.
- **Correct reference (already right, but dead for bundles):** `writer.js:656-657` (`effectiveDef?.abilities`); full block `:640-704`.
- Fallback returning `effectiveDef`: `randomizer/modules/trainerFallback.js:17-61` (primary → auto-tier-down `Object.assign` copies `abilities` `:28` → explicit `fallback[]`).
- Selector filters candidates on the effective def's abilities: `trainerSelector.js:224-225`.
- Weather defs/pools: `trainers.js:68-71` (`rainAbilities`/`sunAbilities`/`sandAbilities`/`snowAbilities`), `:159-215` (`pokeDefDrizzleMon`/`SnowWarning`/`Drought`/`SandStream`), `:218-229` (`pokeDefElectricSurgeMon` — terrain, no abuser abilities).
- 16 setter slots: `trainers.js:1811,1820,1841,1850,2155,2283,2292,2313,2334,3204,3210,3279,3733,3756,3887,3899`. Museum Grunt 1: `:1801-1830`, slot3 `:1820`.
- `ABILITY_STRATEGY_MIN_LEVEL:12` `constants.js:13`; `usesStrategicAbility` `modules/utils.js:110-113`. ROM consumes docs verbatim: `writer.js:186-212,528-531`.

## Plan

1. **Semantic fix in the live resolver** — `writerDocs.js:322`: use `effectiveDef?.abilities` / `effectiveDef.abilities` (match `writer.js:656-657`). Strictly safe: on primary success `selectWithAutoFallback` returns `effectiveDef === definition`, and tier-down copies `abilities`; only the fallback case changes. Covers rain/sun/sand/snow uniformly (all four share the `pokeDef*Mon` mechanism). Preserve the chosen→base index remap (`indexOf` + `NONE` guard, `:328-331`/`:347-350`).
2. **Kill the divergence (SSOT).** `writer.js:652-705` and `writerDocs.js:318-351` are near-identical. Extract one pure helper (e.g. `pickTrainerMonAbility({ chosenTrainerMon, baseFormMon, trainer, effectiveDef, abilities, level })` in `randomizer/modules/`) and call it from both. This also makes the fix unit-testable.
3. (Optional) Warn/log if the generic branch is reached for a weather-abuser fallback, since it should be unreachable after the fix.

Acceptance criteria:
- [ ] For a weather-abuser fallback slot, the assigned ability is a member of `effectiveDef.abilities` (a real weather ability) — never a generic top-rated ability like Intimidate/Sturdy/Moxie.
- [ ] Rain, sun, sand, and snow fallbacks all covered by the same fix (one code path).
- [ ] Primary-success case unchanged (a real Drizzle mon still gets Drizzle); genuinely abilities-less fallbacks (terrain/type-only) still use the generic pick.
- [ ] `writer.js` and `writerDocs.js` ability logic deduplicated into one helper.
- [ ] `cd randomizer && npm test` green; failing-first test added.

## Test plan (TDD, red first)

Fixtures: `miniAbilities.js` already has `INTIMIDATE` (7), `CHLOROPHYLL` (4), `STURDY` (5) — exactly why the generic branch surfaces the wrong ability. No existing test covers ability selection off a fallback def (`trainerFallback.test.js` = mon-selection only; `weatherCombo.test.js` = rating combos).
- **Failing-first unit** (against extracted `pickTrainerMonAbility`): Qwilfish-Hisui-like mon `parsedAbilities:['POISON_POINT','SWIFT_SWIM','INTIMIDATE']`, `effectiveDef.abilities = rainAbilities`, `trainerMonDefinition.abilities = ['DRIZZLE']`, `level:24` → assert result `SWIFT_SWIM`, never `INTIMIDATE`. Fails today. Parallel cases: sun (Chlorophyll not Moxie), sand (Sand Force not Sturdy), snow (Slush Rush/Snow Cloak).
- **Regression:** primary-success (mon with DRIZZLE under `abilities:['DRIZZLE']` still gets DRIZZLE); abilities-less fallback (terrain/type-only) still uses generic pick.
- **Integration** (cf. `crossRomBossDeterminism.test.js`): resolve `TRAINER_GRUNT_MUSEUM_1`, assert no weather-team slot carries a weather move while holding a non-weather ability.

## Open decisions (confirm before implementing)

1. **Priority among matching weather abilities.** The fix picks `sample(intersection)` — random among the mon's matching weather abilities. Acceptable, or enforce setter > offensive-abuser (Swift Swim/Sand Rush/Slush Rush/Chlorophyll) > defensive (Rain Dish/Sand Veil/Ice Body)? **Recommendation: enforce setter > offensive > defensive** (a rain sweeper wants Swift Swim, not Rain Dish).
2. **Fallback mon with no weather ability at all.** Can't happen for abuser fallbacks (selector filters on `effectiveDef.abilities`), but terrain/type-only fallbacks deliberately drop the requirement. Keep the generic pick for those (current behavior, preserved)? **Recommendation: yes, preserve.**
3. **Setter vs abuser share one fallback path** — confirmed; one fix covers both, terrain stays ability-agnostic. Confirm intended.
4. **Determinism/balance impact.** The fix changes abilities on deterministic boss slots → shifts downstream moveset/nature/item RNG → many teams change. Snapshot/determinism integration tests need regenerated expectations — flag as a deliberate spec change in the task log.
5. **Rebalancer interaction (Scrafty).** `mutateAbilities` can hand a mon a weather ability it lacks canonically, so the fix's output depends on the per-run mutated ability set. Confirm "weather teams work using mutated abilities" is desired vs restricting abuser candidates to canonical weather abilities. **Recommendation: allow mutated abilities (current design intent).**

## Progress log

<!-- Append-only. Never rewrite past entries. -->

- **2026-07-06** — Task created from T-061 investigation dossier (issue 4). Root cause pinned to `writerDocs.js:322` using `trainerMonDefinition.abilities` instead of `effectiveDef.abilities` (live resolver; SSOT divergence with the already-correct `writer.js:656-657`). Verified in-game (docs consumed verbatim). 3 mispicks catalogued (Qwilfish-Hisui/rain, Boldore/sand, Scrafty/sun). Awaiting confirmation of open decisions (esp. #1 ability priority ordering).

## Outcome

<!-- Filled when closing. -->
