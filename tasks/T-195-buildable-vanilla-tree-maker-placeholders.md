---
id: T-195
title: Make the vanilla tree assemble/link — define fallbacks for maker placeholder tokens
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-23
updated: 2026-07-23
target-version: 0.6.0
links: []
blocked-by: []
---

# T-195 — Buildable vanilla tree: fallback defines for maker placeholder tokens

## Context

The committed source contains **undefined placeholder tokens** that only the randomizer maker
(`randomizer/writer.js`) substitutes with real values at ROM-build time. A plain `make` (with no maker
run) — i.e. the upstream **CI `build.yml`** (`make -O all` → `make LTO=1` → `make check`) — cannot
resolve them, so CI has been **red since these placeholders were introduced** (`48701ce` "Gym rewards"
etc.), and `make check` (the C battle tests) never runs there.

Found while diagnosing repeated ROM-build failures (the 3 real ROM-build breakers are separate one-off
data/source bugs, fixed in `df62018` / `fdd8892` / `90ee010`). This task is the SEPARATE, pre-existing
CI-red issue. It does NOT affect the `/api/produce` ROM build (the maker substitutes the tokens there).

The undefined placeholder tokens (used as bare constants, so they break assembly/link):
- `GYM_REWARD_MON` (species) — `setvar`/`givemon` in 11 gym/museum/weather scripts (the `setvar` macro
  `.if`-validates its value → "non-constant expression").
- `GYM_REWARD_ITEM` (held item) — `givemon` in 3 of those.
- `SPECIES_LEGEND1/2/3` (species) — `playmoncry`/`setwildbattle` in `SkyPillar_Top`.
- `ITEM_MEGA_01`…`ITEM_MEGA_21` (mega stones) — mega-trainer item balls (writer.js:535/563/568).
- (`GYM_REWARD_NAME` and the `SPECIES_LEGEND*` in `src/data/script_menu.h` are inside string literals
  → harmless; `SPECIES_MEW`/`SPECIES_REGI*` are real constants → fine.)

## Plan

Define each undefined token as a benign fallback (`SPECIES_NONE` / `ITEM_NONE`) in the constants
headers already included by `data/event_scripts.s` (map-script assembly) and by C — `constants/species.h`
and `constants/items.h`. The maker string-replaces the tokens in the `.inc` files BEFORE `make`, so real
ROMs are unaffected; the fallbacks only take effect when the maker has not run (CI / `make check`).

Acceptance criteria:
- [x] Undefined maker placeholders get fallback `#define`s in `constants/species.h` + `constants/items.h`.
- [x] A plain `make -j` on the committed tree links and produces `pokeemerald.gba` (verified on the build box: EXIT=0).
- [ ] CI `build.yml` goes green on push (`make all` + `make check`) — confirmed after the owner pushes.
- [ ] Owner confirms (CI green).

## Progress log

- **2026-07-23** — Diagnosed the CI-red root cause: undefined maker placeholder tokens make the vanilla
  tree non-plain-buildable. Enumerated all families (GYM_REWARD_MON/ITEM, SPECIES_LEGEND1/2/3,
  ITEM_MEGA_01–21). Added fallback `#define`s (→ SPECIES_NONE / ITEM_NONE) in `include/constants/species.h`
  and `include/constants/items.h`. Verified on the build box: a full `make -j` on the committed tree now
  compiles, links (`arm-none-eabi-ld`) and produces `pokeemerald.gba` — **EXIT=0** (previously failed at
  the gym `setvar .if`, then at `ITEM_MEGA_*` link refs). Maker/ROM build unaffected (it substitutes the
  tokens). Committed locally; awaiting push so CI re-runs green.

## Outcome

<!-- Filled when closing: CI green confirmed. -->
