---
id: T-165
title: Disable Steven tag battle → solo Tabitha boss (Mossdeep Space Center)
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-19
updated: 2026-07-19
target-version: 0.6.0
links: []               # ADR-014 (battle-format), ADR-018 (mixed/gauntlet)
blocked-by: []
---

# T-165 — Disable Steven tag battle → solo Tabitha boss (Mossdeep Space Center)

## Context

A new **"Trainers & bosses"** frontend toggle, **default OFF**, that transforms the Mossdeep Space
Center tag battle into a normal battle vs Tabitha.

Today the Space Center 2F fight is a `multi_2_vs_2` **tag battle**: player + `PARTNER_STEVEN` vs
`TRAINER_MAXIE_MOSSDEEP` + `TRAINER_TABITHA_MOSSDEEP` (see
`data/maps/MossdeepCity_SpaceCenter_2F/scripts.inc:248`). The tag trio is force-typed `'tag'` in every
battle format and rendered as a Tag Battle in the docs — canonical set `TAG_BATTLE_IDS` in
`randomizer/battleFormat.js:25`. Tabitha's tag team is a 3-mon preset that abuses Maxie's weather
(`randomizer/trainers.js:3087`, `abusePartnerWeather`; preset `TABITHA_MOSSDEEP` in
`randomizer/presets.js:440`). The Space Center milestone is one boss cap:
`FLAG_DEFEATED_MAGMA_SPACE_CENTER` (`randomizer/bossCaps.js:52`).

Config threading precedent for a "Trainers & bosses" option: `randomizer/docs/randomization-options.md`
+ the 6 frontend spots (`frontend/js/config-form.js` DEFAULTS/HTML/getConfig/setConfig/_wireEvents,
`frontend/js/randomizer-worker.cjs` + `backend/generator.js` `toModuleConfig`), read in the pipeline via
`randomizer/trainers.js` `getTrainersData(config)`. Per-ROM in-game toggle precedent: `runAndBunWriter.js`
flips a `setvar` literal in a committed base script per config. Story-flag precedent: T-164 edited base
map scripts / `data/scripts/new_game.inc`.

Weather/gimmick seeds live in `randomizer/modules/trainerSeeds.js` (`WEATHER_SAND`, already applied to the
other Tabitha battles). Docs render `battleType` (`'singles'|'doubles'|'tag'`) as the roster pill in
`frontend/template.html`; a crown = boss, an "Ally" tag = `isPartner`.

## Plan

Add config key **`disableStevenTagBattle`** (default `false`). When **OFF**, behaviour is byte-identical to
today (no new RNG draws). When **ON**:

- The randomizer adds a new boss **`TRAINER_TABITHA_MOSSDEEP_NO_TAG`** (id 859; `TRAINERS_COUNT` → 860) —
  a normal `isBoss` (NOT in `TAG_BATTLE_IDS`, so it gets singles/doubles from the battle-format settings
  like any boss), level `CAP.MAGMA_SPACE_CENTER`, class Magma Admin, magma type restriction, **no**
  `abusePartnerWeather`, **`WEATHER_SAND`** seed (prefers sandstorm), 6-slot preset:
  `UBERS / OU / OU / UU / UU / bossMega(OU)`.
