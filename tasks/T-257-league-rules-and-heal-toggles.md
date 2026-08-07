---
id: T-257
title: "Difficulty toggles: heal fainted Pokémon after combat (world / league) + allow relearn in the league"
status: done
type: feature
created: 2026-08-07
updated: 2026-08-07
target-version: 0.7.0
links: [T-234, T-243, T-167, T-258]
blocked-by: []
---

# T-257 — Heal-after-combat + league-relearn toggles

## Context

Owner request: three new **basic** options in the frontend's **Difficulty** panel, all default **off**:

1. **Fainted Pokémon heal after combat** — the party is fully restored after every ordinary battle.
2. **Fainted Pokémon heal after combat in the Pokémon League** — the same, but only for the Elite Four /
   Champion gauntlet.
3. **Allow move relearning in the Pokémon League** — consumed by [[T-258]], which blocks the relearner
   inside the gauntlet unless this is set.

The two heal toggles are **independent and non-overlapping**: a league battle is governed *only* by (2),
every other battle *only* by (1). All four combinations are legal, including "never heal in the world but
heal between league fights".

These are ROM behaviours, so they must be injectable (ADR-022): their home is the runtime settings block
`gRandomizerSettings` (T-234), which the injector already overwrites at its `.rodata` offset (T-243).

## Plan

**C (engine).** Extend `struct RandomizerSettings` with three `bool8` fields (defaults `FALSE`, so a base
built from committed sources behaves exactly as today). New `src/league_rules.c` owns the two predicates
the engine asks for — `IsInEliteFourGauntlet()` (map-based) and `ShouldHealPartyAfterBattle()` — so the
league definition has one home shared with [[T-258]]. Heal hook: the battle-end callbacks in
`src/battle_setup.c`, on the non-defeated paths only (a loss whites out and heals anyway), skipping the
Pyramid / Trainer Hill facility challenges.

**League definition (one home).** "At the Pokémon League" = the Elite Four gauntlet maps: `Hall1`–`Hall5`,
Sidney's / Phoebe's / Glacia's / Drake's rooms and the Champion's room. The **lobby** (`PokemonLeague_1F`,
`_2F`) is deliberately *outside*: it is the prep room, the whiteout respawn point
(`HEAL_LOCATION_EVER_GRANDE_CITY_POKEMON_LEAGUE`) and the only way back out. `HallOfFame` is outside too.
This makes [[T-258]]'s revert conditions fall out of the definition with **no new save state**: a loss
whites out to the lobby, and a Champion win runs a fully-`lockall`ed cutscene straight into `HallOfFame`.

**Pipeline.** New `randomizer/leagueRulesWriter.js` patches the three initializers in
`src/randomizer_settings.c` (same shape as `moveRelearnerPriceWriter.js`); `make.js` calls it; the
injector's `dataDrivenAndToggles` settings sub-writer grows the three fields (struct 16 B → 20 B) and runs
the new writer alongside the other two.

**Frontend.** Three toggles in the Difficulty panel body, defaults false, round-tripping through
Save/Load + `lastConfig`, surfaced in the run summary. They ride to the ROM inside `bundle.config`
(no `toModuleConfig` change — they draw no RNG and change no docs).

Acceptance criteria:
- [x] `healFaintedAfterBattle` / `healFaintedAfterBattleLeague` / `leagueMoveRelearnAllowed` exist in
      `struct RandomizerSettings`, default `FALSE`, read only through `GetRandomizerSettings()`.
- [x] After an ordinary battle the party is healed iff toggle 1 is on; after an Elite Four / Champion
      battle iff toggle 2 is on. The two never interfere; facility challenges are never healed.
- [x] `leagueRulesWriter` patches the three fields, clamps junk to the committed default, and is called
      from `make.js`.
- [x] The injector writes all seven settings values and still refuses a base whose struct does not match
      its sources.
- [x] Three toggles in the frontend Difficulty panel, default off, round-tripping Save/Load and
      `lastConfig`, shown in the run summary; browser bundle rebuilt.
- [x] `cd randomizer && npm test` green (+ backend suite), docs updated
      (`randomizer/docs/randomization-options.md`), changelog line added.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-08-07** — Task created. Branch `feature/T-257-league-rules-and-heal-toggles` off `master`.
  Recon done before planning: the settings struct (T-234) and its injector sub-writer (T-243) are the
  only injectable home for engine toggles; `CB2_EndWildBattle` / `CB2_EndScriptedWildBattle` /
  `CB2_EndTrainerBattle` / `CB2_EndRematchBattle` are the battle-end seams; the league map graph was read
  from the map JSONs (lobby → `Hall5` → Sidney, then `Hall1`..`Hall4` between rooms, Champion → HallOfFame)
  and the entrance door closes behind the player (`VAR_ELITE_4_STATE`), so the gauntlet is genuinely
  one-way and a map-based predicate cannot get stuck.

