---
id: B-060
title: "Ground mega stones are never injected — the object-event item stays ITEM_MEGA_nn (= ITEM_NONE), so the ball hands over a corrupt item"
status: open
severity: critical
created: 2026-08-02
updated: 2026-08-02
found-in: 0.7.0
fixed-in:
regression-test:
links: [T-236, T-243, T-233, B-057, ADR-022]
---

# B-060 — Ground mega stones are never injected

## Symptom

Owner play-test of an injected ROM (bundle `2653882998`, 2026-08-02): picking up a mega stone lying on
the ground — e.g. in Jagged Pass — shows

> Player put away the ???????? in the ITEMS POCKET.

and the item then vanishes from the bag. Every placed mega stone in the run is affected (9 in this
bundle; 11 placeholder sites exist across the maps).

## Root cause

**The injector never writes this output at all.** It is not a wrong byte — it is a missing one.

A mega-stone ball is an `object_event` in the map's JSON whose `trainer_sight_or_berry_tree_id` field
carries the item to give. The base ships a placeholder:

```json
// data/maps/JaggedPass/map.json
"trainer_sight_or_berry_tree_id": "ITEM_MEGA_02",
```

and `include/constants/items.h` defines every placeholder as nothing at all:

```c
#define ITEM_MEGA_01 ITEM_NONE
#define ITEM_MEGA_02 ITEM_NONE
```

The compile path rewrites that field per run — `writer.js`'s `updateMegaTrainer()` replaces
`ITEM_MEGA_<id>` with the run's actual mega stone and the map compiler bakes it into the map's
object-event table. Injection does none of this, so the compiled-in value stays `ITEM_NONE` (id 0), whose
item name in `gItemsInfo` is literally `????????`. The game gives item 0, which the bag then drops.

T-236's note that item placement had "moved into `gItemPicks`" covered the route items; the mega-stone
object-event field is a **different** map-data write and was never accounted for by any Phase-3 module.
`gMegaTrainerHidden` — the flag that hides a mega trainer with no stone to give — *is* injected, which is
why the 12 hidden ones behave correctly and only the 9 placed ones are broken.

### Why every gate missed it, and what to do about that

This is the structural hole, and it is worth more than the bug: **GATE-3 compares the bytes the injector
wrote against `compile()`'s. An output the injector never writes produces no journal entry, so there is
nothing to compare.** Full-image comparison would have caught it, but [[B-057]] (compile's layout drifts
with its own data) is exactly why we stopped doing that.

So the missing check is a **coverage** one, not an equivalence one: every file the compile path mutates
must be claimed by a module or explicitly declared out of scope. The inventory already exists — the
never-commit list in CLAUDE.md — and `data/maps/**/map.json` is on it. Auditing that list against the
registry is what should have happened before the first play-test, and it is the check to add now (see
also the `src/data/script_menu.h` entry, which T-247 confirmed is dead, and `data/maps/**/scripts.inc`,
which T-243 covers only for the four Group-D setvars).

## Fix

<!-- Filled during the fix. The data is injectable: the 423 `<Map>_ObjectEvents` tables are all in the
     base's .sym (JaggedPass_ObjectEvents at 0xd7cbe0, …), so a module can locate the map's object-event
     array, find the event whose item field still holds the placeholder, and write the run's stone.
     NOTE the .sym reports size 0 for these symbols, so the entry stride and the field offset must be
     derived from the base's own data (the same discipline as every other module) — and the event must be
     identified by matching the base map.json's own object_events, not by index alone.

     Regression test: extend the corpus gate with a coverage assertion — for each bundle, every
     ITEM_MEGA_nn placeholder site in data/maps/**/map.json must hold a real item id in the injected ROM
     (and equal what compile() put there). Fails today for all 9 placed stones. -->
