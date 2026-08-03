---
id: B-059
title: "Viewer sprites ignore a form's `.palette`, so Squawkabilly and Deerling forms all render in the base form's colours"
status: open
severity: minor
created: 2026-08-02
updated: 2026-08-02
found-in: 0.5.0
fixed-in:
regression-test:
links: [B-045, T-170]
---

# B-059 — Viewer form sprites ignore the per-form palette

## Symptom

Found by the owner while comparing an injected ROM against its own docs (bundle `2653882998`,
2026-08-02): the Dewford trade card in `rom-1.html` shows a **green** Squawkabilly, and the game hands
over a **yellow** one.

The game is right and the docs are wrong. Both the ROM and the docs' *data* say
`SPECIES_SQUAWKABILLY_YELLOW` (`tradesInfo`, the Route 101 card, and the ROM's `gIngameTrades` all
agree); only the **image** on the card is the wrong colour. So this is a viewer/docs defect and has
nothing to do with base+injection — a compiled ROM's docs have always looked the same.

Confirmed in the generated HTML: all four Squawkabilly forms are embedded under their own keys
(`SQUAWKABILLY_GREEN`, `_BLUE`, `_YELLOW`, `_WHITE`) but every one of them holds the **same** image
(sha `1128ae6e5597`, 862 chars each). The trade card asks for the right key; the map hands back one
picture for the whole family.

## Root cause

In `species_info`, these forms **share one `.frontPic` and differ only by `.palette`**:

```c
[SPECIES_SQUAWKABILLY_GREEN]  = { .frontPic = gMonFrontPic_Squawkabilly, .palette = gMonPalette_SquawkabillyGreen,  … }
[SPECIES_SQUAWKABILLY_YELLOW] = { .frontPic = gMonFrontPic_Squawkabilly, .palette = gMonPalette_SquawkabillyYellow, … }
```

The game draws the same pixels with a different palette. `randomizer/spriteMapper.js` only ever parses
`gMonFrontPic_*` symbols → a PNG path, and never looks at `.palette`; the PNG on disk
(`graphics/pokemon/squawkabilly/front.png`) already has the family's **default** palette baked in, which
is Green's — the per-form palettes live in subfolders (`squawkabilly/yellow/normal.pal`, …). So every
form resolves to the same file and renders in the base form's colours.

**Scope is exactly two families, eight species.** Of the 20 families whose embedded form sprites are
identical, 18 are correctly identical — Spewpa's 19 Vivillon patterns, the Totem forms
(Araquanid/Gumshoos/Kommo-o/Lurantis/Ribombee/Salazzle), the tea forms (Sinistea/Poltea/Poltchageist/
Sinistcha), Mothim's cloaks, Genesect's drives, Rockruff — because those share the palette *as well as*
the picture. Only two share a picture while having different palettes:

| family | forms | palettes |
|---|---|---|
| `SQUAWKABILLY` | 4 | Green, Blue, Yellow, White |
| `DEERLING` | 4 | Spring, Summer, Autumn, Winter |

(Deerling is the worse of the two in practice: the four seasonal forms are indistinguishable in the docs,
and unlike Squawkabilly there is no colour in the name to fall back on.)

The query that produced that table is worth keeping — after an upstream sync, any newly-added family with
one `frontPic` and several `.palette`s joins this bug automatically: for every species, compare the set of
`.frontPic` symbols against the set of `.palette` symbols within a family; one pic + many palettes is the
signature.

## Fix

<!-- Filled during the fix. Planned: give the sprite pipeline the `.palette` symbol as well as the
     `.frontPic` one, and when a form's palette is not the one baked into its frontPic PNG, re-index the
     sprite against that form's own `.pal` (graphics/pokemon/<family>/<form>/normal.pal). spriteImage.js
     already rebuilds a palette and emits an indexed PNG, so the machinery is there — what is missing is
     the mapping from species → palette file.

     Regression test: generate the sprite set and assert the four SQUAWKABILLY and four DEERLING images
     are pairwise DISTINCT (and, as a control, that Spewpa's stay identical). Fails today, passes after
     the fix. Docs-only defect, so no ROM re-snapshot is involved. -->
