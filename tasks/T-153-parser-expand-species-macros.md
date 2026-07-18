---
id: T-153
title: Parser expands multi-line species-info C macros
status: in-progress
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [randomizer/parser.js]
blocked-by: []
---

# T-153 — Parser expands multi-line species-info C macros

## Context

Foundational prerequisite for re-enabling the removed cosmetic/alternate-form families
(T-154..T-157). Many of those families do **not** define their species with explicit
`.baseHP = …` fields; they use multi-line C macros, e.g.:

```c
[SPECIES_ARCEUS_NORMAL] = ARCEUS_SPECIES_INFO(TYPE_NORMAL, Normal, 1),
[SPECIES_MINIOR_METEOR_RED] = MINIOR_METEOR_SPECIES_INFO(Red),
[SPECIES_MOTHIM_PLANT] = MOTHIM_SPECIES_INFO,
[SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM] = ALCREMIE_REGULAR_SPECIES_INFO(Strawberry, VanillaCream, BODY_COLOR_WHITE),
```

[randomizer/parser.js](../randomizer/parser.js) `parseSpeciesFile` only recognizes struct-field
lines (`        .`) and only commits a species on its closing `    },`. A one-line macro
invocation has neither, so the species is parsed as a bare header and silently discarded
(the next `[SPECIES_...]` overwrites it). This is why these families never surfaced.

Affected macros (all in currently **removed** families → zero blast radius on active output,
verified: every macro-defined species belongs to a removed family):
`UNOWN_MISC_INFO`, `FURFROU_MISC_INFO`, `SCATTERBUG_SPECIES_INFO`, `SPEWPA_SPECIES_INFO`,
`GENESECT_SPECIES_INFO`, `ARCEUS_SPECIES_INFO`, `MINIOR_METEOR_SPECIES_INFO`,
`MINIOR_CORE_SPECIES_INFO`, `MOTHIM_SPECIES_INFO`, `ALCREMIE_REGULAR_SPECIES_INFO`,
`OGERPON_SPECIES_INFO` (and `SILVALLY`/Type:Null, left removed — out of scope).

Some macros carry meaningful data as **parameters** the body substitutes, e.g.
`OGERPON_SPECIES_INFO(Teal, Teal, TYPE_GRASS, ABILITY_DEFIANT, …)` → `.types = MON_TYPES(TYPE_GRASS, type)`,
`.abilities = { ability, ABILITY_NONE }`; `ARCEUS_SPECIES_INFO(TYPE_NORMAL, …)` → `.types = MON_TYPES(type)`.
So expansion must do textual parameter substitution, not just inline a fixed body.

## Plan

Teach `parseSpeciesFile` (or a pre-pass) to:
1. Capture `#define NAME(params) { … }` and paramless `#define NAME { … }` species-info macro
   definitions — multi-line, joined across `\` line-continuations.
2. When a species header line is `[SPECIES_X] = NAME(args),` (or `= NAME,`), substitute
   `params → args` textually in the captured body and feed the resulting field lines through the
   existing per-property parsing path, exactly as if they had been written inline.
3. Only the parser's `SUPPORTED_PROPERTIES` (+ evolutions, natDexNum) need to resolve; other macro
   lines (sprites, footprints, `OVERWORLD(...)`) are ignored as today. `catchRate`/`expYield` remain
   `FIXED_PROPERTIES` overrides, so ternary/exp expressions in macro bodies are irrelevant.

This task does NOT remove anything from `REMOVED_FAMILIES` — it only makes macro species parseable.
Families stay removed until their own task re-enables them.

Acceptance criteria:
- [x] Unit test: a parameterized macro fixture (`FOO_SPECIES_INFO(TYPE_X, ability)` style) parses
      correct base stats, `types`, `abilities`, `speciesName`, `levelUpLearnset`, `teachableLearnset`,
      `natDexNum` after substitution.
- [x] Unit test: a paramless macro (`MOTHIM_SPECIES_INFO`) parses correctly.
- [x] Regression: inline (non-macro) species parse identically to before (existing fixtures unchanged).
- [x] `cd randomizer && npm test` green.
- [x] (Beyond plan) Recursive expansion of nested brace-less fragment macros (`MINIOR_MISC_INFO`,
      `ALCREMIE_MISC_INFO`, `ARCEUS_ICON`) and fragment macros invoked inside inline structs
      (Vivillon's `VIVILLON_MISC_INFO`); C token-paste `##` resolved in expanded lines.

## Progress log

<!-- Append-only. -->

- **2026-07-18** — Task created. Investigation confirmed macro expansion is the shared blocker and
  that all macro-defined species live in removed families (safe to add).
- **2026-07-18** — Implemented (TDD, `randomizer/__tests__/unit/parseSpeciesMacros.test.js`).
  `parseSpeciesInfoMacros` captures every `\`-continued `#define` whose body sets a `.field`;
  `expandMacroBody` substitutes params (longest-name-first to avoid prefix shadowing), recursively
  expands nested fragment invocations, and resolves `##`; header-line invocations (`= FOO(...)`) and
  bare fragment invocations inside inline structs are both spliced into the line stream so the
  existing per-field parser handles them. Smoke-tested against real Arceus/Minior/Alcremie/Ogerpon/
  Scatterbug-Spewpa-Vivillon/Furfrou/Genesect blocks (renamed out of REMOVED_FAMILIES): all parse
  full stats/types/abilities/learnsets/natDexNum; evo targets resolve `##` correctly. Full suite
  green (1252 tests). No family removed from `REMOVED_FAMILIES` yet — that is T-154..T-157.

## Outcome

<!-- Filled when closing. -->
