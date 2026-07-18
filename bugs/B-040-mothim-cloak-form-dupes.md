---
id: B-040
title: Mothim appears as three cloak forms (Plant/Sandy/Trash) — only one Mothim exists
status: fixed
severity: major
created: 2026-07-18
updated: 2026-07-18
found-in: 0.9.0
fixed-in: 0.9.0
regression-test: randomizer/__tests__/unit/burmyOgerponForms.test.js
links: [T-157]
---

# B-040 — Mothim appears as three cloak forms

## Symptom

After T-157 re-enabled Burmy on the Deerling multi-form model, the randomizer/viewer shows THREE
Mothim ("Mothim", "Mothim Sandy", "Mothim Trash"). Mothim has no cloak forms — `SPECIES_MOTHIM_PLANT`,
`SPECIES_MOTHIM_SANDY`, `SPECIES_MOTHIM_TRASH` are byte-identical duplicates (all `= MOTHIM_SPECIES_INFO`,
and `SPECIES_MOTHIM` aliases `SPECIES_MOTHIM_PLANT`). All three Burmy cloaks should evolve into the one
base Mothim. (Wormadam is different: its three cloak forms are genuinely distinct types —
Grass/Steel, Ground/Steel, Bug/Steel — and must stay.)

Expected: one Mothim; Burmy Plant/Sandy/Trash all evolve (via Dawn Stone) into it.
Actual: three Mothim, one per cloak family (`P_FAMILY_BURMY`, `_SANDY`, `_TRASH`).

## Root cause

The Deerling-model split (T-157) derives a family per form suffix in `POKE_FORMS`. `SPECIES_MOTHIM_SANDY`/
`_TRASH` end in `_SANDY`/`_TRASH`, so they became their own families and each parsed as a distinct
species. A blanket natDexNum collapse can't be used (Wormadam's three real forms also share
`NATIONAL_DEX_WORMADAM`), so the collapse must target Mothim specifically.

## Fix

`randomizer/parser.js`:
- Added `SPECIES_MOTHIM_SANDY` / `SPECIES_MOTHIM_TRASH` to `REMOVED_SPECIES` so only the base Mothim
  (`SPECIES_MOTHIM_PLANT`, = `SPECIES_MOTHIM`) is parsed.
- Added `EVOLUTION_TARGET_ALIASES` ({MOTHIM_SANDY, MOTHIM_TRASH} → MOTHIM_PLANT), applied in `parseEvo`,
  so the Sandy/Trash Burmy stone-evolutions (whose targets are now removed) resolve to the one Mothim.
- Added a `DISPLAY_NAME_OVERRIDES` entry in `nameizyPokemonId` so the survivor renders as "Mothim",
  not "Mothim Plant".

Wormadam is untouched — its three forms are genuinely distinct types and remain. Result: Burmy line =
Burmy ×3 (cloaks) + Wormadam ×3 (real types) + Mothim ×1.

Regression test `randomizer/__tests__/unit/burmyOgerponForms.test.js` (annotated `B-040`): verified to
FAIL before the fix (three Mothim / stone-evo pointing at a dropped form) and PASS after. Full suite
green (1282).

Note (out of scope): `nameizyPokemonId` emits a double space between words (e.g. "Wormadam  Sandy");
harmless — HTML collapses it, so it's invisible on the site. Pre-existing; not changed here.
