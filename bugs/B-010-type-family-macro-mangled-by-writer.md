---
id: B-010
title: Rebalancing a config-driven family-type Pokémon writes an undefined TYPE_ macro, breaking make
status: fixed
severity: major
created: 2026-06-28
updated: 2026-06-28
found-in: 0.3.0
fixed-in: 0.4.0
regression-test: randomizer/__tests__/unit/parseMonTypes.test.js
links: [T-031]
---

# B-010 — Rebalancing a config-driven family-type Pokémon writes an undefined TYPE_ macro, breaking make

## Symptom

A real ROM build failed at compile time (recovered from the persistent build log, T-033):

```
src/data/pokemon/species_info/gen_3_families.h:2747:24:
error: 'TYPE_RALTS_FAMILY_TYPE2' undeclared here (not in a function)
  .types = MON_TYPES(TYPE_FIRE, TYPE_RALTS_FAMILY_TYPE2), // @PUPPED-AUTO-BALANCE #SPECIES_KIRLIA
  -- previous line was >> .types = MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2),
make: *** [Makefile:405: build/modern/src/pokemon.o] Error 1
```

Intermittent: only when the rebalancer changes the type of a Pokémon whose secondary type is a
config-driven family macro (the Ralts family — Ralts/Kirlia/Gardevoir/Gallade — and the Togepi
family). (Site stayed up and the request went to `failed` thanks to B-008.)

## Root cause

Upstream pokeemerald-expansion defines config-driven family type **macros** inside the species_info
`.h` files, e.g. `#define RALTS_FAMILY_TYPE2 (P_UPDATED_TYPES >= GEN_6 ? TYPE_FAIRY : TYPE_PSYCHIC)`,
and uses them as a type: `MON_TYPES(TYPE_PSYCHIC, RALTS_FAMILY_TYPE2)`. These are NOT `TYPE_` constants.

The randomizer parsed types by only stripping a leading `TYPE_`
([modules/pokedexModule.js](../randomizer/modules/pokedexModule.js)), so `parsedTypes` kept the raw
macro token `RALTS_FAMILY_TYPE2`. When the rebalancer changed the species' type, the writer
([pokemonWriter.js](../randomizer/pokemonWriter.js)) re-emitted every type as `TYPE_${t.toUpperCase()}`
→ `TYPE_RALTS_FAMILY_TYPE2`, which is undefined → `make` fails. (The original line compiled because the
macro is defined in-file; the writer only rewrote the line when that species got a type change.)

## Fix

- **Root (parser):** new `parser.parseMonTypes()` resolves family-type macros to concrete types via
  `constants.FAMILY_TYPE_MACROS` (both resolve to `FAIRY` under the shipped `P_UPDATED_TYPES =
  GEN_LATEST`). `pokedexModule` uses it, so the rater/rebalancer/writer only ever see real types — which
  also fixes the *rating* of these families (previously a garbage second type).
- **Defense-in-depth (writer):** `editSpeciesFile` now emits any non-`POKEMON_TYPES` token verbatim
  (with a warning) instead of prepending `TYPE_`, so an unmapped future macro can never break the build.
- **Deploy:** `deploy/update.sh` now runs `node build.js` before rsync, so the browser bundle
  (`randomizer.bundle.js`, which embeds the parser) can't lag the source.

Regression tests: `randomizer/__tests__/unit/parseMonTypes.test.js` (macro resolution) and
`randomizer/__tests__/unit/pokemonWriterTypes.test.js` (writer verbatim guard) — both FAIL before the
fix and PASS after. Randomizer suite 470/470.
