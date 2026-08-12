---
id: B-075
title: The Mauville town trader reuses vanilla's decoration-trader label, so the ROM cannot be built
status: fixed           # open | fixing | fixed | wont-fix
severity: critical      # critical | major | minor
created: 2026-08-12
updated: 2026-08-12
found-in: 0.9.0
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: scripts/__tests__/asm-duplicate-labels.test.mjs   # "B-075: no global event-script label is defined twice in the assembled set"
links: [T-270, T-273]
---

# B-075 — The Mauville town trader reuses vanilla's decoration-trader label, so the ROM cannot be built

## Symptom

`make` dies while assembling the event scripts, so **no ROM can be produced at all** — not a base, not a
user's:

```
data/scripts/mauville_man.inc: Assembler messages:
data/scripts/mauville_man.inc:148: Error: symbol `MauvilleCity_PokemonCenter_1F_EventScript_Trader' is already defined
make: *** [Makefile:454: build/modern/data/event_scripts.o] Error 1
```

Found on 2026-08-12 by the first base rebuild since the 15-trader rework landed (T-269/T-270, 2026-08-11).
The feature has therefore **never compiled**: the box kept serving its 2026-08-09 base, and injection into
that base is what was failing (see T-273), so the assembler error had no chance to surface. There is no GBA
toolchain on the dev machine, and `make check` only runs in CI or on the builder, so nothing local caught it
either.

## Root cause

A name collision between the rework and upstream, in the one map where it was possible.

Every town trader is `<Map>_PokemonCenter_1F_EventScript_Trader`, defined at line 8 of that map's
`scripts.inc` — fifteen of them, consistent. But Mauville's Pokémon Center is *also* where vanilla puts the
**Mauville Man's "Trader" variant** (decoration swaps), whose script `data/scripts/mauville_man.inc:148`
already carries exactly that name and is dispatched by variant from line 6
(`case MAUVILLE_MAN_TRADER, MauvilleCity_PokemonCenter_1F_EventScript_Trader`).

`data/event_scripts.s` `.include`s every map's `scripts.inc` **and** `data/scripts/mauville_man.inc` into one
translation unit, and both labels are global (`::`), so the assembler sees the same symbol defined twice.
Two different NPCs stand in that room — the Old Man object at (2,3) and the new trader at (3,3) — so neither
definition is redundant; only the name is wrong.

The naming convention is what hid it: it is derived from the map, and it is correct for the other fourteen.

## Fix

Rename the **new** script (never vanilla's dispatch target) in
`data/maps/MauvilleCity_PokemonCenter_1F/scripts.inc` to
`MauvilleCity_PokemonCenter_1F_EventScript_TownTrader`, matching the shared flow it jumps into
(`Common_EventScript_TownTrader`), and update the object's `script` in that map's `map.json`.

Regression test — `scripts/__tests__/asm-duplicate-labels.test.mjs`, written first and verified failing on
the collision: it walks `.include` from `data/event_scripts.s` transitively (the exact set the assembler
sees) and asserts no global label is defined twice. It needs **no toolchain**, so it runs in the fast suite
and in `deploy/update.sh`'s preflight — which means the next occurrence is caught before a 20-minute base
build instead of by it. It also proves this was the only collision of its kind in the tree.

Two things the guard taught while being written, both worth keeping:

- **Assembler conditionals are not duplicates.** The first version flagged `MtChimney_EventScript_BagIsFull`,
  which upstream defines in both arms of an `.if OW_SHOW_ITEM_DESCRIPTIONS / .else` where only one is ever
  assembled. The check now tracks which `.if/.else/.endif` arm each label sits in and reports only
  occurrences that can coexist.
- **The naming convention was itself a spec, so the spec changed.**
  `randomizer/__tests__/unit/townTraderPlacement.test.js` identified each trader NPC as
  `<MapDir>_EventScript_Trader`, which cannot hold in Mauville. It now finds the script by what it *does* —
  the block that arms this town's `INGAME_TRADE_*` and jumps into `Common_EventScript_TownTrader` — which is
  name-independent and a stronger claim than the old one. Verified it still fails when Mauville's NPC is
  pointed at another script (3 red) and passes when restored.
