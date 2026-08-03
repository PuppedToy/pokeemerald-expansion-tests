---
id: B-061
title: "Boss reward message names the wrong species — it buffers VAR_RESULT after `givemon` has overwritten it"
status: open
severity: major
created: 2026-08-02
updated: 2026-08-02
found-in: 0.5.0
fixed-in:
regression-test:
links: [T-235]
---

# B-061 — Boss reward message names the `givemon` result, not the species

## Symptom

Owner play-test, 2026-08-02: every boss/gym reward announces the wrong Pokémon — "You received a
**Bulbasaur**!" — and then hands over the correct one (the species the docs list). The gift itself is
right; only the message is wrong. Reproduces on every reward.

Not an injection defect: the same scripts run in a compiled ROM, so this has been happening since T-235.
`gGymRewards` is injected correctly (verified against the docs: Gym 1 → Pachirisu, Gym 3 → Slowpoke).

## Root cause

The reward script buffers the name out of `VAR_RESULT` *after* `givemon` has already clobbered it:

```
setvar VAR_0x8004, 0                                @ GYM_REWARD_RUSTBORO
special GetGymReward                                @ VAR_RESULT = the reward species
copyvar VAR_TEMP_TRANSFERRED_SPECIES, VAR_RESULT    @ …saved here, and then ignored
givemon VAR_RESULT, 13                              @ givemon WRITES its outcome back into VAR_RESULT
bufferspeciesname STR_VAR_1, VAR_RESULT             @ …so this names species 0/1/2
```

`givemon` returns `MON_GIVEN_TO_PARTY` (0), `MON_GIVEN_TO_PC` (1) or `MON_CANT_GIVE` (2)
(`include/constants/pokemon.h`). Species **1 is Bulbasaur**, which is what a full party — the normal case
in a randomizer run, so the gift goes to the PC — produces every single time. With a free party slot the
message instead names species 0 and shows the `??????????` placeholder.

The species is already preserved on the line above, in `VAR_TEMP_TRANSFERRED_SPECIES`, so the script has
what it needs and simply reads the wrong var.

**Eleven scripts share the mistake** (all of them the T-235 reward sites):
`RustboroCity_Gym`, `DewfordTown_Gym`, `MauvilleCity_Gym`, `LavaridgeTown_Gym_1F`, `PetalburgCity_Gym`,
`FortreeCity_Gym`, `MossdeepCity_Gym`, `SootopolisCity_Gym_1F`, `LilycoveCity`,
`Route119_WeatherInstitute_2F`, `SlateportCity_OceanicMuseum_2F`.

## Fix

<!-- Filled during the fix. One token per script: buffer from VAR_TEMP_TRANSFERRED_SPECIES (already set
     one line earlier) instead of VAR_RESULT — or move the bufferspeciesname above the givemon. Prefer the
     former: it keeps working if a later edit reorders the give.

     This is a base change, so it invalidates the golden base and the corpus hashes; it should ride along
     with the next rebuild rather than triggering one of its own.

     Regression test: a source guard over data/maps/**/scripts.inc — no `bufferspeciesname` may read
     VAR_RESULT within the reward block that follows a `givemon VAR_RESULT`. Fails on all eleven today.
     (The in-game text itself is not reachable from the Jest suite; the ordering is what can be pinned.) -->