- In-game (base script, C-side, gated on a persistent VAR the writer flips): Steven says he'll take Maxie
  and you take Tabitha, asks if ready → YES → a **solo** `trainerbattle` vs `TRAINER_TABITHA_MOSSDEEP_NO_TAG`
  (singles/doubles per the trainer's `.party` "Double Battle" header, which the writer sets from
  `battleType`); on victory the script continues to the **existing** `DefeatedMaxieTabitha` path unchanged
  (same flags, level cap, HM08 Dive, Maxie's aftermath dialogue — "nada cambia").
- Docs: hide the tag trio (Maxie Mossdeep, Tabitha Mossdeep, Steven ally) and show
  `TRAINER_TABITHA_MOSSDEEP_NO_TAG` as a normal (non-tag) boss. Boss-milestone count unchanged
  (`FLAG_DEFEATED_MAGMA_SPACE_CENTER` still one Space Center milestone, now pointing at the no-tag trainer).

### Approach — runtime VAR branch, config-gated by a small writer (mirrors runAndBunWriter)

1. **C constants / data (untestable locally — no GBA toolchain; deferred to CI/owner build):**
   - `include/constants/opponents.h`: `#define TRAINER_TABITHA_MOSSDEEP_NO_TAG 859`; bump `TRAINERS_COUNT`
     859 → 860 (< `MAX_TRAINERS_COUNT` 864).
   - `include/constants/vars.h`: alias a free persistent var → `VAR_DISABLE_STEVEN_TAG_BATTLE`.
   - `src/data/trainers.party`: add a base `=== TRAINER_TABITHA_MOSSDEEP_NO_TAG ===` block (6 mons) so a
     non-randomized build compiles and the writer has an injection target.
   - `data/maps/MossdeepCity_SpaceCenter_2F/scripts.inc`: add a VAR-gated branch at the Steven
     ready-prompt — when the var is set, new dialogue + solo `trainerbattle_no_intro`
     `TRAINER_TABITHA_MOSSDEEP_NO_TAG` (no `ChooseHalfPartyForBattle`), then `goto` the existing
     `DefeatedMaxieTabitha`. Default (var 0) keeps the `multi_2_vs_2` path. Init the var (default 0) in a
     load/transition script; the writer flips it to 1 per-ROM when the option is ON.

2. **Randomizer pipeline (TDD — Jest):**
   - `presets.js`: add split `TABITHA_MOSSDEEP_NO_TAG` (the 6-slot team above).
   - `trainers.js`: define `TRAINER_TABITHA_MOSSDEEP_NO_TAG` boss; include it in the active trainer set
     **only when `config.disableStevenTagBattle === true`**; when ON, exclude the tag trio from the
     **docs** (and the boss-count). Keep default-OFF draws byte-identical.
   - `trainerSeeds.js`: map `TRAINER_TABITHA_MOSSDEEP_NO_TAG → WEATHER_SAND`.
   - `bossCaps.js`: add `TRAINER_TABITHA_MOSSDEEP_NO_TAG` to `FLAG_DEFEATED_MAGMA_SPACE_CENTER` (present
     only when ON; `byId.has` filtering keeps the milestone 1-to-1).
   - `battleFormat.js`: confirm the no-tag trainer is treated as a normal boss (not tag). Add a test.
   - New writer (e.g. `stevenTagWriter.js`) flipping `setvar VAR_DISABLE_STEVEN_TAG_BATTLE, {0|1}` in the
     base Space Center script per config; wire it into `writer.js`/make path.

3. **Frontend (node --test round-trip):** add the toggle (6 spots) with default OFF; forward
   `disableStevenTagBattle` in both `toModuleConfig`s; update `randomizer/docs/randomization-options.md`
   and the round-trip key-list tests.

4. Rebuild the browser bundle (`node build.js`) so the client Worker sees the new option
   ([[project_browser_bundle_must_rebuild]]).

Acceptance criteria:
- [x] New "Trainers & bosses" toggle "Disable Steven tag battle", default OFF, with help text explaining
      it turns the fight into a battle vs Tabitha; round-trips (Save/Load + lastConfig) and forwards
      through both engines. Frontend round-trip tests green.
- [x] Default OFF ⇒ pipeline output byte-identical to pre-change for a fixed seed (no new RNG draws; tag
      battle + docs unchanged). Regression test asserts the tag trio still resolves as today.
- [x] ON ⇒ `TRAINER_TABITHA_MOSSDEEP_NO_TAG` exists as a normal boss with the specified 6-slot team,
      `WEATHER_SAND` seed, no `abusePartnerWeather`, and is assigned singles/doubles by the battle-format
      settings (never `'tag'`). Unit tests cover the preset, seed and battle-format pool.
- [x] ON ⇒ docs show the no-tag Tabitha as a normal (non-tag) boss and omit the tag battle; boss-milestone
      count unchanged (`FLAG_DEFEATED_MAGMA_SPACE_CENTER` still one Space Center milestone). (Falls out of
      the trainer-list gating: the tag trio is absent from the list, the no-tag boss is a normal `isBoss`.)
- [x] C-side: trainer constant + `TRAINERS_COUNT` bump, base `.party` block, VAR alias, and the VAR-gated
      Space Center script branch are in place; the writer flips the var per config. (Compiles/plays only on
      the CI/owner builder — manual ROM test deferred.)
- [x] `cd randomizer && npm test` green; `randomizer/docs/randomization-options.md` updated;
      `CHANGELOG.brooktec.md` `[Unreleased]` line added.
- [ ] Owner manual ROM test on a built ROM (see below) — pending.

Owner manual-test (deferred, on a built ROM): with the option OFF the Space Center plays as the vanilla
tag battle; with it ON, Steven says he takes Maxie / you take Tabitha, the solo Tabitha battle runs
(singles or doubles per settings), and after winning the story proceeds exactly as before.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-19** — Task created. Recon complete (tag-battle handling, config threading, docs rendering,
  C-side IDs/vars, `.party`/script structure). Chosen approach: runtime VAR branch flipped per-ROM by a
  small writer (mirrors `runAndBunWriter`), keeping default-OFF byte-identical. Interpretation of the spec:
  when ON the docs drop the whole tag battle (Maxie + tag-Tabitha + Steven ally) and show one normal
  Tabitha boss; "cantidad de bosses" = the one Space-Center level-cap milestone, which is preserved.
- **2026-07-19** — Implemented end-to-end (TDD, red→green throughout):
  - `presets.js` `TABITHA_MOSSDEEP_NO_TAG` split (UBERS/OU/OU/UU/UU + `bossMega(OU)`); `trainerSeeds.js`
    `WEATHER_SAND`; `bossCaps.js` adds the no-tag trainer to `FLAG_DEFEATED_MAGMA_SPACE_CENTER` (still one
    milestone via `byId` filtering); `battleFormat` guard (normal `bossTrainers` pool, never `tag`).
  - `trainers.js`: `TRAINER_TABITHA_MOSSDEEP_NO_TAG` boss (Magma Admin, magma-type restriction, no
    `abusePartnerWeather`) + config gating right after the trainer array — OFF drops the no-tag boss
    (byte-identical: bag/preset construction is rng-free, so the always-evaluated literal costs no draws),
    ON drops the tag trio. Verified rng-safety: full suite green, OFF path unchanged.
  - Config threading: `config-form.js` (DEFAULTS/HTML toggle/getConfig/setConfig/_wireEvents), both
    `toModuleConfig`s (worker `.cjs` + backend `generator.js`); frontend round-trip tests updated.
  - C-side: `opponents.h` `TRAINER_TABITHA_MOSSDEEP_NO_TAG=859`, `TRAINERS_COUNT` 859→860 (<
    `MAX_TRAINERS_COUNT` 864); `vars.h` repurposed `0x40A8` → `VAR_DISABLE_STEVEN_TAG_BATTLE`;
    `trainers.party` base 6-mon block; `MossdeepCity_SpaceCenter_2F/scripts.inc` VAR-gated branch
    (`setvar …,0` init in OnTransition; `ReadyForSoloTabithaPrompt` + `DoSoloTabithaBattle` using
    `trainerbattle_no_intro` → `goto DefeatedMaxieTabitha`) + new `StevenSplitTargets` text.
  - `stevenTagWriter.js` (mirrors `runAndBunWriter`) flips the `setvar` literal per config; wired into
    `make.js` (restored by `restore()` — `git checkout -- data/maps/`). Discovery: singles↔doubles in map
    scripts is driven ONLY by the `.party` "Double Battle" header (gym/grunt `trainerbattle_*` commands are
    static), so a static `trainerbattle_no_intro` yields the right format.
  - Docs (`randomization-options.md`) + `CHANGELOG.brooktec.md [Unreleased]` updated; browser bundle
    rebuilt (`node build.js`; `bosscaps.json` still 31 bosses). Static script checks pass (no dangling
    labels; VAR/trainer/text/macro all resolve); live writer smoke test ON→1 / OFF→0 (OFF a no-op).
  - Tests: randomizer Jest 1377 pass (+4 new: preset, seed, gating, writer), frontend node --test 86 pass,
    tracker OK. GBA/overworld build is not runnable locally (no toolchain) → deferred to CI/owner.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
