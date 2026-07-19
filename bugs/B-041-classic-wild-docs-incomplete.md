---
id: B-041
title: Classic wild encounters show only one species per zone in the docs
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-19
updated: 2026-07-19
found-in: 0.6.0         # version where the bug was observed (T-162 classic mode)
fixed-in: 0.6.0
regression-test: randomizer/__tests__/unit/docsVisibility.test.js  # "B-041 — visible multi-species methods surface the full distinct list"
links: [T-162, T-163]
---

# B-041 — Classic wild encounters show only one species per zone in the docs

## Symptom

In **Classic** wild-encounter mode each zone/method holds several species (the "Pokémon per zone"
count), and the built ROM carries all of them — but the generated docs (Encounters tab, and the
Pokédex "obtainable" filter) show only ONE species per zone/method. The player can't see the full set
of Pokémon a route can give in Classic.

Reproduce: generate with `wildEncounterType: classic`, `pokemonPerZone: 5`, open the docs → every
route shows a single grass/surf/rod species instead of the ~5 it actually contains.

Expected: the docs list every species a zone/method can yield in Classic (deterministic mode, N=1, is
unchanged).

This was flagged as a known follow-up in `randomizer/docs/wild-encounters.md` ("Docs viewer shows the
representative pick … surfacing the full list is a follow-up"); the owner is now treating it as a bug.

## Root cause

`buildWildPlan` (`randomizer/modules/wildModule.js`) returns both `wildPlan[template] = [all N picks]`
and `replacementLog[template] = the first pick only` (representative, for back-compat). `writerDocs.js`
builds the docs encounter maps as `maps[method] = replacementLog[template]` — the single representative
— discarding the other N−1. The viewer therefore only ever sees one species per zone/method.

## Fix

`redactWildPokes` (`randomizer/docsVisibility.js`) now surfaces the full distinct pick list for every
**visible** wild method that holds more than one species, as `route.methodSpecies[method] = [id0…idN]`
(order-preserving, `id0 === route[method]`, the representative). Deterministic mode (one species) is
unchanged — no `methodSpecies` is added. Hidden methods (T-163) still become count placeholders and
never get a list.

The viewer (`frontend/template.html`) gained two shared helpers, `encounterSlots(route)` and
`slotSpecies(route, slot)`, that expand each method into one capturable slot per species — the
representative keeps the plain method slot key (back-compat with saved Nuzlocke state), extras get
`method#i`. The Encounters render, `getObtainableIds`, `getCapturedIds`, `getFaintedIds`,
`capturedEntries` and `findObtainable` all go through them, so every Classic species is shown, counted
as obtainable, and independently trackable; the existing one-capture-per-route radio picks which one
you caught. The DOM-driven visuals/handlers already key off each tile's own `data-slot`, so they
needed no change.

**Regression test** (`randomizer/__tests__/unit/docsVisibility.test.js`, "B-041 …"): a multi-species
`wildPlan` → `route.methodSpecies` lists every distinct species (representative first) while
`route[method]` stays the representative; single-species methods get no list; a hidden method never
gets one. Verified to FAIL before the fix (stash-revert of `docsVisibility.js` → the "surface the full
distinct list" assertion fails) and PASS after. End-to-end confirmed with a headless Classic fixture
(11 extra species tiles on Route 102, unique slot keys, one-per-route capture radio, zero JS errors).

Known follow-up unchanged: `replacementLog[template]` (the representative) is still used wherever a
single species is needed; the viewer's per-species expansion is docs-only.