- **2026-08-07 — IMPLEMENTED (local), suites green: randomizer 2232, backend 232, frontend 206.**
  - **C.** `struct RandomizerSettings` + three `bool8`s (defaults `FALSE`). New `src/league_rules.c` /
    `include/league_rules.h`: `IsInEliteFourGauntlet()` (the ten gauntlet maps, listed by name so an
    upstream map reshuffle breaks the build instead of the rule), `ShouldHealPartyAfterBattle()`,
    `IsMoveRelearnBlockedByLeague()`. `battle_setup.c` gained one static `TryHealPartyAfterBattle()`
    called from the five non-defeat battle-end paths (wild, scripted wild, first, trainer incl. the
    secret-base branch, rematch); it refuses inside the Pyramid / Trainer Hill / Pike, which run on party
    attrition and are the same three cases those callbacks already special-case.
  - **Rejected: a new save flag.** The first design set/cleared a `FLAG_…` on map transition so the two
    revert conditions could be written down literally. Dropped once the map graph made it redundant — the
    lobby is the whiteout respawn and the Champion cutscene never yields menu control, so a pure map
    predicate has no stuck state, needs no save-compat story and costs no flag. The revert conditions are
    now properties of which maps are *in* the set, which is why that reasoning lives in `league_rules.h`
    rather than in a comment next to a flag.
  - **Pipeline.** `randomizer/leagueRulesWriter.js` (8 tests, RED first — it throws rather than write three
    quarters of the rules if a field is missing from the base sources), called from `make.js`; the injector
    grew the struct 16 B → 20 B with the tail padding byte *included* in the base check, so a struct that
    grows behind our back is refused instead of half-written. 5 new injector tests.
  - **One existing test changed shape, deliberately.** `frontend/__tests__/config-form.test.js`'s T-186
    guard sliced `idx + 5000` chars of the Difficulty category; the three new toggles pushed
    `non-boss-level-modifier` out of that window. Fixed by slicing to the category's `</section>` — the
    assertions are unchanged and now insertion-proof. (The magic number had been silently one edit away
    from asserting nothing.)
  - **Frontend.** Three toggles in the Difficulty body (not Advanced), strict-`=== true` on both read and
    apply so a stale saved config can never silently enable a rule; run-summary row collapses the pair into
    Never / Everywhere / Everywhere except the League / League only. 6 new frontend tests, one of which
    pins that these keys **never** reach either `toModuleConfig` (they draw no RNG). Verified by
    screenshot at 1280px and by `npm run shoot`: 75 screens, no horizontal overflow.
  - **Not verifiable locally:** the ROM does not compile here (no GBA toolchain) and these C changes need a
    **base rebuild** (`deploy/build-base.sh`) before an inject-mode deploy can serve them — the injector
    will loudly refuse the current base, since 20 B at `gRandomizerSettings` no longer match.

- **2026-08-07 — Closed.** Owner reviewed the change and confirmed it ("lo veo bien"); merged into `master`
  with [[T-258]]. Suites green at close: randomizer 2232, backend 232, frontend 206.

## Outcome

Three basic Difficulty options, all default off, threaded frontend → `bundle.config` → ROM:
`healFaintedAfterBattle`, `healFaintedAfterBattleLeague`, `leagueMoveRelearnAllowed`. The two heal rules are
mutually exclusive by construction — a battle inside the gauntlet consults only the league one, every other
battle only the other — so all four combinations the owner asked for are expressible, including "never heal
in the world but heal between League fights".

Their home is `gRandomizerSettings` (T-234), which grew 16 B → 20 B: patched by the new
`randomizer/leagueRulesWriter.js` on the compile path and re-derived by the `dataDrivenAndToggles` injector
module on the inject path, so both paths agree by construction rather than by convention. The struct's tail
padding byte is inside the base check, so a struct that grows behind our back is refused instead of
half-written.

**Deviation from the plan — no new save flag.** The plan and the first design carried a `FLAG_…` set and
cleared on map transition, so [[T-258]]'s revert conditions could be written down literally. It was dropped
once the league map graph was read properly: because the lobby is the whiteout respawn point and the
Champion's post-battle sequence is one `lockall` cutscene into the Hall of Fame, a pure map predicate has no
stuck state, no save-compat story and costs no flag. The two revert conditions became properties of *which
maps are in the set* — which is why that reasoning is recorded in `include/league_rules.h`, next to the list
it depends on, and not in a comment beside a flag.

**Verification level, stated plainly.** Everything on the pipeline and frontend side is covered by tests
(19 new; the writer's 8 written RED first) and by a screenshot of the panel. The engine side — the healing
hooks themselves — was reviewed, not executed: there is no GBA toolchain here, so the ROM compiles on
CI/the builder. Nothing about these toggles has run on hardware yet, and the base still needs
`deploy/build-base.sh` before an inject-mode deploy can serve them.

No follow-up tasks spawned. One existing test changed shape (the T-186 Difficulty guard's fixed-size slice);
the assertions are unchanged.
