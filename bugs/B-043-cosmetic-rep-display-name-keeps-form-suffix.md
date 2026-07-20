---
id: B-043
title: Cosmetic-family kept representative still shows its form suffix in the docs
status: fixed           # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-07-20
updated: 2026-07-20
found-in: 0.9.0         # version where the bug was observed (T-154 cosmetic strip)
fixed-in: 0.9.0         # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/cosmeticFamilyStrip.test.js  # "B-043 — kept cosmetic representatives display as their base name"
links: [T-154, B-040]   # T-154 introduced the strip; B-040 is the DISPLAY_NAME_OVERRIDES precedent
---

# B-043 — Cosmetic-family kept representative still shows its form suffix in the docs

## Symptom

T-154 collapsed each cosmetic family to a single representative per evolution stage (the first
species declared per `natDexNum`). The strip itself works — only one entry survives per stage — but
the **display name** in the generated docs (`pokes.js` / viewer) is derived from the surviving
species **id** via `nameizyPokemonId`, so it keeps the form suffix instead of the base name.

Because the first-declared Scatterbug/Spewpa/Vivillon form is the `ICY_SNOW` line, the docs show:

- `SPECIES_SPEWPA_ICY_SNOW` → **"Spewpa Icy Snow"** (expected: **"Spewpa"**)
- `SPECIES_SCATTERBUG_ICY_SNOW` → "Scatterbug Icy Snow" (expected: "Scatterbug")
- `SPECIES_VIVILLON_ICY_SNOW` → "Vivillon Icy Snow" (expected: "Vivillon")
- `SPECIES_FLABEBE_RED` / `_FLOETTE_RED` / `_FLORGES_RED` → "Flabebe Red" … (expected: "Flabebe" / "Floette" / "Florges")
- `SPECIES_FURFROU_NATURAL` → "Furfrou Natural" (expected: "Furfrou")
- `SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM` → "Alcremie Strawberry Vanilla Cream" (expected: "Alcremie")

This is wrong on two counts: (1) T-154's intent was that cosmetic forms disappear leaving only the
base, so the base name should be shown; (2) "Icy Snow" is a **Vivillon-only** wing pattern — it is
not a visible Scatterbug/Spewpa form, so "Spewpa Icy Snow" names a form that does not exist in-game.

The species' own `.speciesName` field is already correct (`_("Spewpa")`); only the id-derived
display `name` carries the suffix. `SPECIES_UNOWN` and `SPECIES_MILCERY` are unaffected because their
kept representative is the base id (no suffix).

Reproduce: `grep '"name":' randomizer/output/pokes.js` (or the viewer) after a run — the entries
above show the suffixed name.

Scope note: Arceus Normal and Silvally Normal (T-156/T-158, same COSMETIC_FAMILIES mechanism) have
the identical defect but are **out of scope** for this bug per owner decision — they are type forms,
not cosmetic ones. A separate, pre-existing double-space quirk in `nameizyPokemonId` for any
multi-word name ("Nidoran  F", "Mr  Mime") is also out of scope.

## Root cause

The docs display name is derived from the species **id** via `nameizyPokemonId` (used by
`pokedexModule.js` as `name: parser.nameizyPokemonId(poke.id)`), never from the parsed `.speciesName`.
T-154's cosmetic strip keeps the first-declared form per stage, whose id is a suffixed variant
(`SPECIES_SPEWPA_ICY_SNOW`), so the suffix survives into the display name even though the strip
collapsed the family to one entry. The mechanism for exactly this "id-derived name would mislead"
case already existed (`DISPLAY_NAME_OVERRIDES`, added by B-040 for Mothim) but had no entries for the
T-154 representatives.

## Fix

Added the eight kept cosmetic representatives to `DISPLAY_NAME_OVERRIDES` in `randomizer/parser.js`
(Scatterbug/Spewpa/Vivillon Icy-Snow → base; Flabébé/Floette/Florges Red → base; Furfrou Natural →
Furfrou; Alcremie Strawberry-Vanilla-Cream → Alcremie). Unown and Milcery keep the base id already, so
they need no entry; Arceus Normal / Silvally Normal are type forms (not cosmetic) and are left
id-derived per owner decision. Regression test `randomizer/__tests__/unit/cosmeticFamilyStrip.test.js`
("B-043 — kept cosmetic representatives display as their base name") reproduces the symptom: verified
FAIL before (`"Scatterbug  Icy  Snow"`) and PASS after. End-to-end confirmed by regenerating the docs
(`node analyze.js --no-balance`): `pokes.js` now renders the plain base names. Introduced by T-154.
