---
id: B-022
title: location_nicknames.c missing includes (EOS / map constants) — breaks the C build
status: fixing          # open | fixing | fixed | wont-fix
severity: critical      # critical | major | minor
created: 2026-07-07
updated: 2026-07-07
found-in: 0.6.0         # introduced by T-070 (unreleased), caught by the post-deploy box compile-verify
fixed-in:
regression-test:        # C-compile-only bug — no JS surface. Real regression = a CI/deploy game-compile
                        # gate (recommended follow-up, T-071). Interim proof: the on-box compile-verify.
links: [T-070, B-020, T-071]
---

# B-022 — location_nicknames.c missing includes (EOS / map constants) — breaks the C build

## Symptom

Post-deploy box compile-verify of the T-070 C failed:

```
src/location_nicknames.c:50:35: error: 'EOS' undeclared (first use in this function)
make: *** [build/modern/src/location_nicknames.o] Error 1
```

`src/location_nicknames.c` is a committed file compiled in **every** build, so this breaks **all** ROM
builds on the box (feature on or off) — same class as B-020, caught the same way (the deploy compiles only
the decomp *tools*, not the game).

## Root cause

`location_nicknames.c` included only `global.h` + `pokemon.h`, which do **not** transitively pull:
- `constants/characters.h` → `EOS` (used to detect an empty nickname), and
- `constants/maps.h` (`MAP_GROUP`/`MAP_NUM`) + `constants/map_groups.h` (`MAP_*`) — needed by the rows the
  ROM maker splices in when the feature is ON (the committed sentinel row uses none of these, so a
  feature-off compile alone would not have surfaced the maps.h/map_groups.h gap — a second latent break).

## Fix

Add the missing includes to `src/location_nicknames.c` (`constants/characters.h`, `constants/maps.h`,
`constants/map_groups.h`) and `constants/characters.h` to `src/wild_encounter.c` (its T-070 hook also uses
`EOS`). Verified by re-running the box compile of `location_nicknames.o` + the hooked `wild_encounter.o` /
`script_pokemon_util.o`, plus a **writer-filled** table compile (real `MAP_GROUP(MAP_*)` rows) — FAILED
before, PASS after.

**Durable follow-up (recommended):** B-020 and B-022 are the same failure mode — GBA C that only compiles
on the builder slipping through because the deploy compiles tools, not the game. Add a full `make` (or
`make -j` of the changed objects) to the deploy preflight / CI so a non-compiling `src/` change can never
reach PRO. Tracked for a task.
