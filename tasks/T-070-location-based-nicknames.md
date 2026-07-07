---
id: T-070
title: Location-based automatic nicknames for all wild / gift / static Pokémon
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-07
updated: 2026-07-07
target-version: 0.6.0
links: [T-068]
blocked-by: []
---

# T-070 — Location-based automatic nicknames for all wild / gift / static Pokémon

Child of [T-068](T-068-starter-nicknames.md). Optional (default OFF): give every wild, gift and static
Pokémon a nickname decided by **where it is caught/received** — a 1:1 `location → name` mapping per ROM
(e.g. every wild mon on Route 102 is "Percy"). Optional per-route **gender lock** for coherence. Nuzlocke /
soul-link sharing mirrors T-068.

## Viability analysis (VERDICT: VIABLE — no hard blockers)

Investigated the engine + randomizer (2026-07-07). Findings:

**Runtime nickname persists on capture (the make-or-break question) — YES.** A nickname set on
`gEnemyParty[0]` right after creation in `CreateWildMon` ([wild_encounter.c:510/514](../src/wild_encounter.c#L510))
survives capture: `Cmd_givecaughtmon` → `GiveMonToPlayer` → `CopyMon` memcpy the whole struct and never
touch `MON_DATA_NICKNAME` ([pokemon.c:3243-3281](../src/pokemon.c#L3243)). The post-catch "give a nickname?"
prompt is well-behaved: decline → keeps our preset; accept-and-blank → keeps our preset; accept-and-type →
player overwrites (the naming screen shows an empty box — cosmetic only).

**Hook points (few + clean, all feature-gated, all see the current map):**
- Current map is always `gSaveBlock1Ptr->location.{mapGroup,mapNum}` ([global.h:646-653,1063](../include/global.h#L646)),
  keyable to the `MAP_*` constants in `include/constants/map_groups.h` via `MAP_GROUP()/MAP_NUM()`.
- **Wild** — one choke point: `CreateWildMon` ([wild_encounter.c:480](../src/wild_encounter.c#L480)) (grass/
  water/fishing/rock-smash/hidden/outbreak/Feebas all funnel here; mon → `gEnemyParty[0]`).
- **Gift/fossil** — `ScriptGiveMonParameterized` ([script_pokemon_util.c:336](../src/script_pokemon_util.c#L336));
  the T-068 nickname hook already lives at `:429-432` — extend it to fall back to the location name.
- **Static/legendary** (`setwildbattle`) — `CreateScriptedWildMon` + `CreateScriptedDoubleWildMon`
  ([script_pokemon_util.c:115/131](../src/script_pokemon_util.c#L115)).
- Roamers (Latias/Latios, `CreateInitialRoamerMon`) are **out of scope** (created once at game start, not a
  route encounter). Eggs and in-game trades are **out of scope** (not location encounters).
- Do **NOT** hook `CreateMon`/`CreateBoxMon` — too broad (eggs, trades, enemy trainers, roamers).

**Gender forcing** reuses the existing `genderRatio` guard (`wild_encounter.c:486-493`,
`script_pokemon_util.c:356-358`): force the route gender via `CreateMonWithGenderNatureLetter` only when the
species allows it; genderless/fixed-gender species fall back to random (no infinite-loop, same as T-068).

**Name supply:** ~120 wild maps (`src/data/wild_encounters.json`, `"map":"MAP_ROUTE102"`) + ~16 gift/static
maps ≈ **~130 locations**. Default pool is 650 unique names → comfortably enough for per-ROM
without-replacement uniqueness.

**Contraindications:** none hard. Soft: (a) it's a **T-068-scale, multi-layer build** whose C only compiles
on the builder (T-068 shipped two box-only bugs — B-020, B-021 — so budget a deploy+verify loop); (b) cosmetic
— the vanilla "nickname?" prompt still appears on catches (with an empty edit box). Both acceptable.

## Plan

Reuse T-068's machinery; the new load-bearing pieces are a **MAP-keyed name table + runtime lookup** and the
four creation hooks.

1. **Randomizer** — new pure module `randomizer/modules/locationNames.js` `buildLocationNaming({ config, locations, roms, seed })`:
   reuse `starterNames.js`'s `groupKeyFor` + without-replacement single-pool draw; assign one unique name per
   location per sharing-group, plus a per-location gender coin used only when `genderLockPerRoute`.
2. **Bundle** — `generate.js`: derive the location list (wild-encounter maps from `wild_encounters.json` +
   the known gift/static maps), attach per-ROM `rom.artifacts.locationNaming`. Validate in `bundleSchema.js`
   (reuse `SAFE_NICKNAME`).
3. **Writer** — new `randomizer/locationNameWriter.js`: emit a generated C table
   `{ MAP_x, COMPOUND_STRING("name"), gender }[]` into a committed file with an empty default (feature-off =
   empty table = vanilla).
4. **C engine** — a `GetLocationNickname(mapGroup, mapNum, *outGender)` lookup over the table; hook it into
   `CreateWildMon`, `CreateScriptedWildMon`, `CreateScriptedDoubleWildMon`, and the give path. Force gender
   only when locked + compatible.
5. **Frontend** — new "Location nicknames" settings (enable / gender-lock-per-route / same-across-runs /
   share-soul-link / editable name pool); forward `locationNicknames` via the worker + backend generator.
6. **Tests** — unit (buildLocationNaming determinism/uniqueness/sharing/gender-lock), writer C-table
   (sanitize/COMPOUND_STRING/empty default), schema validation, frontend structural + round-trip.

Acceptance criteria:
- [ ] Default OFF; feature-off bundle byte-identical and ROM unchanged.
- [ ] Each location gets one unique name per ROM; every wild/gift/static mon there carries it.
- [ ] Gender-lock ON → a route's encounters share one gender (genderless/fixed species excepted); OFF → names only.
- [ ] Nuzlocke same-across-runs / soul-link share behave per the switch matrix (reused from T-068).
- [ ] Bundle carries valid `locationNaming`; schema accepts/rejects (name sanitize ≤12).
- [ ] Generated C compiles on the box; wild-caught mon keeps its route name in-game (owner-verified).
- [ ] `cd randomizer && npm test`, `cd backend && npm test`, `node build.js` green.

## Progress log

- **2026-07-07** — Task created (child of T-068). Viability investigated across engine + randomizer +
  capture flow → VIABLE, no hard blockers. Plan above. Starting with the randomizer core (TDD).

## Outcome

<!-- Filled when closing. -->
