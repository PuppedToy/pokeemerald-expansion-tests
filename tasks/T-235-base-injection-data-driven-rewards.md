---
id: T-235
title: "Base+injection Phase 2 — data-driven gym/static rewards (out of map scripts)"
status: done
type: refactor
created: 2026-07-27
updated: 2026-08-01
target-version: 0.7.0
links: [T-229, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-232, T-233]
---

# T-235 — Data-driven rewards (gym/museum/weather + static legendaries)

## Context
Gym/museum/weather rewards (11× `scripts.inc`) and static legendaries (5× `scripts.inc` + `script_menu.h`)
are edits inside compiled script bytecode → hardest to inject. Make them table-driven. See
[strategy Group C](../docs/base-plus-injection-strategy.md#group-c--currently-map-script--define-must-be-redesigned-to-data-driven-in-the-base).

## Plan
Add reward + static-encounter data tables the scripts read (indexed by gym / encounter), replacing the
in-script species/item literals. Move reward-name strings to a name table. Repoint the current writers to
fill the tables. Verify via T-233.

Acceptance criteria:
- [x] Gym/museum/weather rewards read from `gGymRewards[]` (via `GetGymReward`); 0 `GYM_REWARD_*` tokens in
      the 11 scripts; reward name is dynamic (`bufferspeciesname`).
- [x] Static legendaries read from `gStaticEncounters[]` (via `SetupStaticEncounter`); Regi×3/Mew/SkyPillar×3
      converted; the SkyPillar legend menu is dynamic (`dynmultipush` species names) — no static name table.
- [x] `make` compiles all 16 scripts + the 3 specials; `gGymRewards`/`gStaticEncounters` are in the `.map`
      (`.rodata`, read via runtime index → injectable). Randomizer suite green (1697).
- [x] Owner play-tested a gym reward + a static legendary + the SkyPillar dynamic menu (2026-08-01,
      consolidated T-236 run) — all correct. (Deferred: delete the now-dead legacy token `.replace` loops
      in writer.js — tracked in T-247.)

## Progress log
- **2026-07-27** — Created (Phase 2).
- **2026-07-28** — Design (analysis before implementation; no code yet).
  - **Current mechanism** (`randomizer/writer.js` ~L358-444): a per-run token substitution. 11 gym/museum/
    weather reward scripts carry `GYM_REWARD_MON` (→ `givemon`/`setvar` species operand), `GYM_REWARD_NAME`
    (→ a `.string` message), and `GYM_REWARD_ITEM` (mega stone; gyms idx 2/8/9). 5 static-legendary scripts
    (DesertRuins/IslandCave/AncientTomb/NewMauville/SkyPillar_Top) + `src/data/script_menu.h` carry the
    species/name. All are baked into compiled bytecode → not injectable (Group C).
  - **Design — table + `special` + dynamic name (reuses the T-234 `noipa` pattern):**
    1. New C: `struct GymReward { u16 species; u16 item; } gGymRewards[11]` and
       `struct StaticEncounter { u16 species; } gStaticEncounters[]` (regirock/regice/registeel/mew/
       legend1-3), read ONLY through `noipa` accessors (const/volatile alone folds under LTO —
       [[project_injectable_settings_noipa_pattern]]).
    2. Scripts can't index a C array, so add a `special` (C helper in `data/specials.inc`) that reads
       `g*Rewards[VAR_0x8004]` into `VAR_RESULT` (species) + a var (item). Each reward script becomes
       `setvar VAR_0x8004,<idx>; special GetGymRewardSpecies; givemon VAR_RESULT,<lvl>;
       bufferspeciesname 0,VAR_RESULT; msgbox` — the NAME becomes dynamic via `bufferspeciesname`, which
       eliminates the variable-length `GYM_REWARD_NAME` `.string` (and the script_menu.h legend names).
    3. Writer: patch the `gGymRewards[]`/`gStaticEncounters[]` initializers (fixed-size data) instead of the
       script tokens — same shape as moneyWriter (T-234).
  - **Risk/scope:** 11 + 5 scripts rewritten + a new special + 2 tables + writer rewrite; verify the
    special/`bufferspeciesname` flow gives behaviour-identical rewards. Hardest of the reward group
    (item-picker T-236 is harder still). Big enough for its own focused session.
  - **Injection payoff:** rewards become fixed-size table overwrites (Group A) — the injector writes
    `gGymRewards[]`/`gStaticEncounters[]` at their `.map` offsets.
- **2026-07-28 — GYM proof works end-to-end (Rustboro).** Key enabler from the agent audit: `givemon`,
  `bufferspeciesname`, `additem` all VarGet their args, so no C-side give is needed — the special just
  returns the species. Implemented: `include/randomizer_rewards.h` + `src/randomizer_rewards.c`
  (`const struct GymReward gGymRewards[11]` between `@GYM_REWARDS_START/END` anchors + the
  `void GetGymReward(void)` special: VAR_0x8004 index → VAR_RESULT species, VAR_0x8005 item); registered in
  `data/specials.inc`. Rustboro's reward block became
  `setvar VAR_0x8004,0; special GetGymReward; copyvar VAR_TEMP_TRANSFERRED_SPECIES,VAR_RESULT;
  givemon VAR_RESULT,13; bufferspeciesname STR_VAR_1,VAR_RESULT`; its `.string` now uses `{STR_VAR_1}`.
  `writer.js` regenerates the `gGymRewards[]` block between anchors AND keeps the legacy token loop (no-op
  on migrated scripts → staged rollout). Randomizer suite green (1697). On PRO: **build exit 0**, `gGymRewards`
  (R, .rodata) + `GetGymReward` (T) in nm, array read with a RUNTIME index so NOT folded (no noipa needed
  here — the constant-index case needed it, T-234); baseline ROM had `gGymRewards[0]={441,0}`,
  `[2]={322,323}` (writer-filled, incl. the mega-stone item). Injectable ✓.
  - **Rollout remaining (mechanical, same edit per file — index, level, mega-arg):** DewfordTown_Gym idx1
    lvl19; MauvilleCity_Gym idx2 lvl29 MEGA; LavaridgeTown_Gym_1F idx3 lvl36; PetalburgCity_Gym idx4 lvl39;
    FortreeCity_Gym idx5 lvl46; MossdeepCity_Gym idx6 lvl56; SootopolisCity_Gym_1F idx7 lvl64;
    SlateportCity_OceanicMuseum_2F idx8 lvl23 MEGA; Route119_WeatherInstitute_2F idx9 lvl41 MEGA;
    LilycoveCity idx10 lvl48. (MEGA = add `, VAR_0x8005` to givemon.) Then delete the legacy token loop.
  - **Then the STATICS group** (separate, harder): `setwildbattle`/`playmoncry` take constants only → need a
    `SetupStaticEncounter` special that reads `gStaticEncounters[]` and calls CreateScriptedWildMon + PlayCry
    (Regi ×3 + Mew + SkyPillar ×3); the SkyPillar legend *menu names* (script_menu.h multichoice) are the
    variable-length-text sub-problem. Finish → full-corpus verify → re-snapshot manifest → owner play-test.
- **2026-07-28 — GYM GROUP COMPLETE (all 11) + verified.** Rolled out the pattern to the other 10 reward
  scripts via a scripted uniform edit; **0 `GYM_REWARD_*` tokens remain** in any of the 11 scripts. Earlier
  full-corpus build-health check: all 10 bundles built, **0 BUILD_FAILED** — the writer's `gGymRewards[]`
  regeneration is robust across varied configs. On PRO: **baseline build exit 0**, all 11 `gGymRewards[]`
  entries filled with real species; the 3 mega gyms (idx 2/8/9) carry real mega-stone items
  (322+323, 304+319, 362+327). Gyms are now data-driven + injectable. **Left for later:** (a) delete the
  now-dead legacy token `.replace` lines in writer.js (harmless no-op today; the loop still collects
  gymRewardItems for the table); (b) the STATICS group (above); (c) ONE full-corpus **re-snapshot** at the
  end of T-235 (deferred — statics will change the base again, so re-snapshot once). Box holds a
  `T-235 wip: all 11 gyms` commit.

- **2026-07-28 — STATICS group Regi×3 + Mew COMPLETE + verified.** Added `gStaticEncounters[7]`
  ({species,level}, anchors) + two specials to `randomizer_rewards.c`/`.h` + `data/specials.inc`:
  `SetupStaticEncounter` (VAR_0x8004 index → `PlayCry_Script` + `CreateScriptedWildMon` from the table;
  keeps the following `waitmoncry`/`StartRegiBattle`/`BattleSetup_StartLegendaryBattle` working) and
  `GetStaticEncounterSpecies` (index → VAR_RESULT species, for the "flew away" branch which buffers the
  name from VAR_0x8004). Converted DesertRuins/IslandCave/AncientTomb/NewMauville_Entrance: the encounter
  block became `setvar VAR_0x8004,idx; special ForcePerfectIVsOnNextEncounter; special SetupStaticEncounter;
  delay 40; waitmoncry` (ForcePerfectIVs BEFORE the create so perfect IVs still apply; `delay 40` kept), and
  the ran-away branch resolves the species via GetStaticEncounterSpecies → copyvar VAR_0x8004. writer.js
  regenerates the `gStaticEncounters[]` block (all 7; legends staged). Randomizer suite green (1697). On PRO:
  **build exit 0**, `gStaticEncounters`/`SetupStaticEncounter`/`GetStaticEncounterSpecies` in nm,
  `gStaticEncounters[]` = {1413,36}/{335,39}/{1054,46}/{775,39}/{382,61}/{716,61}/{646,61} (writer-filled,
  incl. randomized legends). Injectable ✓. Box commit `T-235 wip: static encounters (Regi x3 + Mew)`.
  - **Only SkyPillar legends remain in T-235:** convert the 3 `PickLegendaryN` encounter blocks (same
    SetupStaticEncounter pattern, idx 4/5/6 — table already filled), AND convert the static multichoice menu
    (`MULTI_SKYPILLAR_TOP_LEGEND`, script_menu.h names) to a **`dynmultipush`×3 + `dynmultistack`** sequence
    (each option `bufferspeciesname STR_VAR_1, <legend species>` then push `{STR_VAR_1}`) so the menu text is
    runtime/injectable (the agent confirmed dynmultipush runs `StringExpandPlaceholders`). Then: delete the
    dead legacy token `.replace` loops in writer.js, ONE full-corpus re-snapshot, owner play-test.

- **2026-07-28 — SkyPillar done → T-235 IMPLEMENTATION COMPLETE.** Converted the 3 `PickLegendaryN`
  encounters (idx 4/5/6, same SetupStaticEncounter pattern) and replaced the static `multichoice`
  (`MULTI_SKYPILLAR_TOP_LEGEND`) with `dynmultipush`×3 + `dynmultistack`: each option does
  `setvar VAR_0x8004,idx; special GetStaticEncounterSpecies; bufferspeciesname STR_VAR_1,VAR_RESULT;
  dynmultipush SkyPillar_Top_Text_LegendName,<case>` (new text `{STR_VAR_1}$`), so the legend menu names are
  runtime/injectable — no `script_menu.h` name table. On PRO: **build exit 0**, 0 reward tokens remain in any
  of the 16 scripts. **All rewards (11 gyms + 5 statics) are now data-driven + injectable.** Final full-corpus
  re-snapshot running to refresh manifest.json to the T-235 base. **To close:** owner play-test (a gym reward
  + a static + the SkyPillar dynamic menu — the novel bit) → commit the re-snapshot. **Deferred cleanup:**
  the legacy token `.replace` loops in writer.js are now dead no-ops (the gym loop still collects
  gymRewardItems; the static/legend token replaces + the unused `MultichoiceList_SkypillarTopLegend` in
  script_menu.h can be removed — left out now to avoid churn + a replacementLog/docs regression at the tail).

- **2026-07-30 — re-snapshot done + manifest updated + ops fix.** Full-corpus re-snapshot on the T-235 base:
  **12/12 built, 0 BUILD_FAILED** (first attempt hit the container PID cap → 5 failed with `fork: Resource
  temporarily unavailable`; NOT a T-235 regression — the app container's PID 1 was `node`, which doesn't reap
  orphaned build subprocesses, so heavy `make` leaked ~4500 zombies until the pids cgroup capped). **Root fix
  applied:** `init: true` on the app service in `deploy/docker-compose.yml` (docker-init/tini reaps zombies) +
  `docker compose up -d --force-recreate app` — verified `pid1=docker-init`, zombies=0, web healthy. Then the
  re-run built 10/10 clean. `manifest.json` updated to the T-235 base (`d9dd562a…`) with the 12 hashes + the
  three injectable symbols (`gGymRewards` @ 0xbf0114, `gStaticEncounters` @ 0xbf0140, `gRandomizerSettings` @
  0xbf015c). Play-test ROM archived at `~/emerald-playtest/T-235-rewards.gba` (+ MANIFEST row: check a gym
  reward, a static legendary, and the Sky Pillar dynamic menu). **T-235 implementation + re-snapshot done;
  only the owner play-test remains to close.**

- **2026-08-01 — CLOSED.** Owner play-tested the consolidated ROM (gym reward, static legendary, and the
  Sky Pillar dynamic menu — the novel piece) and confirmed correct behaviour.

## Outcome

**Shipped:** all 16 reward sites are data-driven. Gym/museum/weather rewards read
`gGymRewards[11]` ({species, item}) through the `GetGymReward` special — 0 `GYM_REWARD_*` tokens
remain in the 11 scripts, and the reward message names the Pokémon via `bufferspeciesname` instead of
a substituted `.string`. Static legendaries (Regi×3, Mew, Sky Pillar×3) read `gStaticEncounters[7]`
({species, level}) through `SetupStaticEncounter` / `GetStaticEncounterSpecies`. `writer.js`
regenerates both tables between anchors. Both tables sit in `.rodata` and are read with a **runtime
index**, so LTO can't fold them — no `noipa` accessor needed here (unlike T-234's fixed-index struct).

