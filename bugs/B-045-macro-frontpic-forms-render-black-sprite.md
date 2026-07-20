---
id: B-045
title: Docs render a black sprite for every form whose .frontPic lives in a C macro body
status: fixing          # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-20
updated: 2026-07-20
found-in: 0.5.0         # version where the bug was observed
fixed-in:               # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/spriteMapper.test.js  # "…(B-045)" describes + writer.test.js "fallback uses the override-aware base name"
links: [B-043, T-170]   # B-043 fixed the name at source; this is the sprite defect + its residual name-leak surfaces
---

# B-045 — Docs render a black sprite for every form whose .frontPic lives in a C macro body

## Symptom

In the generated docs (viewer / `out.html`), several Pokémon show a **black box** instead of their
sprite. Every affected species is one whose `.frontPic` is declared **inside a C `#define … _INFO(…)`
macro body** rather than directly in its `[SPECIES_X]` initializer. 18 kept species are affected:

- Cosmetic families collapsed to one representative: `SPECIES_UNOWN`, `SPECIES_SCATTERBUG_ICY_SNOW`,
  `SPECIES_SPEWPA_ICY_SNOW`, `SPECIES_VIVILLON_ICY_SNOW`, `SPECIES_FLABEBE_RED`, `SPECIES_FLOETTE_RED`,
  `SPECIES_FLORGES_RED`, `SPECIES_FURFROU_NATURAL`, `SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM`,
  `SPECIES_MOTHIM_PLANT`, `SPECIES_GENESECT`
- Other kept macro forms: `SPECIES_ARCEUS_NORMAL`, `SPECIES_SILVALLY_NORMAL`,
  `SPECIES_MINIOR_METEOR_RED`, `SPECIES_OGERPON_TEAL`, `SPECIES_OGERPON_WELLSPRING`,
  `SPECIES_OGERPON_HEARTHFLAME`, `SPECIES_OGERPON_CORNERSTONE`

Expected: each renders its base sprite (the macro's `.frontPic` already points at the correct base
art, e.g. `SPECIES_VIVILLON_ICY_SNOW` → `graphics/pokemon/vivillon/anim_front.png`, which *is* the
base Vivillon pattern). Actual: `frontend/data/sprites.json` contains **no key** for any of them, so
`getPokeImg` falls back to `BLANK_SPRITE` (black box).

Reproduce: regenerate sprites and check coverage —

```
node -e "const {generateSprites}=require('./randomizer/generateSprites'); generateSprites();"
node -e "const s=require('./frontend/data/sprites.json'); console.log('VIVILLON_ICY_SNOW' in s.pokemon, 'UNOWN' in s.pokemon)"
# → false false   (both MISSING → black box in docs)
```

**Secondary symptom (residual name leak).** B-043 fixed the display *name* at source (`poke.name`
via `DISPLAY_NAME_OVERRIDES`, consumed by the Pokédex card title), but three doc surfaces plus a
writer fallback still re-derive the name from the **raw species id**, so a collapsed cosmetic form
leaks its suffix ("Vivillon Icy Snow") when it appears there:

- trainer roster rows — `frontend/template.html` (~1613, and the `alt`/pname at ~1667/1669)
- wild encounters (Nuzlocke) — `frontend/template.html` (~1876)
- evolution-chain links — `frontend/template.html` (~2109)
- trainer fallback name — `randomizer/writer.js` (~280)

Each of these also calls `getPokeImg(pokeId)`, so they render the black sprite too.

## Root cause

<!-- Filled during the fix. The real cause, not the patch. -->

`spriteMapper.parseSpeciesFrontPic` slices the gen-family text on `[SPECIES_X]` boundaries and matches
`.frontPic = gMonFrontPic_…` **within the slice only**. For the affected species the `.frontPic` is
inside the invoked macro's `#define` body (e.g. `VIVILLON_MISC_INFO`, `FLABEBE_MISC_INFO`,
`OGERPON_SPECIES_INFO`), often with a token-paste (`gMonFrontPic_Vivillon##form`). The slice contains
only the macro *invocation*, so no match is found and the species is silently dropped from
`buildSpeciesSpriteMap` (it lands in neither `map` nor `unresolved`) — `generateSprites` embeds
nothing for it.

The residual name leak is because B-043 corrected only `poke.name`; the roster/wild/evolution/writer
surfaces bypass it and re-derive from the id.

## Fix

Fixed under T-170.

**Sprite (root cause).** `randomizer/spriteMapper.js` now pre-parses the frontPic-declaring `#define`
macros (`parseFrontPicMacros`) — capturing the base `gMonFrontPic_*` symbol and any `##param`
token-paste — and `parseSpeciesFrontPic` resolves a species with no inline `.frontPic` through the
macro it invokes, substituting the paste parameter from the invocation arguments. All 18 species now
resolve to their base art; `generateSprites` embeds them (Pokémon-sprite count 1283 → 1521).

**Residual name leak.** The three re-derive surfaces now use the override-aware parsed name:
`frontend/template.html` trainer roster (`_trainerPoke.name`), wild encounters (`poke.name`) and
evolution links (`evoPoke.name`); `randomizer/writer.js` fallback uses `nameizyPokemonId`. (Depends on
B-046, which fixed the double-space that `nameizyPokemonId` produced for the writer fallback.)

Regression tests (verified FAIL before / PASS after): `randomizer/__tests__/unit/spriteMapper.test.js`
(`parseFrontPicMacros`, `parseSpeciesFrontPic — macro-body .frontPic`, `buildSpeciesSpriteMap — macro
forms end-to-end` — all tagged B-045) and `randomizer/__tests__/unit/writer.test.js` (`fallback uses
the override-aware base name for a collapsed cosmetic form`). End-to-end confirmed in the rendered doc
via Playwright: `getPokeImg('SPECIES_VIVILLON_ICY_SNOW')` returns a real data URI and the name renders
as "Vivillon" (no "Icy Snow"), across all checked cosmetic reps, with zero page errors.
