---
id: B-025
title: Writer drops the `\` line-continuation of held-item fields inside #define species macros, corrupting gSpeciesInfo[]
status: fixing          # open | fixing | fixed | wont-fix
severity: critical      # a single affected species aborts the whole ROM build
created: 2026-07-10
updated: 2026-07-10
found-in: Unreleased
fixed-in:
regression-test: randomizer/__tests__/unit/pokemonWriterHeldItems.test.js
links: [B-010]
---

# B-025 — Writer drops the `\` line-continuation of held-item fields inside #define species macros

## Symptom

A production ROM build (job `baaa6730-00cf-457d-8d50-64b15eb54ec7`, 2026-07-10) failed in the
`make` compilation stage. `gcc` reported a cascade of errors in
`src/data/pokemon/species_info/gen_4_families.h` starting at line 2228, all treated as fatal by
`-Werror`:

```
gen_4_families.h:2228:9: error: field name not in record or union initializer
   note: (near initialization for 'gSpeciesInfo')     ← no [index]: the array element was lost
...
gen_4_families.h:2277:5: error: expected ',' or ';' before '[' token   ([SPECIES_MOTHIM_PLANT] = ...)
cc1: all warnings being treated as errors
make: *** [Makefile:404: build/modern/src/pokemon.o] Error 1
Pipeline failed: make exited with code 2
```

No ROM was produced (`backend/data/outputs/<job>/` stayed empty). The bundle is clean input — the
corruption is introduced by the writer.

## Root cause

`stripWildHeldItems()` (T-077, `randomizer/pokemonWriter.js`) neutralizes every wild held item by
rewriting each `.itemCommon`/`.itemRare = ITEM_X,` line to `ITEM_NONE`. It runs a **blind regex over
the whole file text**, line by line, and its replacement ended each rewritten line with a `//`
comment and **no trailing `\`**.

Most held-item fields sit inside ordinary `[SPECIES_X] = { ... }` entries (no line continuation), so
this was invisible. But two of them live inside **multi-line `#define ..._SPECIES_INFO` / `..._MISC_INFO`
macros** used for form species, where every body line ends in a `\` continuation:

- `gen_4_families.h:2227` — `.itemRare = ITEM_SILVER_POWDER,  \` inside `#define MOTHIM_SPECIES_INFO`
- `gen_7_families.h:4455` — `.itemRare = ITEM_STAR_PIECE,  \` inside `#define MINIOR_MISC_INFO(color)`

Dropping the `\` terminates the `#define` early — before its closing `}` — so the macro expands to an
unclosed `{ ... .itemRare = ITEM_NONE,` and every line after it (`.genderRatio`, …, up to the real
`}`) becomes loose code inside the `gSpeciesInfo[]` array initializer. That is the exact
"field name not in record" flood the compiler reported, starting one line below the broken field.

This is the same class of defect as [B-010](B-010-type-family-macro-mangled-by-writer.md): a writer
line-rewrite that does not account for `#define` macro bodies.

Why it surfaced now: this session's config keeps the Burmy family's C flag (`P_FAMILY_BURMY`) enabled
even though the family was cut from the randomizer dex, so the broken Mothim macro was compiled in.
The defect, however, is unconditional — the writer must never emit a broken `#define`.

A full-file scan of the real bundle through `editSpeciesFile()` + `stripWildHeldItems()` across gens
1–9 confirmed **exactly these two** corruptions and **zero** from `editSpeciesFile()`; the fix is
therefore isolated to `stripWildHeldItems()`.

## Fix

`stripWildHeldItems()` now detects a trailing `\` on the original line and, when present, re-emits the
continuation and annotates with a block comment (`/* ... */`) instead of `//` — a `//` comment before
a `\` would itself swallow the next macro line. Non-macro lines keep the existing `//` annotation.

Regression test: `randomizer/__tests__/unit/pokemonWriterHeldItems.test.js` — reproduces the
`MOTHIM_SPECIES_INFO` macro block, asserts the held item is neutralized **and** the `\` continuation
is preserved (fails before the fix, passes after).
