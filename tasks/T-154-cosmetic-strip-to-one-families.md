---
id: T-154
title: Re-enable cosmetic families, stripped to one form each
status: proposed
type: feature
created: 2026-07-18
updated: 2026-07-18
target-version: 0.9.0
links: [randomizer/parser.js, randomizer/modules/pokedexModule.js]
blocked-by: [T-153]
---

# T-154 — Re-enable cosmetic families, stripped to one form each

## Context

Re-enable families whose alternate forms are **purely cosmetic** (identical stats/type/ability),
keeping exactly ONE representative per evolution stage. Owner requirement: cosmetic forms must NOT
randomize independently and must NOT bloat the docs (Alcremie alone has 63 forms).

Families in scope (owner's items 1, 5, 6, 7, 9 — "same treatment as Unown"):
- `P_FAMILY_UNOWN` — 28 forms (A + B..Z, `!`, `?`) → keep `SPECIES_UNOWN`.
- `P_FAMILY_SCATTERBUG` — Scatterbug/Spewpa/Vivillon × 20 patterns → keep the ICY_SNOW line (3 species).
- `P_FAMILY_FLABEBE` — Flabébé/Floette/Florges × colors (+ Floette Eternal) → keep the RED line (3 species).
- `P_FAMILY_FURFROU` — 10 trims → keep `SPECIES_FURFROU_NATURAL`.
- `P_FAMILY_MILCERY` — Milcery + 63 Alcremie flavors → keep Milcery + `SPECIES_ALCREMIE_STRAWBERRY_VANILLA_CREAM`.

Key facts from investigation:
- Wild/trainer/starter dedup already collapses all these forms to one family group (their suffixes
  are NOT in `POKE_FORMS`, so they all stay in the base `P_FAMILY_*`). The remaining problem is the
  **docs**: `writer.js`/`pokedexModule.js` emit exactly one entry **per parsed species** — no
  natDexNum/family collapse exists. So without a strip, re-enabling would emit dozens/hundreds of
  identical entries.
- Depends on T-153: Unown/Furfrou/Scatterbug/Spewpa/Alcremie are macro-defined and only parse once
  T-153 lands. (Vivillon, Flabébé line, Milcery-base are already full-struct.)

## Plan

Introduce a `COSMETIC_FAMILIES` set in the parser. Within such a family, keep only the **first
species seen per `natDexNum`** and skip the rest. Skip at the point the `natDexNum` field is parsed
(null out `currentPokemon`, mirroring `REMOVED_SPECIES`) so skipped siblings never register an
evolution and the `evoTree` stays clean. (Verify `natDexNum` is parsed before `.evolutions` for the
evo-chain families Scatterbug/Spewpa and Flabébé/Floette; if not, strip in a post-pass that also
rebuilds those families' evo entries.) Then remove the five families from `REMOVED_FAMILIES`.

Acceptance criteria:
- [ ] Each family surfaces exactly one species per stage: Unown 1, Furfrou 1, Scatterbug line 3,
      Flabébé line 3, Milcery+Alcremie 2.
- [ ] `node analyze.js` / the docs build produce a sane `pokes.js` (no hundreds of cosmetic entries)
      and the viewer/docs still render.
- [ ] Evolution chains intact: Scatterbug→Spewpa→Vivillon, Flabébé→Floette→Florges, Milcery→Alcremie.
- [ ] The kept representative is consistent across stages (same pattern/color), so evos link correctly.
- [ ] New unit tests cover the strip (kept count per family + evo chain); `cd randomizer && npm test` green.

## Progress log

- **2026-07-18** — Task created.

## Outcome
