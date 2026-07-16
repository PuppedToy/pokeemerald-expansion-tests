---
id: T-077
title: Remove all held items from wild Pokémon
status: done
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-09
updated: 2026-07-15
target-version: 0.6.0
links: []
blocked-by: []
---

# T-077 — Remove all held items from wild Pokémon

## Context

Wild Pokémon can be encountered holding an item (e.g. Cherubi with a Miracle Seed,
Luvdisc with a Heart Scale). We want zero held items on wild Pokémon in the ROM.

The only source of wild held items is `gSpeciesInfo[species].itemCommon` / `.itemRare`
(defined in `src/data/pokemon/species_info/gen_*_families.h`), read exclusively by
`SetWildMonHeldItem()` in `src/pokemon.c:6087` and displayed by dexnav in
`src/dexnav.c:1331`. Trainer/gift/static held items come from other sources
(`trainers.party`, scripts) and are NOT affected.

There is no engine config flag to disable wild held items globally, so the pipeline
must neutralize the per-species data. The randomizer already mutates the species_info
files at write time (`randomizer/pokemonWriter.js`), so this is the correct layer.

## Plan

Add a pure text transform `stripWildHeldItems(fileText)` to `randomizer/pokemonWriter.js`
that rewrites every `.itemCommon`/`.itemRare` line to `ITEM_NONE` (preserving indentation
and leaving an audit comment, consistent with the writer's `@PUPPED` style). Apply it to
every gen file inside `savePokemonData`, for every species (not gated on rebalance log).

TDD: unit tests for the transform first (Red), then implement (Green).

Acceptance criteria:
- [x] `stripWildHeldItems` rewrites both `.itemCommon` and `.itemRare` to `ITEM_NONE`
      regardless of the original item or whitespace alignment.
- [x] Lines that are not held-item fields are left untouched.
- [x] `savePokemonData` applies the strip to every gen file so ROM builds ship no wild items.
- [x] `cd randomizer && npm test` green.
- [ ] Manual (builder): built ROM shows wild Pokémon never hold an item.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Traced the only source of wild held items to
  `gSpeciesInfo.itemCommon/.itemRare` consumed by `SetWildMonHeldItem()` (wild-only) and
  dexnav. Confirmed the randomizer writer already owns mutation of species_info; no engine
  config flag exists to disable them. Chose a writer-layer text strip to `ITEM_NONE`.
- **2026-07-09** — TDD Red→Green: added `stripWildHeldItems` (pure text transform) to
  `randomizer/pokemonWriter.js` and wired it into `savePokemonData` after `editSpeciesFile`,
  applied to every gen file for every species. Marker comment `@PUPPED-NO-WILD-ITEMS (T-077)`
  carries NO reference to the stripped item so the old item name survives nowhere.
  New unit test `__tests__/unit/pokemonWriterHeldItems.test.js`. Full suite green (767 pass).
  End-to-end sanity: applied the transform in-memory to the real 9 gen files — 441 non-NONE
  held items before, 0 after. Pending: builder ROM build + manual in-game check.

## Outcome

All held items removed from wild Pokémon via the pokemon-writer transform (441→0 on the real 9 gen files); pokemonWriterHeldItems.test.js, suite 767 green. ROM-side verified via builder. Owner-validated 2026-07-15. Closed.