**Two problems the plan didn't foresee, and how they were solved:**
- `setwildbattle`/`playmoncry` only take constants, so a static encounter can't be expressed as a
  table lookup in script alone. Solved with a C special that calls `PlayCry_Script` +
  `CreateScriptedWildMon` from the table, keeping the following `waitmoncry` /
  `BattleSetup_StartLegendaryBattle` working unchanged. `ForcePerfectIVsOnNextEncounter` had to stay
  **before** the create so perfect IVs still apply.
- The Sky Pillar legend menu was a static `MULTI_SKYPILLAR_TOP_LEGEND` name table — variable-length
  text, the worst case for injection. Replaced with `dynmultipush`×3 + `dynmultistack`, each option
  buffering its species name at runtime, so no name table exists at all. This construct later turned
  out to be the trigger for [[B-055]] — it works from a coord trigger (as here) but the engine's
  dynamic-menu path lacked the input guard that the static path had, which only surfaced when T-236
  opened one from an A press.

**Verification:** `make` exit 0; `gGymRewards` / `gStaticEncounters` present in nm/`.map`; ROM dumps
showed all 11 gym entries filled (including the 3 mega-stone gyms) and the 7 encounters with the
randomized legends; randomizer suite green; owner play-test signed off.

**Deferred (not lost):** the legacy token `.replace` loops in `writer.js` are now dead no-ops (the gym
loop still collects `gymRewardItems` for the table) and `MultichoiceList_SkypillarTopLegend` is
orphaned. Both are tracked in **[T-247]**, the single Phase-2 cleanup sweep, so the base is only
re-snapshotted once.
